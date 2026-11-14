import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {catalog} from '../commerce/catalog.mjs';
import {quote,normalizeItems,customer} from '../commerce/core.mjs';
import {createShop} from '../commerce/api.mjs';
import {sqliteStore} from '../commerce/store.mjs';
import {mollieProvider} from '../commerce/mollie.mjs';
// Synthetic prices are isolated test fixtures; never imported into the build or runtime catalog.
const fixture=()=>{const c=structuredClone(catalog);c.salesEnabled=true;c.shipping.NL={grossCents:605,vatBps:2100};for(const p of c.products){if(p.variants.length){p.status='available';p.variants[0].grossCents=1210;p.variants[0].vatBps=2100;}}return c;};
const item=(text='Marie-Lou',quantity=1)=>({productId:'de-klok',variantId:'persoonlijk',personalization:text,quantity});
test('Missing product/tax/shipping values never become free checkout',()=>{const q=quote([item()],'NL',catalog);assert.equal(q.grossCents,null);assert.equal(q.checkoutAllowed,false);assert.equal(q.missing.length,2);});
test('VAT including shipping and quantities calculated in cents',()=>{const q=quote([item('A',3)],'NL',fixture());assert.equal(q.subtotalCents,3630);assert.equal(q.grossCents,4235);assert.equal(q.netCents,3500);assert.equal(q.vatCents,735);assert.equal(q.checkoutAllowed,true);});
test('Rounding remains consistent at line level',()=>{const c=fixture();c.products[0].variants[0].grossCents=1999;const q=quote([item('A',3)],'NL',c);assert.equal(q.netCents+q.vatCents,q.grossCents);assert.equal(q.lines[0].netCents,4956);});
test('Client prices are ignored',()=>{const q=quote([{...item(),grossCents:1,vatBps:0}],'NL',fixture());assert.equal(q.subtotalCents,1210);});
test('Identical personalizations merge, different personalizations stay distinct',()=>{const r=normalizeItems([item('A'),item('A',2),item('B')],fixture());assert.equal(r.length,2);assert.equal(r[0].quantity,3);});
test('Invalid product, variant, quantities, country and personalization rejected',()=>{for(const change of [{productId:'fake'},{variantId:'fake'},{productId:'de-wijnset'},{quantity:0},{quantity:-1},{quantity:1.5},{quantity:21},{quantity:'2'},{personalization:''},{personalization:'A'.repeat(121)},{personalization:'a\nb'}])assert.throws(()=>quote([{...item(),...change}],'NL',fixture()));assert.throws(()=>quote([item()],'BE',fixture()));assert.throws(()=>quote([item('A',20),item('A')],'NL',fixture()));});
test('Customer validation rejects invalid delivery data',()=>{assert.throws(()=>customer({}));assert.throws(()=>customer({name:'a',email:'bad',street:'a',postalCode:'1234AB',city:'a',country:'NL'}));});
test('Mollie adapter rejects live keys before any network request',()=>{assert.throws(()=>mollieProvider('live_never'));});
test('Mollie payload contains server amount, stable idempotency and test guard',async()=>{let sent;const provider=mollieProvider('test_fixture',async(url,options)=>{sent={url,...options};return Response.json({id:'tr_mock123',mode:'test',_links:{checkout:{href:'https://www.mollie.com/checkout/test'}}});});const o={id:'a'.repeat(64),data:{quote:{grossCents:1815}}};await provider.create(o,'https://staging.example.test','token');assert.equal(JSON.parse(sent.body).amount.value,'18.15');assert.equal(sent.headers['Idempotency-Key'],o.id);assert.equal(JSON.parse(sent.body).metadata.orderId,o.id);});
test('Checkout, durable storage, retries, verified webhook, protected confirmation',async()=>{
 const dir=await mkdtemp(tmpdir()+'/rumaz-test-');let store=await sqliteStore(dir+'/orders.db');
 const origin='https://staging.example.test';let created=0,lastOrder,paymentStatus='open';
 const provider={async create(order){created++;lastOrder=order;return {id:'tr_mock123',url:'https://www.mollie.com/checkout/test'};},async get(id){return {id,mode:'test',status:paymentStatus,metadata:{orderId:lastOrder.id},amount:{currency:'EUR',value:'18.15'}};}};
 const secret='x'.repeat(64);let app=createShop({catalog:fixture(),store,provider,secret,origin,testEnabled:true});
 const payload={items:[item()],customer:{name:'Test',email:'test@example.test',street:'Teststraat 1',postalCode:'1234 AB',city:'Test',country:'NL'},acceptedTerms:true,idempotencyKey:'a'.repeat(64)};
 const post=(path,b,headers={})=>app(new Request(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(b)}));
 try{
  let r=await post('/api/checkout',payload);assert.equal(r.status,200);assert.equal(created,1);
  r=await post('/api/checkout',payload);assert.equal(r.status,200);assert.equal(created,1);
  r=await post('/api/checkout',{...payload,items:[item('Changed')]});assert.equal(r.status,409);
  r=await post('/api/checkout',payload,{Origin:'https://evil.test'});assert.equal(r.status,403);
  store.close();store=await sqliteStore(dir+'/orders.db');assert.equal((await store.get(lastOrder.id)).data.customer.name,'Test');
  app=createShop({catalog:fixture(),store,provider,secret,origin,testEnabled:true});
  paymentStatus='paid';r=await post('/api/payment-webhook',{id:'tr_mock123'});assert.equal(r.status,200);assert.equal((await store.get(lastOrder.id)).status,'paid');
  r=await post('/api/payment-webhook',{id:'tr_mock123'});assert.equal(r.status,200);
  paymentStatus='open';await post('/api/payment-webhook',{id:'tr_mock123'});assert.equal((await store.get(lastOrder.id)).status,'paid');
  r=await app(new Request(origin+'/api/order/'+lastOrder.id));assert.equal(r.status,404);
  const {createHmac}=await import('node:crypto');const t=createHmac('sha256',secret).update(lastOrder.id).digest('hex');
  r=await app(new Request(origin+'/api/order/'+lastOrder.id,{headers:{Authorization:'Bearer '+t}}));assert.equal(r.status,200);const j=await r.json();assert.equal(j.status,'paid');assert.equal(j.customer,undefined);
 }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
test('Unverified payment amount does not mark an order paid',async()=>{
 const store=await sqliteStore(':memory:');const origin='https://staging.example.test';const q=quote([item()],'NL',fixture());const row=await store.create({id:'a'.repeat(64),request_hash:'hash',created_at:Date.now(),data:{quote:q}});await store.attach(row.id,'tr_mock123',null);
 const provider={get:async()=>({id:'tr_mock123',mode:'test',metadata:{orderId:row.id},status:'paid',amount:{currency:'EUR',value:'0.01'}})};
 const app=createShop({catalog:fixture(),store,provider,origin,secret:'a'.repeat(64),testEnabled:true});
 const r=await app(new Request(origin+'/api/payment-webhook',{method:'POST',body:'id=tr_mock123'}));assert.equal(r.status,409);assert.equal((await store.get(row.id)).status,'created');store.close();
});
test('Disabled checkout never contacts payment provider',async()=>{const app=createShop({catalog,origin:'http://localhost',testEnabled:false});const r=await app(new Request('http://localhost/api/checkout',{method:'POST',headers:{Origin:'http://localhost'},body:'{}'}));assert.equal(r.status,503);});
test('A delayed webhook cannot erase an existing checkout URL',async()=>{
 const store=await sqliteStore(':memory:');
 try {
  await store.create({id:'race-order',request_hash:'hash',data:{},created_at:Date.now()});
  await store.attach('race-order','tr_mock123','https://www.mollie.com/checkout/test');
  await store.attach('race-order','tr_mock123',null);
  assert.equal((await store.get('race-order')).checkout_url,'https://www.mollie.com/checkout/test');
  await assert.rejects(()=>store.attach('race-order','tr_other123',null));
 } finally { store.close(); }
});
