import {getClient,verifiedUser} from './rumaz3-client.js';
import {RumazData} from './rumaz3-data.js';
const status=document.getElementById('authMessage');
const tell=s=>{status.textContent=s;status.classList.add('visible');};
try{
 const user=await verifiedUser();if(!user){location.replace('/app/account/inloggen/');}else{
 const db=new RumazData(),api=getClient();
 document.getElementById('accountEmail').textContent=user.email;
 const data=await db.load();document.getElementById('displayName').value=data.name;
 document.getElementById('accountForm').addEventListener('submit',async e=>{e.preventDefault();try{await db.saveName(document.getElementById('displayName').value.trim().slice(0,80));tell('Je naam is opgeslagen.');}catch{tell('Opslaan is niet gelukt.');}});
 document.getElementById('accountLogout').addEventListener('click',async()=>{try{await db.logout();location.replace('/app/account/inloggen/');}catch{tell('Uitloggen is niet gelukt.');}});
 document.getElementById('accountExport').addEventListener('click',async()=>{try{const content=await db.load();const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mijn-rumaz.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{tell('Downloaden is niet gelukt.');}});
 }
}catch{tell('Accountbeheer kon niet worden geladen. Probeer opnieuw.');}
