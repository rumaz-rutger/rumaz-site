import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../site/app/index.html',import.meta.url),'utf8');
const source=await readFile(new URL('../site/assets/js/rumaz3-social.js',import.meta.url),'utf8');
async function app(fields=[]){
 const dom=new JSDOM(html,{url:'https://rumaz-staging.netlify.app/app/#plek-agenda',runScripts:'outside-only'});
 const w=dom.window;w.HTMLElement.prototype.scrollIntoView=()=>{};w.RUMAZ_AUTH_CONFIG={enabled:true};
 const calls=[];const place=id=>({id,name:'Plek '+id,type:'home',role:'own',location:'Hilversum',circle:'Familie',fields,accessRole:'admin',members:[{id:'u',name:'Jij',role:'Beheerder'}],posts:[],bookings:[],planner:[],guides:[],tips:[],events:[],requireApproval:true,showActivities:true});
 const data={name:'Rutger',places:[place('one'),place('two')]};
 class Remote{user={id:'u'};async session(){return this.user;}async load(){return data;}async requestStay(...args){calls.push(['requestStay',...args]);}async add(...args){calls.push(['add',...args]);}async invite(...args){calls.push(['invite',...args]);}async post(...args){calls.push(['post',...args]);}}
 const ctx=dom.getInternalVMContext();const dep=new vm.SyntheticModule(['RumazData','readDraft'],function(){this.setExport('RumazData',Remote);this.setExport('readDraft',()=>null);},{context:ctx});await dep.link(()=>{});await dep.evaluate();
 for(const name of ['prikbord','planner','agenda','handleiding','omgeving','kring'])new vm.Script(await readFile(new URL('../site/assets/js/modules/'+name+'.js',import.meta.url),'utf8')).runInContext(ctx);
 const script=new vm.Script(source,{importModuleDynamically:()=>dep});await script.runInContext(ctx);
 return {dom,w,calls};
}
test('RC5 authenticated DOM renders five nav tabs and month, switches places, saves requests',async()=>{
 const {dom,w,calls}=await app();try{
 assert.equal(w.document.querySelectorAll('#bottomNav [data-nav]').length,5);
 assert.ok(w.document.querySelectorAll('[data-calendar-day]').length>=28);
 const picker=w.document.getElementById('placeSwitcher');picker.value='two';picker.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(w.document.getElementById('detailName').textContent,'Plek two');
 w.document.querySelector('[data-switch-part="agenda"]').click();
 w.document.getElementById('bookingStart').value='2027-12-01';w.document.getElementById('bookingEnd').value='2027-12-03';
 w.document.getElementById('newBookingForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(setImmediate);
 assert.deepEqual(calls[0],['requestStay','two','2027-12-01','2027-12-03','']);
 }finally{dom.window.close();}
});
test('RC5 planner and invitation use backend and contain no fake member insertion',async()=>{
 const {dom,w,calls}=await app();try{
 w.document.querySelector('[data-switch-part="planner"]').click();w.document.getElementById('plannerText').value='Boodschappen';w.document.getElementById('newPlannerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(setImmediate);assert.equal(calls[0][1],'place_tasks');
 w.document.querySelector('[data-switch-part="mensen"]').click();w.document.getElementById('inviteEmail').value='info@rumaz.nl';w.document.getElementById('inviteName').value='Rutger';w.document.getElementById('newInviteForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(setImmediate);assert.deepEqual(calls[1],['invite','one','info@rumaz.nl','member']);
 }finally{dom.window.close();}
});
test('all independent RC5 sections render without missing dependencies',async()=>{
 const {dom,w}=await app();const errors=[];w.addEventListener('error',e=>errors.push(e.message));try{
 for(const part of ['prikbord','planner','handleiding','buurt','mensen','agenda','overzicht']){w.document.querySelector('[data-switch-part="'+part+'"]').click();assert.ok(w.document.getElementById('detailMain').textContent.trim().length>20);}
 assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});

test('Persisted onboarding capacities appear in the existing private place overview',async()=>{const {dom,w}=await app([{id:'onboarding_rooms',value:'2'},{id:'onboarding_beds',value:'3'},{id:'onboarding_capacity',value:'4'},{id:'onboarding_source',value:'PRIVATE_SOURCE_METADATA'}]);try{w.document.querySelector('[data-switch-part="overzicht"]').click();const text=w.document.getElementById('detailMain').textContent;assert.match(text,/Slaapkamers: 2/);assert.match(text,/Bedden: 3/);assert.match(text,/Slaapplaatsen: 4/);assert.ok(!text.includes('PRIVATE_SOURCE_METADATA'));}finally{dom.window.close();}});
