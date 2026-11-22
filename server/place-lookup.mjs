import https from 'node:https';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
// Only IPv4 public endpoints; IPv6-only sources fail closed rather than bypassing address checks.
export function publicIPv4(ip){if(isIP(ip)!==4)return false;const [a,b]=ip.split('.').map(Number);return !([0,10,127].includes(a)||a>=224||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&(b===168||b===0))||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19||b===51))||(a===203&&b===0));}
export function safeURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||isIP(u.hostname)||!u.hostname.includes('.')||u.hash)throw Error('URL');return u;}
export async function getPublic(url,{limit=524288,types=['application/json'],resolve=lookup}={}){
 const u=safeURL(url);let dnsTimer;let records;try{records=await Promise.race([resolve(u.hostname,{all:true,family:4}),new Promise((_,reject)=>{dnsTimer=setTimeout(()=>reject(Error('TIMEOUT')),4000)})]);}finally{clearTimeout(dnsTimer);}if(!records.length||records.some(r=>!publicIPv4(r.address)))throw Error('ADDRESS');
 // Pin the validated address in the TLS request; no second DNS resolution or redirects.
 return new Promise((ok,no)=>{const req=https.get(u,{agent:false,lookup:(_h,o,cb)=>o.all?cb(null,[records[0]]):cb(null,records[0].address,4),headers:{'User-Agent':'RumazImport/1.0 (+https://rumaz.nl/contact/)','Accept':types.join(', '),'Accept-Encoding':'identity'}},res=>{
 let n=0,chunks=[];if(res.statusCode===404){res.resume();ok({status:404,text:''});return;}
 if(res.statusCode!==200||!types.some(t=>String(res.headers['content-type']||'').toLowerCase().startsWith(t))){res.resume();no(Error('SOURCE'));return;}
 res.on('data',c=>{n+=c.length;if(n>limit){req.destroy(Error('SIZE'));return;}chunks.push(c)});res.on('end',()=>ok({status:200,text:Buffer.concat(chunks).toString('utf8')}));res.on('error',no);
 });const timer=setTimeout(()=>req.destroy(Error('TIMEOUT')),8000);req.on('close',()=>clearTimeout(timer));req.on('error',no);});
}
export function robotsAllowed(text,path){
 // Conservative: any matching Disallow is respected, including other agents' restrictions.
 for(const line of text.split(/\r?\n/)){const m=line.replace(/#.*/,'').match(/^\s*disallow\s*:\s*(\S+)/i);if(m){const p=m[1];const escaped=p.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*');if(new RegExp('^'+escaped).test(path))return false;}}
 return true;
}
const clean=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/[\x00-\x1f]/g,' ').trim().slice(0,300);
export function metadataCandidates(html){
 const found=[];for(const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
 try{const walk=(v,depth=0)=>{if(depth>8||!v||typeof v!=='object')return;if(Array.isArray(v)){v.slice(0,50).forEach(x=>walk(x,depth+1));return;}const types=[v['@type']].flat();if(types.some(t=>['Accommodation','LodgingBusiness','VacationRental','House','Apartment','Hotel','Campground'].includes(t)))found.push(v);if(v['@graph'])walk(v['@graph'],depth+1);if(v.containsPlace)walk(v.containsPlace,depth+1);};walk(JSON.parse(m[1]));}catch{}}
 const candidates=found.filter(v=>!found.some(parent=>parent!==v&&[parent.containsPlace].flat().includes(v))).flatMap(parent=>{
 const children=[parent.containsPlace].flat().filter(v=>v&&typeof v==='object');return (children.length?children:[{}]).map(child=>{
 const v={...parent,...child,address:child.address||parent.address,name:child.name||parent.name};const a=v.address||{};
 const r={name:clean(v.name),reference:clean(typeof a==='string'?a:[a.streetAddress,a.postalCode,a.addressLocality,typeof a.addressCountry==='object'?a.addressCountry.name:a.addressCountry].filter(Boolean).join(', '))};
 const beds=[v.bed].flat().filter(Boolean);const bedCount=beds.length&&beds.every(b=>Number.isInteger(b.numberOfBeds)&&b.numberOfBeds>=0)?beds.reduce((n,b)=>n+b.numberOfBeds,0):undefined;
 for(const [k,val] of [['rooms',v.numberOfBedrooms],['beds',bedCount],['bathrooms',v.numberOfBathroomsTotal],['capacity',v.occupancy?.value??v.occupancy?.maxValue]])if(val!==null&&val!==''&&val!==undefined&&Number.isInteger(Number(val))&&Number(val)>=0&&Number(val)<=100)r[k]=String(val);
 return r;});
 });return [...new Map(candidates.filter(r=>r.name||r.reference).map(r=>[JSON.stringify(r),r])).values()].slice(0,20);
}
export function metadata(html){return metadataCandidates(html)[0]||null;}

export async function lookupPlace(input,{get=getPublic,allowedHosts=[]}={}){
 const q=String(input.query||'').trim();if(q.length>500)throw Error('INPUT');let values,source,url,candidates=[];
 if(input.kind==='rdw'){
 const plate=q.toUpperCase().replace(/[ -]/g,'');if(!/^[A-Z0-9]{6}$/.test(plate))throw Error('INPUT');
 url=new URL('https://opendata.rdw.nl/resource/m9d7-ebf2.json');url.searchParams.set('kenteken',plate);url.searchParams.set('$select','kenteken,merk,handelsbenaming,voertuigsoort');url.searchParams.set('$limit','1');
 const rows=JSON.parse((await get(url.href)).text);const v=rows[0];if(v)values={name:clean([v.merk,v.handelsbenaming].filter(Boolean).join(' ')),reference:clean(v.kenteken),vehicleType:clean(v.voertuigsoort)};source='RDW Open Data';
 }else if(input.kind==='address'){
 const m=q.toUpperCase().match(/^([1-9][0-9]{3})\s?([A-Z]{2})\s+([1-9][0-9]{0,4})(?:\s*([A-Z0-9 -]{1,10}))?$/);if(!m)throw Error('INPUT');const pc=m[1]+m[2];
 url=new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free');url.searchParams.set('q',q);url.searchParams.append('fq','type:adres');url.searchParams.append('fq','postcode:'+pc);url.searchParams.append('fq','huisnummer:'+m[3]);url.searchParams.set('rows','10');
 const docs=JSON.parse((await get(url.href)).text).response?.docs||[];const matches=docs.filter(d=>d.postcode===pc&&String(d.huisnummer)===m[3]&&(!m[4]||String(d.huis_nlt).replace(/\s|-/g,'').toUpperCase()===(m[3]+m[4]).replace(/\s|-/g,'')));
 candidates=matches.map(v=>({reference:clean(v.weergavenaam),country:'Nederland',bagId:clean(v.nummeraanduiding_id)}));values=candidates.length===1?candidates[0]:null;source='PDOK / BAG';
 }else if(input.kind==='website'){
 url=safeURL(q);if(!allowedHosts.includes(url.hostname))throw Error('HOST_NOT_APPROVED');
 const robots=await get(new URL('/robots.txt',url).href,{types:['text/plain'],limit:65536});if(robots.status!==404&&!robotsAllowed(robots.text,url.pathname+url.search))throw Error('ROBOTS');
 const page=await get(url.href,{types:['text/html','application/xhtml+xml']});candidates=metadataCandidates(page.text);values=candidates.length===1?candidates[0]:null;source=url.hostname;
 }else throw Error('INPUT');
 return {found:!!values||candidates.length>0,candidates,values:values||{},source,url:url.href,fetchedAt:new Date().toISOString(),confirmed:false};
}
