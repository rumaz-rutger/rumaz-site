import {RumazData} from './rumaz3-data.js';
const store=window.RumazStartDraft, choices=window.RumazIntent.choices;
const stage=document.querySelector('#stage'),progress=document.querySelector('#progress'),status=document.querySelector('#status');
let draft=store.read(),busy=false,lookupResult=null,looking=false,revision=0;
const lookupCopy='Je zoekgegevens worden alleen na jouw klik naar de gekozen openbare bron gestuurd. Controleer gevonden gegevens voordat je ze overneemt.';
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=t=>{status.textContent=t;const inline=document.querySelector('#search-message');if(inline)inline.textContent=t;};
const save=()=>{if(!store.write(draft))say('Bewaren in deze browser lukt niet. Houd deze pagina open; gegevens kunnen bij aanmelden verloren gaan.');};
const field=(key,label,type='text',optional=false)=>`<label>${label}<input name="${key}" type="${type}" value="${esc(draft[key])}" ${optional?'':'required'} ${type==='number'?'min="0" max="100" step="1"':'maxlength="200"'}></label>`;
const button=(action,text)=>`<button class="btn" type="button" data-action="${action}">${text}</button>`;
function render(focus=true){
 revision++;lookupResult=null;const step=draft?.step||1;progress.textContent=`Stap ${step} van 3`;say('');
 if(step===1){stage.innerHTML='<div class="start-intro"><h1 tabindex="-1">Wat voor plek wil jij samen regelen?</h1><p>Kies het type accommodatie. Daarna helpen we je stap voor stap verder.</p></div><div class="start-grid">'+['woning','appartement','huisje','camper','caravan','boot'].map(t=>`<button class="start-card" data-type="${t}" aria-pressed="${draft?.type===t}"><img src="/assets/img/home-${t}.webp" alt=""><span>${choices[t].label}</span></button>`).join('')+'</div><p>Tik op jouw plek om te beginnen.</p>';}
 else if(step===2){
  const label={woning:'Postcode, huisnummer en toevoeging',appartement:'Postcode, huisnummer en toevoeging',huisje:'Adres of parknaam en pleknummer',camper:'Kenteken of merk en model',caravan:'Kenteken of merk en model',boot:'Naam, merk en type of ligplaats'}[draft.type];
  stage.innerHTML=`<div class="start-intro"><h1 tabindex="-1">Waar vinden we jouw ${choices[draft.type].label.toLowerCase()}?</h1><p>Geef één aanknopingspunt.</p></div><form class="start-form">${field('country','Land')}${['camper','caravan'].includes(draft.type)?button('no-plate',draft.manualVehicle?'Toch zoeken op kenteken':'Geen Nederlands kenteken'):''}${['woning','appartement'].includes(draft.type)?field('postcode','Postcode','text',true)+field('houseNumber','Huisnummer','text',true)+field('addition','Toevoeging','text',true):''}${field('reference',['woning','appartement'].includes(draft.type)?'Adres (handmatig, bijvoorbeeld in het buitenland)':label,'text',true)}<details><summary>Een website toevoegen (optioneel)</summary>${field('url','Website','url',true)}<small>Website-import werkt alleen voor goedgekeurde openbare bronnen. Andere websites kun je handmatig toevoegen.</small></details><div class="start-actions">${button('lookup','Zoek mijn plek')}</div><p id="search-message" role="status" aria-live="polite" tabindex="-1"></p><small>We zoeken met de gegevens die je hebt ingevuld. Je controleert zelf wat we vinden.</small><div id="lookup-result"></div><div id="manual-fields" ${draft.manualVehicle?'':'hidden'}>${['camper','caravan'].includes(draft.type)?field('brand','Merk','text',true)+field('model','Model','text',true):''}</div><div class="start-actions">${button('back','Terug')}<button class="btn" id="manual-next" type="submit" hidden>Ga verder</button></div></form>`;
 }else{
 stage.innerHTML=`<div class="start-intro"><h1 tabindex="-1">Zo wordt het jullie plek.</h1><p>Controleer en vul aan wat jij weet.</p></div><p class="start-preview">${esc(choices[draft.type].label)} · ${esc(draft.reference)} · ${esc(draft.country)}</p><form class="start-form">${field('name','Hoe heet jullie plek?')}<label>Wat is jouw band met deze plek?<select name="relationship" required><option value="">Kies jouw band</option>${[['own','Eigenaar'],['manager','Ik beheer de plek'],['shared','We delen of gebruiken de plek'],['rent','Ik huur of bezoek de plek']].map(([v,l])=>`<option value="${v}" ${draft.relationship===v?'selected':''}>${l}</option>`).join('')}</select></label><small>Je maakt een eigen besloten plek. Dit geeft geen toegang tot een bestaande kring en bewijst geen eigendom.</small>${field('rooms',draft.type==='boot'?'Hoeveel hutten zijn er?':'Hoeveel slaapkamers zijn er?','number')}${field('beds','Hoeveel bedden zijn er?','number')}${field('capacity','Hoeveel mensen kunnen er slapen?','number')}<details><summary>Badkamers en keukens (optioneel)</summary>${field('bathrooms','Aantal badkamers','number',true)}${field('kitchens','Aantal keukens','number',true)}</details>${field('firstName','Hoe mogen we je noemen?')}<p id="personal"></p><small>Je concept blijft maximaal zeven dagen op dit apparaat bewaard. Gebruik op een gedeeld apparaat de wisfunctie.</small><div class="start-actions">${button('back','Terug')}<button class="btn" type="submit">Bewaar jouw plek</button></div></form>`;
 }
 if(draft)stage.insertAdjacentHTML('beforeend','<div class="start-actions">'+button('clear','Concept wissen')+'</div>');
 if(focus)stage.querySelector('h1')?.focus();
}
function collect(){for(const el of stage.querySelectorAll('[name]'))draft[el.name]=el.value.trim();const urlInput=stage.querySelector('[name=url]');if(urlInput){let valid=true;if(urlInput.value){try{const u=new URL(urlInput.value);valid=u.protocol==='https:'&&!u.username&&!u.password;}catch{valid=false;}}urlInput.setCustomValidity(valid?'':'Gebruik een https-website zonder inloggegevens in de link.');}if(!draft.reference&&draft.postcode&&draft.houseNumber)draft.reference=[draft.postcode,draft.houseNumber,draft.addition].filter(Boolean).join(' ');save();const p=document.querySelector('#personal');if(p)p.textContent=draft.firstName?'Mooi, '+draft.firstName+'. Jouw '+choices[draft.type].label.toLowerCase()+' staat klaar.':'';}
async function persist(){
 if(busy)return;busy=true;stage.querySelectorAll('input,select,button').forEach(el=>el.disabled=true);
 try{
  draft.ready=true;save();
  const remote=new RumazData();
  if(!await remote.session()){
   if(!store.write(draft)){say('Je concept kan niet worden bewaard. Sta browseropslag toe voordat je een account aanmaakt.');return;}
   window.RumazIntent.clear();location.assign('/app/account/registreren/');return;
  }
  say('Je plek wordt bewaard…');
  const id=await remote.createPlace({id:draft.id,name:draft.name,type:choices[draft.type].kind,role:draft.relationship==='manager'?'shared':draft.relationship,location:draft.reference+', '+draft.country,fields:[{id:'placeSubtype',value:draft.type},...(draft.source?[{id:'onboarding_source',value:JSON.stringify(draft.source)}]:[]),...['rooms','beds','capacity','bathrooms','kitchens','url','relationship'].filter(k=>typeof draft[k]==='string'&&draft[k]!=='').map(k=>({id:'onboarding_'+k,value:draft[k]}))]});
  store.clear();window.RumazIntent.clear();say('Je plek is opgeslagen.');stage.innerHTML='<h1>Je plek is bewaard.</h1><a class="btn" href="/app/#plekken">Bekijk jouw plekken</a>';
 }catch{say('Bewaren is nog niet gelukt. Je concept blijft beschikbaar. Probeer later opnieuw.');}
 finally{busy=false;stage.querySelectorAll('input,select,button').forEach(el=>el.disabled=false);}
}
const labels={name:'Naam',reference:'Adres of kenteken',country:'Land',rooms:'Slaapkamers of hutten',beds:'Bedden',bathrooms:'Badkamers',capacity:'Slaapplaatsen'};
let pendingResults=[];
function manual(message){say(message);document.querySelector('#manual-next').hidden=false;document.querySelector('#manual-fields').hidden=false;document.querySelector('#search-message').focus();}
async function findData(){
 if(looking)return;collect();const jobs=[],vehicle=['camper','caravan'].includes(draft.type),nl=['nl','nederland'].includes((draft.country||'').toLowerCase());
 const query=draft.postcode&&draft.houseNumber?[draft.postcode,draft.houseNumber,draft.addition].filter(Boolean).join(' '):draft.reference;
 if(nl&&query&&draft.type!=='boot'&&!draft.manualVehicle)jobs.push({kind:vehicle?'rdw':'address',query});
 if(draft.url)jobs.push({kind:'website',query:draft.url});
 if(!jobs.length){manual('Vul je adres, kenteken of een website in. Je kunt de gegevens ook zelf invullen en verdergaan.');return;}
 looking=true;const version=revision,id=draft.id;lookupResult=null;pendingResults=[];
 const trigger=stage.querySelector('[data-action=lookup]');trigger.disabled=true;trigger.textContent='We zoeken jouw plek…';trigger.setAttribute('aria-busy','true');say('We zoeken jouw plek…');document.querySelector('#lookup-result').textContent='';document.querySelector('#manual-next').hidden=true;
 const errors={INPUT:'Controleer je postcode en huisnummer of kenteken.',URL:'Gebruik een volledige https-website zonder inloggegevens.',HOST_NOT_APPROVED:'Deze website is niet toegestaan voor automatisch uitlezen. Vul de gegevens zelf in.',ROBOTS:'Deze website staat automatisch uitlezen niet toe. Vul de gegevens zelf in.',REDIRECT:'Deze link verwijst door. Gebruik de uiteindelijke website of vul zelf in.'};
 try{
 const results=await Promise.all(jobs.map(async job=>{try{const r=await fetch('/.netlify/functions/place-lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(job),signal:AbortSignal.timeout(20000)});const data=await r.json();return {job,data,ok:r.ok};}catch{return {job,data:{error:'SOURCE_UNAVAILABLE'},ok:false};}}));
 if(revision!==version||draft?.id!==id||draft.step!==2)return;
 const messages=[];
 for(const r of results){if(!r.ok||!r.data.found){messages.push(!r.ok?(errors[r.data.error]||'De gegevensdienst is tijdelijk niet bereikbaar. Vul de gegevens zelf in.'):r.job.kind==='rdw'?'Dit kenteken is niet gevonden. Controleer het of vul merk en model in.':'Geen gegevens gevonden. Vul zelf aan.');if(r.job.kind==='rdw')document.querySelector('#manual-fields').hidden=false;}else pendingResults.push(r.data);}
 if(!pendingResults.length){manual(messages.join(' '));return;}
 say(messages.join(' ')||'We hebben gegevens gevonden. Controleer of dit jouw plek is.');showSource();
 }finally{looking=false;if(trigger.isConnected){trigger.disabled=false;trigger.textContent='Zoek mijn plek';trigger.removeAttribute('aria-busy');}}
}
function showSource(){
 const box=document.querySelector('#lookup-result');const unresolved=pendingResults.findIndex(r=>r.candidates?.length>1&&!r.selected);
 if(unresolved>=0){const r=pendingResults[unresolved];box.innerHTML='<p>Welke plek bedoel je?</p>'+r.candidates.map((v,i)=>`<button class="btn" type="button" data-result="${unresolved}" data-candidate="${i}">${esc(v.name||v.reference)}</button>`).join('');return;}
 const values={},sources=[];
 // Address service is authoritative for address; website fills missing features only.
 for(const r of pendingResults){sources.push(r);for(const [k,v] of Object.entries(r.values||{}))if(v!==''&&values[k]===undefined)values[k]=v;}
 for(const k of Object.keys(values))if(draft.source?.confirmed&&draft.source.values?.[k]!==undefined)values[k]=draft[k];
 lookupResult={values,sources};box.innerHTML='<div class="start-preview"><h2>Is dit jouw plek?</h2>'+Object.entries(values).filter(([k])=>labels[k]).map(([k,v])=>'<p>'+labels[k]+': '+esc(v)+'</p>').join('')+'</div>'+button('confirm','Ja, dit klopt');
}
function changed(e){
 if(!draft||!e.target.name)return;
 revision++;lookupResult=null;const box=document.querySelector('#lookup-result');if(box)box.textContent='';
 const key=e.target.name;
 if(['postcode','houseNumber','addition'].includes(key)){draft.reference='';const ref=stage.querySelector('[name=reference]');if(ref)ref.value='';}
 if(key==='reference'){for(const name of ['postcode','houseNumber','addition']){draft[name]='';const el=stage.querySelector('[name='+name+']');if(el)el.value='';}}
 if(['postcode','houseNumber','addition','reference','country','url'].includes(key)||draft.source?.values?.[key]!==undefined)delete draft.source;
 collect();
}
stage.addEventListener('input',changed);
stage.addEventListener('change',changed);
stage.addEventListener('submit',e=>{e.preventDefault();if(busy||looking||!e.target.reportValidity())return;collect();if(draft.step===2){if(draft.brand||draft.model){draft.name=[draft.brand,draft.model].filter(Boolean).join(' ');if(!draft.reference)draft.reference=draft.name;}if(!draft.reference?.trim()){say('Vul een adres, kenteken of andere herkenbare omschrijving in.');return;}draft.step=3;save();render()}else persist();});
stage.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||busy||looking)return;
 if(b.dataset.candidate!==undefined){const r=pendingResults[Number(b.dataset.result)];if(r){r.values=r.candidates[Number(b.dataset.candidate)];r.selected=true;showSource();}return;}
 if(b.dataset.action==='lookup'){findData();return;}
 if(b.dataset.action==='confirm'&&lookupResult){const accepted={};for(const [k,v] of Object.entries(lookupResult.values)){if(labels[k]&&!(draft.source?.confirmed&&draft.source.values?.[k]!==undefined)){draft[k]=String(v);accepted[k]=String(v);}}const r=lookupResult.sources[0];draft.source={source:lookupResult.sources.map(x=>x.source).join(' + '),url:r.url,fetchedAt:r.fetchedAt,confirmed:true,values:{...draft.source?.values,...accepted}};if(!draft.reference)draft.reference=draft.name||'';draft.step=3;save();render();return;}
 if(b.dataset.type){draft=draft?.type===b.dataset.type?{...draft,step:2}:store.create(b.dataset.type);save();render();return;}
 if(b.dataset.action==='no-plate'){collect();draft.manualVehicle=!draft.manualVehicle;save();render();document.querySelector('#manual-next').hidden=!draft.manualVehicle;say(draft.manualVehicle?'Vul merk en model in. Je kunt zonder kenteken verder.':'Vul je Nederlandse kenteken in en kies zoeken.');stage.querySelector('[name=reference]')?.focus();return;}
 if(b.dataset.action==='back'){draft.step--;save();render()}
 if(b.dataset.action==='clear'||b.dataset.action==='restart'){store.clear();draft=null;render()}
 if(b.dataset.action==='resume')render();
});
const requested=new URLSearchParams(location.search).get('pleksoort');
if(!draft&&['woning','appartement','huisje','camper','caravan','boot'].includes(requested)){draft=store.create(requested);save();render(false);}
else if(draft){progress.textContent=`Stap ${draft.step} van 3`;stage.innerHTML=`<h1>Welkom terug!</h1><p>Je was bezig met jouw ${esc(choices[draft.type].label.toLowerCase())}. Wil je verdergaan?</p><div class="start-actions">${button('resume','Verdergaan')}${button('restart','Opnieuw beginnen')}${button('clear','Concept wissen')}</div>`;}else render(false);
