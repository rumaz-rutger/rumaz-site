(()=>{
 const key='rumaz_start_v1',ttl=7*86400000,types=['woning','appartement','huisje','camper','caravan','boot'];
 const fields=['brand','model','postcode','houseNumber','addition','reference','country','url','name','firstName','relationship','rooms','beds','capacity','bathrooms','kitchens'];
 function clean(d){
  if(!d||!types.includes(d.type)||!Number.isFinite(d.createdAt)||Date.now()<d.createdAt||Date.now()-d.createdAt>=ttl||!/^[0-9a-f-]{36}$/i.test(d.id))return null;
  const out={version:1,id:d.id,type:d.type,createdAt:d.createdAt,step:[1,2,3].includes(d.step)?d.step:1,ready:d.ready===true,manualVehicle:d.manualVehicle===true};
  for(const k of fields)out[k]=typeof d[k]==='string'?d[k].slice(0,k==='url'?500:200):'';
  if(out.url){try{const u=new URL(out.url);if(u.protocol!=='https:'||u.username||u.password)out.url='';}catch{out.url='';}}
  if(d.source&&typeof d.source==='object'){const v=d.source;out.source={source:String(v.source||'').slice(0,100),url:String(v.url||'').slice(0,1000),fetchedAt:String(v.fetchedAt||'').slice(0,40),confirmed:v.confirmed===true,values:{}};for(const k of ['name','reference','country','rooms','beds','bathrooms','capacity','bagId','vehicleType'])if(typeof v.values?.[k]==='string')out.source.values[k]=v.values[k].slice(0,300);}
  return out;
 }
 const clear=()=>{try{localStorage.removeItem(key)}catch{}};
 function read(){try{const d=JSON.parse(localStorage.getItem(key));if(d?.version===1){const v=clean(d);if(v)return v}}catch{}clear();return null}
 function write(d){const v=clean(d);if(!v)return false;try{localStorage.setItem(key,JSON.stringify(v));return true}catch{return false}}
 window.RumazStartDraft={read,write,clear,clean,create:type=>({version:1,id:crypto.randomUUID(),type,step:2,createdAt:Date.now(),country:'Nederland'})};
})();
