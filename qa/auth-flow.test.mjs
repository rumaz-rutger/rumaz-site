import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../site/assets/js/rumaz3-auth.js',import.meta.url),'utf8');
async function harness(action,{recovery=false,password='a',user={email_confirmed_at:'2026-11-11'},path='/app/account/inloggen/'}={}){
 const calls=[],button={disabled:false},message={textContent:'',classList:{add(){}}};let handler,authEvent;
 const form={dataset:{authAction:action},addEventListener(_,f){handler=f},querySelectorAll(){return [button]},reset(){calls.push('reset')}};
 const auth={onAuthStateChange(f){authEvent=f},async getSession(){if(recovery)authEvent('PASSWORD_RECOVERY');return {data:{session:{}},error:null}},async signInWithPassword(){calls.push('login');return {error:null}},async updateUser(){calls.push('update');return {error:null}},async signOut(){calls.push('logout');return {error:null}}};
 const context=vm.createContext({window:{},document:{querySelector(){return message},querySelectorAll(){return [form]}},location:{origin:'https://rumaz-staging.netlify.app',pathname:path,search:'',hash:'',assign(v){calls.push(v)}},history:{replaceState(){}},sessionStorage:{getItem(){return null},removeItem(){}},URLSearchParams,FormData:class{get(k){return {password,passwordConfirm:password,email:'test@example.invalid'}[k]}},console});
 const dep=new vm.SyntheticModule(['getClient','safeReturn','verifiedUser'],function(){this.setExport('getClient',()=>({auth}));this.setExport('safeReturn',()=>'/app/');this.setExport('verifiedUser',async()=>{calls.push('verify');return user})},{context});
 const mod=new vm.SourceTextModule(source,{context});await mod.link(()=>dep);await mod.evaluate();await new Promise(r=>setImmediate(r));
 return {calls,message,submit:()=>handler({preventDefault(){}})};
}
test('existing short password is submitted for login, not rejected by signup rules',async()=>{const h=await harness('login');await h.submit();assert.deepEqual(h.calls,['login','verify','/app/']);});
test('ordinary session cannot reset password',async()=>{const h=await harness('update',{password:'long-password-123',path:'/app/account/wachtwoord-instellen/'});await h.submit();assert.ok(!h.calls.includes('update'));});
test('recovery session updates password then signs out',async()=>{const h=await harness('update',{recovery:true,password:'long-password-123',path:'/app/account/wachtwoord-instellen/'});await h.submit();assert.deepEqual(h.calls,['verify','update','logout','reset']);});
test('welcome page validates user without a form submission',async()=>{const h=await harness('login',{path:'/app/account/welkom/'});assert.deepEqual(h.calls,['verify']);assert.match(h.message.textContent,/bevestigd/);});
test('unconfirmed login never enters app',async()=>{const h=await harness('login',{user:null});await h.submit();assert.ok(!h.calls.includes('/app/'));});
