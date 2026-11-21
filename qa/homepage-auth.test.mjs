import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const authSource=await readFile(new URL('../site/assets/js/rumaz3-auth.js',import.meta.url),'utf8');const intentSource=await readFile(new URL('../site/assets/js/rumaz3-intent.js',import.meta.url),'utf8');
async function harness({code,path,store=new Map(),confirmed=false,action='login',savedReturn=null}={}){
 const calls=[],msg={textContent:'',classList:{add(){}},insertAdjacentHTML(){}},notice={...msg},links=['/app/account/inloggen/','/app/account/registreren/'].map(href=>({href,getAttribute(){return href}}));let submit;
 const form={dataset:{authAction:action},addEventListener(_,f){submit=f},querySelectorAll(){return []}};
 const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const ctx=vm.createContext({window:{},localStorage:storage,sessionStorage:{...storage,getItem:k=>k==='rumaz_return_to'?savedReturn:storage.getItem(k)},document:{querySelector:s=>s==='#placeIntentMessage'?notice:msg,querySelectorAll:s=>s==='a[href]'?links:[form]},location:{origin:'https://rumaz-staging.netlify.app',pathname:path,search:code?'?pleksoort='+code:'',hash:'',assign:v=>calls.push(v)},history:{replaceState(){}},URLSearchParams,FormData:class{get(k){return {password:'test-password-123',email:'qa@example.invalid',displayName:'QA'}[k]}},console});
 new vm.Script(intentSource).runInContext(ctx);
 let user=confirmed?{email_confirmed_at:'now'}:null;
 const api={auth:{onAuthStateChange(){},async getSession(){return {error:null}},async signUp(v){calls.push(v.options.emailRedirectTo);return {error:null}},async signInWithPassword(){user={email_confirmed_at:'now'};return {error:null}}}};
 const dep=new vm.SyntheticModule(['getClient','safeReturn','verifiedUser'],function(){this.setExport('getClient',()=>api);this.setExport('safeReturn',v=>v?.startsWith('/app/#')?v:'/app/');this.setExport('verifiedUser',async()=>user)},{context:ctx});
 const m=new vm.SourceTextModule(authSource,{context:ctx});await m.link(()=>dep);await m.evaluate();await new Promise(setImmediate);return {calls,links,notice,submit:()=>submit({preventDefault(){}}),store};
}
for(const code of ['camper','chalet','appartement','boot'])test(code+' registration, same-origin callback in a new tab and login preserve choice',async()=>{
 const register=await harness({code,path:'/app/account/registreren/',action:'register'});assert.match(register.notice.textContent,/toevoegen/);assert.ok(register.links.every(a=>a.href.includes('pleksoort='+code)));await register.submit();assert.deepEqual(register.calls,['https://rumaz-staging.netlify.app/app/account/welkom/','/app/account/controleer-je-mail/?pleksoort='+code]);
 const welcome=await harness({path:'/app/account/welkom/',store:register.store,confirmed:true});assert.deepEqual(welcome.calls,['/app/?pleksoort='+code+'#plek']);
 const login=await harness({code,path:'/app/account/inloggen/'});await login.submit();assert.deepEqual(login.calls,['/app/?pleksoort='+code+'#plek']);
});
test('existing invitation destination has priority and foreign return is rejected',async()=>{const h=await harness({code:'boot',path:'/app/account/inloggen/',savedReturn:'/app/#uitnodiging=abc'});await h.submit();assert.equal(h.calls.at(-1),'/app/#uitnodiging=abc');const bad=await harness({code:'boot',path:'/app/account/inloggen/',savedReturn:'https://evil.invalid'});await bad.submit();assert.equal(bad.calls.at(-1),'/app/');});
