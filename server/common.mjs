import {createClient} from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
export const env=k=>globalThis.Netlify?.env.get(k)||process.env[k];
export function required(k){const v=env(k);if(!v)throw new Error('CONFIG_MISSING');return v;}
export const result=r=>{if(r.error)throw r.error;return r.data;};
export function client(key,token){return createClient(required('SUPABASE_URL'),key,{auth:{persistSession:false,autoRefreshToken:false},global:token?{headers:{Authorization:`Bearer ${token}`}}:undefined});}
export const admin=()=>client(required('SUPABASE_SERVICE_ROLE_KEY'));
export function origin(){const u=new URL(required('RUMAZ_SITE_ORIGIN'));if(u.protocol!=='https:'||u.pathname!=='/')throw new Error('CONFIG_INVALID');return u.origin;}
export const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'}});
export async function actor(req){
 if(req.method!=='POST')throw new Error('METHOD');
 if(req.headers.get('origin')!==origin())throw new Error('AUTH');
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)throw new Error('AUTH');
 const db=client(required('SUPABASE_PUBLISHABLE_KEY'),token);
 const {data,error}=await db.auth.getUser(token);if(error||!data.user?.email_confirmed_at)throw new Error('AUTH');
 return {db,user:data.user};
}
export async function body(req){const s=await req.text();if(s.length>4096)throw new Error('INPUT');return JSON.parse(s);}
export function fail(e){return reply({error:e.message==='AUTH'?'Log opnieuw in.':'De actie is niet voltooid. Probeer opnieuw.'},e.message==='AUTH'?401:e.message==='METHOD'?405:400);}
export async function mail(to,subject,text,id){
 if(typeof to!=='string'||to.length>254||! /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(to))throw new Error('INVALID_RECIPIENT');
 if(env('RUMAZ_MAIL_MODE')!=='live' && to.toLowerCase()!==required('RUMAZ_TEST_EMAIL').toLowerCase())throw new Error('TEST_RECIPIENT_BLOCKED');
 const transport=nodemailer.createTransport({host:required('RUMAZ_SMTP_HOST'),port:Number(env('RUMAZ_SMTP_PORT')||587),secure:env('RUMAZ_SMTP_PORT')==='465',requireTLS:true,connectionTimeout:8000,socketTimeout:12000,auth:{user:required('RUMAZ_SMTP_USER'),pass:required('RUMAZ_SMTP_PASSWORD')}});
 const sent=await transport.sendMail({from:{name:'Rumaz',address:required('RUMAZ_MAIL_FROM')},to:{address:to},disableFileAccess:true,disableUrlAccess:true,subject:subject.replace(/[\r\n]/g,' '),text,messageId:`<${id}@${new URL(origin()).hostname}>`});
 if(!sent.accepted?.length)throw new Error('MAIL_REJECTED');
}
