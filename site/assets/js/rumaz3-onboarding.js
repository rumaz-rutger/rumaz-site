import {RumazData} from './rumaz3-data.js';
const store=window.RumazStartDraft, choices=window.RumazIntent.choices;
const stage=document.querySelector('#stage'),progress=document.querySelector('#progress'),status=document.querySelector('#status');
let draft=store.read(),busy=false,lookupResult=null,looking=false,revision=0;
const lookupCopy='Je zoekgegevens worden alleen na jouw klik naar de gekozen openbare bron gestuurd. Controleer gevonden gegevens voordat je ze overneemt.';
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=t=>status.textContent=t;
const save=()=>{if(!store.write(draft))say('Bewaren in deze browser lukt niet. Houd deze pagina open; gegevens kunnen bij aanmelden verloren gaan.');};
const field=(key,label,type='text',optional=false)=>`<label>${label}<input name="${key}" type="${type}" value="${esc(draft[key])}" ${optional?'':'required'} ${type==='number'?'min="0" max="100" step="1"':'maxlength="200"'}></label>`;
const button=(action,text)=>`<button class="btn" type="button" data-action="${action}">${text}</button>`;
function render(focus=true){
 revision++;lookupResult=null;const step=draft?.step||1;progress.textContent=`Stap ${step} van 3`;say('');
 if(step===1){stage.innerHTML='<div class="start-intro"><h1 tabindex="-1">Wat voor plek wil jij samen regelen?</h1><p>Kies het type accommodatie. Daarna helpen we je stap voor stap verder.</p></div><div class="start-grid">'+['woning','appartement','huisje','camper','caravan','boot'].map(t=>`<button class="start-card" data-type="${t}" aria-pressed="${draft?.type===t}"><img src="/assets/img/home-${t}.webp" alt=""><span>${choices[t].label}</span></button>`).join('')+'</div><p>Tik op jouw plek om te beginnen.</p>';}
 else if(step===2){
  const label={woning:'Postcode, huisnummer en toevoeging',appartement:'Postcode, huisnummer en toevoeging',huisje:'Adres of parknaam en pleknummer',camper:'Kenteken of merk en model',caravan:'Kenteken of merk en model',boot:'Naam, merk en type of ligplaats'}[draft.type];
  stage.innerHTML=`<div class="start-intro"><h1 tabindex="-1">Waar vinden we jouw ${choices[draft.type].label.toLowerCase()}?</h1><p>Geef één aanknopingspunt.</p></div><form class="start-form">${field('country','Land')}${['camper','caravan'].includes(draft.type)?button('no-plate',draft.manualVehicle?'Toch zoeken op kenteken':'Geen Nederlands kenteken'):''}${['woning','appartement'].includes(draft.type)?field('postcode','Postcode','text',true)+field('houseNumber','Huisnummer','text',true)+field('addition','Toevoeging','text',true):''}${field('reference',['woning','appartement'].includes(draft.type)?'Adres (handmatig, bijvoorbeeld in het buitenland)':label,'text',['woning','appartement'].includes(draft.type))}<details><summary>Een website toevoegen (optioneel)</summary>${field('url','Website','url',true)}<small>Website-import werkt alleen voor goedgekeurde openbare bronnen. Andere websites kun je handmatig toevoegen.</small></details><div class="start-actions">${['woning','appartement','huisje','camper','caravan'].includes(draft.type)&&!draft.manualVehicle?button('lookup','Zoek openbare gegevens'):''}${button('website','Lees websitegegevens')}</div><small>${lookupCopy}</small><div id="lookup-result" role="status"></div><p>Geen resultaat? Vul zelf aan en ga verder. Buitenlandse adressen en boten kun je altijd handmatig invoeren.</p><div class="start-actions">${button('back','Terug')}<button class="btn" type="submit">Verder</button></div></form>`;
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
async function findData(website){
 if(looking)return;collect();
 const query=website?draft.url:['woning','appartement'].includes(draft.type)&&draft.postcode&&draft.houseNumber?[draft.postcode,draft.houseNumber,draft.addition].filter(Boolean).join(' '):draft.reference;
 if(!query){say(website?'Vul eerst een website in.':'Vul eerst een postcode en huisnummer of kenteken in.');return;}
 if(!website&&!['nederland','nl'].includes(String(draft.country).trim().toLowerCase())){say('Automatisch zoeken is alleen voor Nederlandse adressen en kentekens. Vul je gegevens handmatig in.');return;}
 looking=true;const savedId=draft.id,reference=draft.reference,requestRevision=revision;lookupResult=null;say('Openbare gegevens worden gezocht…');
 try{
 const response=await fetch('/.netlify/functions/place-lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:website?'website':['camper','caravan'].includes(draft.type)?'rdw':'address',query}),signal:AbortSignal.timeout(20000)});
 const result=await response.json();if(revision!==requestRevision||!draft||draft.id!==savedId||draft.reference!==reference||(website&&draft.url!==query)||draft.step!==2)return;
 if(!response.ok){const errors={REDIRECT:'Deze website verwijst naar een ander adres. Gebruik de uiteindelijke HTTPS-link of vul zelf in.',CONTENT_TYPE:'Deze bron levert geen leesbare webpagina. Vul zelf in.',SIZE:'Deze pagina is te groot om veilig te importeren. Vul zelf in.',TIMEOUT:'De bron reageert niet op tijd. Probeer later of vul zelf in.',URL:'Gebruik een openbare HTTPS-link zonder inloggegevens. Je kunt ook zelf invullen.',RDW_UNAVAILABLE:'RDW is nu niet bereikbaar. Kies Geen Nederlands kenteken om merk en model handmatig in te vullen.',HOST_NOT_APPROVED:'Voor dit domein is nog geen importtoestemming ingesteld. Vul de gegevens handmatig in.',ROBOTS:'Deze website staat automatisch uitlezen niet toe. Je kunt zelf verder.',INPUT:'Controleer postcode en huisnummer of het Nederlandse kenteken.'};say(errors[result.error]||'De bron is nu niet bereikbaar. Je kunt zelf verder.');return;}
 if(!result.found){say(website?'Deze pagina bevat geen bruikbare openbare accommodatiegegevens. Vul de gegevens zelf in.':['camper','caravan'].includes(draft.type)?'Dit kenteken is niet gevonden. Controleer het of kies Geen Nederlands kenteken om merk en model in te vullen.':'Geen exact adres gevonden. Controleer de invoer of vul het adres zelf in.');return;}
 lookupResult=result;const box=document.querySelector('#lookup-result');if(result.candidates?.length>1){box.innerHTML='<p>Kies jouw adres of accommodatie:</p>'+result.candidates.map((v,i)=>'<button type="button" class="btn" data-candidate="'+i+'">'+esc(v.name||v.reference)+'</button>').join('');say('Er zijn meerdere resultaten. Maak zelf een keuze.');return;}showSource();
 }catch{if(revision===requestRevision)say('Zoeken is niet gelukt. Je kunt gewoon zelf verder.');}finally{looking=false;}
}
const labels={name:'Naam',reference:'Adres of kenteken',country:'Land',rooms:'Slaapkamers of hutten',beds:'Bedden',bathrooms:'Badkamers',capacity:'Slaapplaatsen'};
function showSource(){
 const box=document.querySelector('#lookup-result');
 if(lookupResult.source==='PDOK / BAG'){box.innerHTML='<p>Gevonden adres:</p><p>'+esc(lookupResult.values.reference)+'</p><p>Bron: PDOK / BAG</p>'+button('accept-address','Gebruik dit adres');say('Controleer straat, huisnummer en woonplaats.');return;}
 box.innerHTML='<p>Controleer welke gegevens je wilt overnemen:</p>'+Object.entries(lookupResult.values).filter(([k,v])=>labels[k]&&v!=='').map(([k,v])=>`<label><input type="checkbox" data-source-field="${k}" ${!draft[k]?'checked':''}> ${labels[k]}: ${esc(v)}${draft[k]?` (nu: ${esc(draft[k])})`:''}</label>`).join('')+'<p>Bron: '+esc(lookupResult.source)+'</p>'+button('accept-source','Neem geselecteerde gegevens over');
 say('Alleen aangevinkte gegevens worden overgenomen. Je kunt ook je eigen invoer behouden.');
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
stage.addEventListener('submit',e=>{e.preventDefault();if(busy||!e.target.reportValidity())return;collect();if(draft.step===2){if(!draft.reference?.trim()){say('Vul een adres, kenteken of andere herkenbare omschrijving in.');return;}draft.step=3;save();render()}else persist();});
stage.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||busy)return;
 if(b.dataset.candidate!==undefined&&lookupResult){const candidate=lookupResult.candidates[Number(b.dataset.candidate)];if(candidate){lookupResult.values=candidate;showSource();}return;}
 if(b.dataset.action==='lookup'||b.dataset.action==='website'){findData(b.dataset.action==='website');return;}
 if(b.dataset.action==='accept-address'&&lookupResult?.source==='PDOK / BAG'){draft.reference=lookupResult.values.reference;draft.country=lookupResult.values.country||draft.country;draft.source={source:lookupResult.source,url:lookupResult.url,fetchedAt:lookupResult.fetchedAt,confirmed:true,values:lookupResult.values};save();render();say('Adres bevestigd: '+draft.reference);return;}
 if(b.dataset.action==='accept-source'){
  if(lookupResult){const values={};for(const el of stage.querySelectorAll('[data-source-field]:checked')){const k=el.dataset.sourceField;draft[k]=String(lookupResult.values[k]);values[k]=draft[k];}
   if(!Object.keys(values).length){say('Vink eerst aan wat je wilt overnemen, of ga verder met je eigen invoer.');return;}
   if(values.reference&&lookupResult.values.bagId)values.bagId=lookupResult.values.bagId;
   draft.source={source:lookupResult.source,url:lookupResult.url,fetchedAt:lookupResult.fetchedAt,confirmed:true,values};save();render();say('Je geselecteerde brongegevens zijn overgenomen. Je kunt ze zelf aanpassen.');
  }return;
 }
 if(b.dataset.type){draft=draft?.type===b.dataset.type?{...draft,step:2}:store.create(b.dataset.type);save();render();return;}
 if(b.dataset.action==='no-plate'){collect();draft.manualVehicle=!draft.manualVehicle;save();render();say(draft.manualVehicle?'Vul merk en model in. Je kunt zonder kenteken verder.':'Vul je Nederlandse kenteken in en kies zoeken.');stage.querySelector('[name=reference]')?.focus();return;}
 if(b.dataset.action==='back'){draft.step--;save();render()}
 if(b.dataset.action==='clear'||b.dataset.action==='restart'){store.clear();draft=null;render()}
 if(b.dataset.action==='resume')render();
});
const requested=new URLSearchParams(location.search).get('pleksoort');
if(!draft&&['woning','appartement','huisje','camper','caravan','boot'].includes(requested)){draft=store.create(requested);save();render(false);}
else if(draft){progress.textContent=`Stap ${draft.step} van 3`;stage.innerHTML=`<h1>Welkom terug!</h1><p>Je was bezig met jouw ${esc(choices[draft.type].label.toLowerCase())}. Wil je verdergaan?</p><div class="start-actions">${button('resume','Verdergaan')}${button('restart','Opnieuw beginnen')}${button('clear','Concept wissen')}</div>`;}else render(false);
