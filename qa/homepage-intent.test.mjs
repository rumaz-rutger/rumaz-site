import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {JSDOM,VirtualConsole} from 'jsdom';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const html=await read('site/app/index.html'),source=await read('site/assets/js/rumaz3-social.js'),intentSource=await read('site/assets/js/rumaz3-intent.js');
const codes=['woning','appartement','huisje','camper','caravan','boot','chalet'];
async function app({code='',guest=false,places=[],storedCode=null}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!e.message.includes('navigation'))errors.push(e.message)});
 const dom=new JSDOM(html,{url:'https://rumaz-staging.netlify.app/app/'+(code?'?pleksoort='+code:'#home'),runScripts:'outside-only',virtualConsole:vc});
 const w=dom.window,ctx=dom.getInternalVMContext();w.HTMLElement.prototype.scrollIntoView=()=>{};w.RUMAZ_AUTH_CONFIG={enabled:true};
 w.eval(intentSource);if(storedCode)w.RumazIntent.remember(storedCode);let draft=null;const calls=[];
 const data={name:'QA',places:structuredClone(places)};
 class Remote{user=guest?null:{id:'u'};async session(){return this.user;}async load(){return data;}async createPlace(d){calls.push(structuredClone(d));data.places.push({...structuredClone(d),accessRole:'admin',members:[],posts:[],events:[],planner:[],bookings:[],guides:[],tips:[]});return d.id;}}
 const dep=new vm.SyntheticModule(['RumazData','readDraft','saveDraft','clearDraft'],function(){this.setExport('RumazData',Remote);this.setExport('readDraft',()=>draft);this.setExport('saveDraft',d=>draft={...d,id:'unique-id'});this.setExport('clearDraft',()=>draft=null);},{context:ctx});await dep.link(()=>{});await dep.evaluate();
 for(const name of ['prikbord','planner','agenda','handleiding','omgeving','kring'])w.eval(await read('site/assets/js/modules/'+name+'.js'));
 await new vm.Script(source,{importModuleDynamically:()=>dep}).runInContext(ctx);
 return {dom,w,calls,data,errors};
}
for(const code of codes){
 test('guest '+code+' retains only type and does not create a place',async()=>{const h=await app({code,guest:true});try{assert.equal(h.w.RumazIntent.read(),code);assert.equal(h.calls.length,0);assert.equal(h.w.document.querySelector('#addModal').classList.contains('open'),false);assert.deepEqual(h.errors,[]);}finally{h.dom.window.close()}});
 test('member '+code+' opens, saves once and reloads correct subtype',async()=>{const h=await app({code});try{
 const d=h.w.document;assert.ok(d.querySelector('#addModal.open'));assert.equal(d.querySelector('#typeInput').value,code==='woning'?'home':code==='boot'?'boat':code);assert.equal(h.calls.length,0);assert.equal(h.w.RumazIntent.read(),null);assert.equal(h.w.location.search,'');
 assert.equal(d.querySelectorAll('#bottomNav [aria-current="page"]').length,1);assert.equal(d.querySelector('#bottomNav [aria-current]').dataset.nav,'plek');
 d.querySelector('#ownName').value='Onze plek';d.querySelector('#simulateAdd').click();d.querySelector('#saveDemoPlace').click();d.querySelector('#saveDemoPlace').click();await new Promise(setImmediate);await new Promise(setImmediate);
 assert.equal(h.calls.length,1);assert.equal(h.calls[0].type,['woning','chalet','huisje','appartement'].includes(code)?'home':code==='boot'?'boat':code);
 if(['chalet','huisje','appartement'].includes(code))assert.equal(h.calls[0].fields.find(f=>f.id==='placeSubtype').value,code);
 assert.deepEqual(h.errors,[]);
 const again=await app({places:h.data.places});try{assert.equal(again.calls.length,0);assert.equal(again.data.places.length,1);again.w.document.querySelector('#bottomNav [data-nav="plek"]').click();assert.match(again.w.document.querySelector('#detailMeta').textContent,new RegExp(h.w.RumazIntent.choices[code].label));}finally{again.dom.window.close()}
 }finally{h.dom.window.close()}});
}
test('cancel, changed type and relationship never create on their own',async()=>{const h=await app({code:'chalet'});try{const d=h.w.document;d.querySelector('#typeInput').value='boat';d.querySelector('#typeInput').dispatchEvent(new h.w.Event('change'));d.querySelector('#roleInput').value='rent';d.querySelector('#roleInput').dispatchEvent(new h.w.Event('change'));assert.equal(d.querySelector('[data-fields="boat"]').hidden,false);d.querySelector('#cancelAdd').click();assert.equal(h.calls.length,0);assert.equal(h.w.RumazIntent.read(),null);assert.ok(!d.querySelector('#addModal.open'));}finally{h.dom.window.close()}});
test('invalid and expired storage cannot authorize or redirect',()=>{const dom=new JSDOM('',{url:'https://rumaz-staging.netlify.app/',runScripts:'outside-only'});try{dom.window.eval(intentSource);const i=dom.window.RumazIntent;for(const c of ['__proto__','constructor','https://evil.invalid','../boot'])assert.equal(i.remember(c),null);dom.window.localStorage.setItem('rumaz_place_intent_v1',JSON.stringify({code:'boot',savedAt:0}));assert.equal(i.read(),null);assert.equal(i.route('/app/','evil'),'/app/');}finally{dom.window.close()}});
test('all screen sections stay inside main and card links use 3.2 onboarding',()=>{const d=new JSDOM(html);try{assert.equal(d.window.document.querySelectorAll('main > .page').length,6);assert.equal(d.window.document.querySelectorAll('#home [data-place-intent]').length,6);for(const a of d.window.document.querySelectorAll('[data-place-intent]'))assert.equal(a.getAttribute('href'),'/start-plek/?pleksoort='+a.dataset.placeIntent);}finally{d.window.close()}});

test('refresh after cancelling empty Mijn plek does not reopen modal',async()=>{const h=await app();try{h.w.document.querySelector('#bottomNav [data-nav="plek"]').click();assert.ok(!h.w.document.querySelector('#addModal.open'));assert.equal(h.w.document.querySelector('#detailName').textContent,'Jouw eerste plek');h.w.document.querySelector('#firstPlaceAdd').click();assert.ok(h.w.document.querySelector('#addModal.open'));assert.equal(h.calls.length,0);}finally{h.dom.window.close()}});

test('browser back to guest home does not redirect a remembered intent again',async()=>{const h=await app({guest:true,storedCode:'boot'});try{assert.equal(h.w.location.hash,'#home');assert.ok(h.w.document.querySelector('#home.current'));assert.equal(h.w.RumazIntent.read(),'boot');assert.ok(!h.w.document.querySelector('#addModal.open'));assert.equal(h.calls.length,0);}finally{h.dom.window.close()}});
