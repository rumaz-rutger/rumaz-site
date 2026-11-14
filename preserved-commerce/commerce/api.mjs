import {createHash, createHmac, timingSafeEqual} from 'node:crypto';
import {ShopError, quote, customer} from './core.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'}});
export function createShop({catalog,store,provider,origin,secret,testEnabled=false,now=Date.now}) {
  const token=id=>createHmac('sha256',secret).update(id).digest('hex');
  const ready=()=>{if(!testEnabled || !store || !provider || !secret || secret.length<32)throw new ShopError('Afrekenen is nog niet beschikbaar. Je selectie blijft bewaard.',503);};
  async function body(req) {
    if(Number(req.headers.get('content-length')||0)>16384)throw new ShopError('Aanvraag te groot.',413);
    const raw=await req.text();if(Buffer.byteLength(raw)>16384)throw new ShopError('Aanvraag te groot.',413);
    return raw;
  }
  async function sync(order,paymentId) {
    const p=await provider.get(paymentId);
    if(p.mode!=='test' || p.id!==paymentId || p.metadata?.orderId!==order.id || p.amount?.currency!=='EUR' || p.amount?.value!==(order.data.quote.grossCents/100).toFixed(2)) throw new ShopError('Betaalgegevens komen niet overeen.',409);
    if(order.payment_id && order.payment_id!==p.id)throw new ShopError('Betaling hoort niet bij deze bestelling.',409);
    // A webhook can beat the create-payment response. Bind only after authenticated verification.
    if(!order.payment_id)await store.attach(order.id,p.id,null);
    if(!['open','pending','authorized','paid','failed','canceled','expired'].includes(p.status))throw new ShopError('Onbekende betaalstatus.',502);
    await store.status(order.id,p.id,p.status);
    return store.get(order.id);
  }
  return async function handle(req) {
    try {
      const path=new URL(req.url).pathname;
      const webhook=path==='/api/payment-webhook';
      if(req.method==='POST' && !webhook && req.headers.get('origin')!==origin)throw new ShopError('Ongeldige herkomst.',403);
      if(path==='/api/quote' && req.method==='POST') {
        const b=JSON.parse(await body(req));const q=quote(b.items,b.country,catalog);
        return json({...q,checkoutAllowed:q.checkoutAllowed && testEnabled && !!provider && !!store});
      }
      if(path==='/api/checkout' && req.method==='POST') {
        ready();const b=JSON.parse(await body(req));
        if(typeof b.idempotencyKey!=='string' || !/^[a-f0-9]{64}$/.test(b.idempotencyKey))throw new ShopError('Ongeldige bestelreferentie.');
        if(b.acceptedTerms!==true)throw new ShopError('Bevestig de voorwaarden.');
        const q=quote(b.items,b.customer?.country,catalog);
        if(!q.checkoutAllowed)throw new ShopError('Deze selectie is nog niet te bestellen.',409);
        const c=customer(b.customer);
        const data={quote:q,customer:c,termsVersion:'test-2026-11-07',mode:'test'};
        const id=hash(b.idempotencyKey), request_hash=hash(JSON.stringify(data));
        const order=await store.create({id,request_hash,data,created_at:now()});
        if(order.request_hash!==request_hash)throw new ShopError('De bestelling is gewijzigd. Controleer je selectie en start opnieuw.',409);
        if(order.status==='paid')return json({url:`${origin}/bestelling/#${id}.${token(id)}`});
        if(order.checkout_url)return json({url:order.checkout_url});
        // Mollie retains idempotency keys for one hour. Never automatically create a second payment after that window.
        if(now()-order.created_at>50*60000)throw new ShopError('Deze betaalpoging moet eerst worden gecontroleerd. Neem contact op.',409);
        const payment=await provider.create(order,origin,token(id));
        await store.attach(id,payment.id,payment.url);
        return json({url:payment.url});
      }
      if(webhook && req.method==='POST') {
        ready();const raw=await body(req);let id;
        if(req.headers.get('content-type')?.includes('application/json'))id=JSON.parse(raw).id;
        else id=new URLSearchParams(raw).get('id');
        if(typeof id!=='string'||!/^tr_[a-zA-Z0-9_-]{4,150}$/.test(id))throw new ShopError('Ongeldig betaalnummer.');
        const p=await provider.get(id);const orderId=p.metadata?.orderId;
        if(typeof orderId!=='string')throw new ShopError('Onbekende bestelling.',404);
        const order=await store.get(orderId);if(!order)throw new ShopError('Onbekende bestelling.',404);
        await sync(order,id);return json({received:true});
      }
      if(path.startsWith('/api/order/') && req.method==='GET') {
        ready();const id=path.slice('/api/order/'.length), supplied=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
        if(!/^[a-f0-9]{64}$/.test(id)||!/^[a-f0-9]{64}$/.test(supplied)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(token(id))))throw new ShopError('Bestelling niet gevonden.',404);
        let order=await store.get(id);if(!order)throw new ShopError('Bestelling niet gevonden.',404);
        if(order.payment_id && order.status!=='paid')order=await sync(order,order.payment_id);
        return json({id:order.id,status:order.status,quote:order.data.quote,mode:'test'});
      }
      return json({error:'Niet gevonden.'},404);
    } catch(e) {
      if(e instanceof SyntaxError)return json({error:'Ongeldige aanvraag.'},400);
      return json({error:e instanceof ShopError?e.message:'Er ging iets mis. Je selectie blijft bewaard.'},e instanceof ShopError?e.status:500);
    }
  };
}
