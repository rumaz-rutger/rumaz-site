import {lookupPlace} from '../../server/place-lookup.mjs';
export const config={rateLimit:{action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:15}};
export default async req=>{
 const reply=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(req.method!=='POST')return reply({error:'METHOD'},405);
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'ORIGIN'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'INPUT'},415);
 try{
  const reader=req.body?.getReader();if(!reader)return reply({error:'INPUT'},400);let size=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return reply({error:'INPUT'},413)}parts.push(value)}
  const input=JSON.parse(Buffer.concat(parts).toString());
  const hosts=(globalThis.Netlify?.env.get('RUMAZ_IMPORT_HOSTS')||process.env.RUMAZ_IMPORT_HOSTS||'rumaz.nl').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  return reply(await lookupPlace(input,{allowedHosts:hosts}));
 }catch(e){const code=['INPUT','URL','HOST_NOT_APPROVED','ROBOTS','REDIRECT','CONTENT_TYPE','SIZE','TIMEOUT','RDW_UNAVAILABLE'].includes(e.message)?e.message:'SOURCE_UNAVAILABLE';console.warn('RUMAZ_LOOKUP_'+code);return reply({error:code},['INPUT','URL'].includes(code)?400:422);}
};
