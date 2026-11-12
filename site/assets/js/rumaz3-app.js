
(()=>{
 document.body.classList.add('guest');
 const tabs=[['home','Home','i-home'],['plekken','Plekken','i-layers'],['plek','Mijn plek','i-keystone'],['berichten','Berichten','i-chat'],['profiel','Mijn omgeving','i-user']];
 const navMarkup=()=>tabs.map(([id,label,icon])=>`<button class="tab ${id==='home'?'active':''}" type="button" data-nav="${id}" aria-label="${label}" ${id==='home'?'aria-current="page"':''}><svg class="symbol" aria-hidden="true"><use href="#${icon}"/></svg><span class="tab-name">${label}</span></button>`).join('');
 document.getElementById('bottomNav').innerHTML=navMarkup();document.getElementById('desktopNav').innerHTML=navMarkup();
 let user='guest',current='home';const g=document.getElementById('guestBtn'),m=document.getElementById('memberBtn'),modal=document.getElementById('addModal'),toast=document.getElementById('demoToast');let toastTimer;
 function notify(msg){toast.textContent=msg;toast.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.style.display='none',3500)}
 function selectTab(tab){if(!tabs.some(t=>t[0]===tab))return;if(tab==='plek'){if(user==='guest'){user='member';document.body.classList.remove('guest');g.classList.remove('active');m.classList.add('active');g.setAttribute('aria-pressed','false');m.setAttribute('aria-pressed','true');}renderPlace();}if(tab==='profiel')showHubOverview();current=tab;document.querySelectorAll('.page').forEach(x=>x.classList.toggle('current',x.dataset.page===tab));document.querySelectorAll('[data-nav]').forEach(x=>{const on=x.dataset.nav===tab;x.classList.toggle('active',on);if(on)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});document.getElementById('mainContent').scrollIntoView({block:'start',behavior:'instant'});}
 function setUser(v){user=v;document.body.classList.toggle('guest',v==='guest');g.classList.toggle('active',v==='guest');m.classList.toggle('active',v==='member');g.setAttribute('aria-pressed',v==='guest');m.setAttribute('aria-pressed',v==='member');selectTab('home');}
 document.querySelectorAll('[data-nav]').forEach(x=>x.addEventListener('click',()=>{if(user==='guest'&&['berichten','plekken'].includes(x.dataset.nav)){setUser('member');}if(x.dataset.nav==='plek') {openPlace(chosenPlace||'family','overzicht');} else selectTab(x.dataset.nav)}));
 document.querySelectorAll('[data-go]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();selectTab(x.dataset.go)}));

 // Secondary pages sit behind 'Mijn omgeving'; public routes continue to use existing site URLs.
 const hubPages={
  account:{title:'Mijn account',category:'Mijn Rumaz',description:'Later beheer je hier je persoonlijke gegevens, veilig inloggen en de plekken waar je bij hoort. In dit concept bestaan nog geen echte accounts.',route:'/app/account/inloggen/',url:'/app/account/inloggen/'},
  uitnodigingen:{title:'Uitnodigingen en kringen',category:'Mijn Rumaz',description:'Een eigen plek deel je met familie en vrienden. Hier zie je wie is uitgenodigd en welke rol iemand heeft. Besloten informatie blijft beschermd door echte toegangsrechten zodra het platform wordt gebouwd.',route:'/app/uitnodigingen/'},
  meldingen:{title:'Meldingen en privacy',category:'Mijn Rumaz',description:'Kies later welke berichten je wilt ontvangen, bijvoorbeeld een nieuwe tip, een uitnodiging of een wijziging in de agenda. Gegevens van je besloten kringen worden niet openbaar.',route:'/app/instellingen/'},
  over:{title:'Over Rumaz',category:'Ontdek Rumaz',description:'Het bestaande verhaal over Rumaz en de sluitsteen blijft. De nieuwe tekst legt sterker de nadruk op mensen, gedeelde plekken en herinneringen.',route:'/over/',url:'/over/'},
  objects:{title:'Rumaz Objects',category:'Ontdek Rumaz',description:'Een afzonderlijke winkel voor de producten van Rumaz. De bestaande Objects- en Mollie-techniek blijft bewaard, maar is in deze demo niet actief. De winkel mag het sociale karakter niet overheersen.',route:'/objects/',url:'/objects/'},
  transparantie:{title:'Transparantie',category:'Ontdek Rumaz',description:'Hoe Rumaz zorgvuldig omgaat met bronnen, persoonlijke verhalen en praktische informatie. Deze bestaande pagina blijft behouden en wordt inhoudelijk aangepast aan Rumaz 3.0.',route:'/transparantie/',url:'/transparantie/'},
  contact:{title:'Contact',category:'Ontdek Rumaz',description:'Vragen, ideeën of verbeteringen? De bestaande contactpagina blijft bestaan. Rumaz blijft herkenbaar persoonlijk en aanspreekbaar.',route:'/contact/',url:'/contact/'},
  faq:{title:'Veelgestelde vragen',category:'Hulp en voorwaarden',description:'Antwoorden over eigen en gehuurde plekken, familiekringen, uitnodigingen, privacy en praktische informatie. De huidige FAQ-pagina blijft bestaan en wordt later aangescherpt.',route:'/faq/',url:'/faq/'},
  voorwaarden:{title:'Algemene voorwaarden',category:'Hulp en voorwaarden',description:'De bestaande juridische pagina blijft bestaan, maar moet vóór het echte platform en de webshop aansluiten bij het delen van plekken, accounts en eventuele aankopen.',route:'/algemene-voorwaarden/',url:'/algemene-voorwaarden/'},
  privacy:{title:'Privacy',category:'Hulp en voorwaarden',description:'Een eigen pagina over persoonsgegevens, groepsinformatie, toestemming en toegangsrechten. De bestaande privacytekst is nog niet automatisch geschikt voor alle functies van Rumaz 3.0.',route:'/privacy/',url:'/privacy/'},
  disclaimer:{title:'Disclaimer',category:'Hulp en voorwaarden',description:'Afspraken over informatie van gebruikers, gecontroleerde brongegevens en persoonlijke ervaringen. Een bestaande pagina die bij Rumaz blijft.',route:'/disclaimer/',url:'/disclaimer/'},
  abonnement:{title:'Abonnementen',category:'Voor later',description:'We verkennen abonnementen als toekomstige uitbreiding. Rumaz begint met de mensen en hun plekken; er is hier geen betaalmuur, abonnement of automatische afschrijving.',route:'/app/abonnementen/'},
  claimen:{title:'Een plek claimen',category:'Voor later',description:'Een verhuurder of eigenaar kan later na verificatie officiële gegevens van een plek beheren. Privéberichten en persoonlijke kringen blijven buiten diens bereik.',route:'/app/plek-claimen/'},
  adverteren:{title:'Adverteren op Rumaz',category:'Voor later',description:'Mogelijke samenwerking met lokale aanbieders, later herkenbaar als gesponsorde inhoud. Persoonlijke berichten en vertrouwelijke informatie zijn niet bedoeld voor advertenties.',route:'/adverteren/'}
 };
 function showHubOverview(){document.getElementById('hubOverview').hidden=false;document.getElementById('hubDetail').hidden=true;}
 function showHubDetail(key){
  const item=hubPages[key];if(!item)return;
  selectTab('profiel');
  document.getElementById('hubOverview').hidden=true;document.getElementById('hubDetail').hidden=false;
  document.getElementById('hubDetailCategory').textContent=item.category;
  document.getElementById('hubDetailTitle').textContent=item.title;
  document.getElementById('hubDetailHeading').textContent=item.title;
  document.getElementById('hubDetailDescription').textContent=item.description;
  document.getElementById('hubDetailRoute').textContent='Voorziene route: '+item.route;
  const actions=document.getElementById('hubDetailActions');actions.replaceChildren();
  if(item.url){const link=document.createElement('a');link.className='btn';link.href=item.url;link.textContent='Open deze pagina →';actions.append(link)}
  document.getElementById('hubDetailNote').textContent=item.url?'Deze route is een afzonderlijke pagina in de site, los te vervangen via GitHub.':'Deze route is alleen voorbereid; er is nog geen werkende account-, bestel- of andere serverfunctionaliteit.';
  document.getElementById('mainContent').scrollIntoView({block:'start',behavior:'instant'});
 }
 document.querySelectorAll('[data-hub-page]').forEach(b=>b.addEventListener('click',()=>showHubDetail(b.dataset.hubPage)));
 document.getElementById('hubBack').addEventListener('click',()=>{showHubOverview();document.getElementById('mainContent').scrollIntoView({block:'start',behavior:'instant'});});

 g.addEventListener('click',()=>setUser('guest'));m.addEventListener('click',()=>setUser('member'));document.getElementById('visitorStart').addEventListener('click',()=>document.querySelector('.four-routes').scrollIntoView({block:'start',behavior:'smooth'}));document.getElementById('visitorMember').addEventListener('click',()=>openPlace('family','overzicht'));
 const roleInput=document.getElementById('roleInput'),typeInput=document.getElementById('typeInput');
 const addRoles={own:'Mijn eigen plek',shared:'Een plek die ik deel',rent:'Een plek die ik huur'};
 const placeTypes={home:'Huis of chalet',camper:'Camper',caravan:'Caravan',static:'Stacaravan',boat:'Boot',other:'Andere plek'};
 const typeFieldIds={
  home:['homeStreet','homeNumber','homePostcode','homeCity','homeCountry','homeUrl'],
  camper:['camperPlate','camperCountry','camperModel','camperUrl'],
  caravan:['caravanPlate','caravanModel','caravanWhere','caravanUrl'],
  static:['staticCamp','staticSpot','staticCity','staticCountry','staticUrl'],
  boat:['boatName','boatMarina','boatCity','boatUrl'],
  other:['otherType','otherWhere','otherUrl']
 };
 function updateInputs(){
  const role=roleInput.value,type=typeInput.value;
  document.getElementById('dialogTitle').textContent='Een plek toevoegen';
  document.getElementById('ownerExtras').hidden=role==='rent';
  document.querySelectorAll('[data-fields]').forEach(el=>{el.hidden=el.dataset.fields!==type});
  document.getElementById('typeSummary').textContent=placeTypes[type]+' · '+addRoles[role];
  document.getElementById('modalIntro').textContent=role==='rent'?'Ook zonder medewerking van de verhuurder kun je jullie verblijf, agenda en tips bij elkaar houden.':'Voeg deze plek toe voor jezelf en je mensen. Jullie vullen samen de praktische informatie en herinneringen aan.';
  document.getElementById('importPreview').hidden=true;
 }
 const open=()=>{modal.classList.add('open');document.getElementById('importPreview').hidden=true;updateInputs();typeInput.focus()};
 const close=()=>modal.classList.remove('open');
 const chooseRole=role=>{
  roleInput.value=role;typeInput.value='home';
  document.querySelectorAll('#addModal input, #addModal textarea').forEach(el=>{el.value=''});
  document.getElementById('circleInput').value=role==='rent'?'Reisgezelschap':'Familie en vrienden';open();
 };
 roleInput.addEventListener('change',updateInputs);
 typeInput.addEventListener('change',updateInputs);
 document.querySelectorAll('[data-add-role]').forEach(x=>x.addEventListener('click',()=>chooseRole(x.dataset.addRole)));
 document.querySelectorAll('[data-action="add"]').forEach(x=>x.addEventListener('click',()=>chooseRole('own')));
 document.getElementById('closeModal').addEventListener('click',close);
 document.getElementById('cancelAdd').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.getElementById('simulateAdd').addEventListener('click',()=>{
  const type=typeInput.value,role=roleInput.value,name=document.getElementById('ownName').value.trim();
  const values=typeFieldIds[type].map(id=>{const el=document.getElementById(id);return {id,label:el.labels?.[0]?.textContent?.trim()||id,value:el.value.trim()}}).filter(x=>x.value);
  if(!values.length&&!name){notify('Geef een adres, kenteken, camping, ligplaats of naam op zodat je de plek herkent.');document.getElementById(typeFieldIds[type][0]).focus();return;}
  const invalidUrl=values.find(x=>x.id.toLowerCase().endsWith('url')&&!/^https?:\/\/[^\s.]+\.[^\s]+/i.test(x.value));
  if(invalidUrl){notify('Gebruik een volledige link, zoals https://voorbeeld.nl, of laat hem leeg.');document.getElementById(invalidUrl.id).focus();return;}
  const origin=name?name:values.map(x=>x.value).slice(0,2).join(' · ');
  document.getElementById('previewOrigin').textContent=placeTypes[type]+' — '+origin;
  const link=values.find(x=>x.id.toLowerCase().endsWith('url'));
  document.getElementById('previewSource').textContent=link?'Link bewaard als voorstel; nog niet bezocht of gecontroleerd.':'Geen externe gegevens opgehaald; alles is zelf ingevoerd.';
  const personal=[...values.filter(x=>!x.id.toLowerCase().endsWith('url')).map(x=>x.label+': '+x.value),
   document.getElementById('ownNotes').value.trim()&&'Tip: '+document.getElementById('ownNotes').value.trim(),
   role!=='rent'&&document.getElementById('ownFeatures').value.trim()&&'Voorzieningen: '+document.getElementById('ownFeatures').value.trim(),
   role!=='rent'&&document.getElementById('ownGuide').value.trim()&&'Handleiding: '+document.getElementById('ownGuide').value.trim()].filter(Boolean);
  document.getElementById('previewOwn').textContent=personal.join(' · ')||'Je kunt zelf nog informatie en ervaringen toevoegen.';
  document.getElementById('previewCircle').textContent=document.getElementById('circleInput').value+' · besloten, toegang op uitnodiging';
  const result=document.getElementById('importPreview');result.hidden=false;result.scrollIntoView({block:'nearest',behavior:'smooth'});
 });
 document.querySelectorAll('[data-action="detail"]').forEach(x=>x.addEventListener('click',()=>openPlace('family')));
 document.querySelectorAll('[data-filter]').forEach(x=>x.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(y=>y.classList.toggle('active',x===y));notify('Filter '+x.dataset.filter+' — concept zonder live kaartdata.') }));

 // Complete klikreis vanaf plek toevoegen. Alleen lokale browserdemo; geen productie-authenticatie of backend.
 const STORE='rumaz3_local_demo_v3';
 const seedPlaces=[
  {id:'family',type:'home',role:'shared',name:'Het familiehuis',location:'Drenthe · voorbeeldplek',circle:'Familie',fields:[],members:[{name:'Jij',role:'Beheerder'},{name:'Anne',role:'Familie'},{name:'Bram',role:'Familie'}],posts:[{id:'p1',author:'Anne',date:'Vorige week',text:'Ik heb de wandeling langs het bos toegevoegd. Wie gaat er volgende keer mee?',mentions:[],likes:2,replies:['Bram: Lijkt me leuk!']}],events:[{id:'e1',date:'2026-12-12',time:'14:00',title:'Samen wandelen',who:'Iedereen in de kring',going:false}],guides:[{title:'Aankomst',text:'Neem je eigen sleutel mee. Vul verdere instructies samen aan.'}],tips:[{title:'Wandeling in het bos',kind:'tip',note:'Aanbevolen door Anne. Voorbeeldtip, geen externe bron.',url:''}],bookings:[{id:'b-family-1',start:'2027-01-01',end:'2027-01-05',person:'Anne en gezin',status:'approved',note:'Wintervakantie'},{id:'b-family-2',start:'2027-01-10',end:'2027-01-14',person:'Bram',status:'approved',note:''},{id:'b-family-3',start:'2027-01-06',end:'2027-01-09',person:'Sophie',status:'pending',note:'Zou de eerste week nog kunnen?'}],showActivities:false,requireApproval:true},
  {id:'chalet',type:'home',role:'rent',name:'Ons chalet in Tirol',location:'Tirol · Oostenrijk · voorbeeldplek',circle:'Reisgezelschap',fields:[],members:[{name:'Jij',role:'Reisgezelschap'},{name:'Anne',role:'Reisgezelschap'}],posts:[{id:'p2',author:'Anne',date:'Gisteren',text:'Zullen we zaterdag ergens gezellig lunchen? 🍲',mentions:[],likes:1,replies:[]}],events:[{id:'e2',date:'2027-01-16',time:'10:00',title:'Skiën met de groep',who:'Reisgezelschap',going:false}],guides:[{title:'Handig voor aankomst',text:'Vraag de verhuurder naar de sleuteloverdracht. Er zijn nog geen officiële instructies geïmporteerd.'}],tips:[{title:'Restaurant uitzoeken',kind:'tip',note:'Gebruik Google Maps, bewaar daarna de favoriet met jullie groep.',url:''}]},
  {id:'camperdemo',type:'camper',role:'own',name:'Onze camper',location:'Onderweg · voorbeeldplek',circle:'Vrienden',fields:[],members:[{name:'Jij',role:'Beheerder'}],posts:[],events:[],guides:[{title:'Voor vertrek',text:'Controleer brandstof, stroom, water en banden. Vul echte voertuiggegevens zelf in.'}],tips:[]}
 ];
 function localRead(){try{return JSON.parse(localStorage.getItem(STORE)||'null')}catch{return null}}
 let data=localRead(); if(!data || !Array.isArray(data.places)){data={name:'Jij',places:seedPlaces}}
 function persist(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch{notify('Browseropslag is niet beschikbaar. Dit blijft alleen in deze sessie zichtbaar.')}renderMemberHome();renderPlaces();}
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let chosenPlace='family',chosenPart='overzicht',pending=null,calendarMonth=new Date(2027,0,1),calendarAs='member',draftStart='',draftEnd='',emailPreview=null;
 const placeById=id=>data.places.find(p=>p.id===id) || data.places[0];
 const niceType=t=>({home:'Huis of chalet',camper:'Camper',caravan:'Caravan',static:'Stacaravan',boat:'Boot',other:'Andere plek'}[t]||'Plek');
 const safeUrl=u=>{try{let v=new URL(String(u));return ['https:','http:'].includes(v.protocol)?v.href:''}catch{return ''}};
 function autoLocation(fields){const byId=id=>fields.find(x=>x.id===id)?.value||'';return [byId('homeCity'),byId('homeCountry')].filter(Boolean).join(', ') ||[byId('staticCamp'),byId('staticCity'),byId('staticCountry')].filter(Boolean).join(', ')||[byId('camperModel'),byId('caravanWhere'),byId('boatCity'),byId('otherWhere')].filter(Boolean).join(', ')||'Locatie nog invullen';}
 function introMembers(kring){return [{name:'Jij',role:'Beheerder'}]}
 function renderMemberHome(){
  const cards=document.getElementById('memberHomePlaces'),feed=document.getElementById('memberHomeFeed'),msgs=document.getElementById('memberMessagesList');
  if(cards)cards.innerHTML=data.places.slice(0,6).map(p=>`<button class="place-mini" data-open-place="${esc(p.id)}"><span class="ico">${p.type==='camper'?'🚐':p.type==='boat'?'⛵':'⌂'}</span><span><strong>${esc(p.name)}</strong><small>${esc(p.location||p.circle)}</small></span></button>`).join('');
  const latest=data.places.flatMap(p=>p.posts.map(x=>({p,post:x}))).slice(0,5);
  if(feed)feed.innerHTML=latest.length?latest.map(({p,post})=>`<article class="post" style="margin:12px 0"><div class="post-head"><div class="avatar">${esc(post.author?.slice(0,1)||'R')}</div><div><strong>${esc(post.author)}</strong><small>${esc(p.name)} · ${esc(post.date)}</small></div></div><p>${esc(post.text)}</p><button class="btn ghost smallbtn" data-open-place="${esc(p.id)}">Bekijk het gesprek →</button></article>`).join(''):'<p>Bij jouw plekken zijn nog geen berichten.</p>';
  if(msgs)msgs.innerHTML=data.places.map(p=>`<button class="chat" data-open-place="${esc(p.id)}" style="width:100%;border:0;text-align:left"><div class="avatar">${esc(p.name.slice(0,1))}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.posts[0]?.text||'Open het prikbord van deze plek')}</small></div><span class="new-dot"></span></button>`).join('')+'<p class="muted-light">Persoonlijke één-op-één-berichten zijn nog niet beschikbaar; daarvoor bouwen we later een beveiligde berichtenservice.</p>';
  const stats=document.querySelectorAll('.only-member .stats .stat');
  if(stats.length===2){const upcoming=data.places.flatMap(p=>getBookings(p).filter(e=>e.status==='approved').map(e=>({p,e}))).filter(x=>x.e.end>=new Date().toISOString().slice(0,10)).sort((a,b)=>a.e.start.localeCompare(b.e.start))[0];
   stats[0].querySelector('p').textContent=upcoming?`${dateFmt(upcoming.e.start)} · ${upcoming.e.person} bij ${upcoming.p.name}`:'Kijk wanneer jullie volgende verblijf mogelijk is';
   stats[1].querySelector('p').textContent=`${latest.length} berichten uit jouw kringen`;
  }
 }
 function renderPlaces(){
  const target=document.getElementById('placesDemoList'); if(!target)return;
  target.innerHTML=data.places.map(p=>`<button data-open-place="${esc(p.id)}" type="button"><span style="font-size:22px">${p.type==='camper'?'🚐':p.type==='boat'?'⛵':p.type==='static'?'🌲':'⌂'}</span><strong>${esc(p.name)}</strong><small style="color:var(--muted)">${esc(p.location||p.circle)}</small><span aria-hidden="true">›</span></button>`).join('');
 }
 function openPlace(id,part='overzicht'){
  chosenPlace=placeById(id)?.id||'family';chosenPart=part;
  calendarMonth=chosenPlace==='family'?new Date(2027,0,1):new Date(new Date().getFullYear(),new Date().getMonth(),1);
  if(user!=='member'){user='member';document.body.classList.remove('guest');g.classList.remove('active');m.classList.add('active');g.setAttribute('aria-pressed','false');m.setAttribute('aria-pressed','true');}
  selectTab('plek');renderPlace();
 }
 function getBookings(p){return Array.isArray(p.bookings)?p.bookings:(p.bookings=[])}
 function isReserved(booking,day){return booking.start<=day && day<booking.end}
 function conflicts(p,start,end,exceptId='') {return getBookings(p).some(b=>b.id!==exceptId&&b.status==='approved'&&start<b.end&&end>b.start)}
 function approvedPeople(p){return p.members.filter(x=>x.name!=='Jij').length}
 if(!data.schemaV4){const sample=seedPlaces.find(p=>p.id==='family');for(const p of data.places){if(p.id==='family' && !Array.isArray(p.bookings))p.bookings=JSON.parse(JSON.stringify(sample.bookings));if(typeof p.showActivities!=='boolean')p.showActivities=false;if(typeof p.requireApproval!=='boolean')p.requireApproval=true;}data.schemaV4=true;try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}

 function renderPlace(){
  const p=placeById(chosenPlace);if(!p)return;
  document.getElementById('detailName').textContent=p.name;
  document.getElementById('detailMeta').textContent=[niceType(p.type),p.location,p.circle].filter(Boolean).join(' · ');
  const picker=document.getElementById('placeSwitcher');
  picker.innerHTML=data.places.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('');
  document.querySelectorAll('[data-switch-part]').forEach(b=>{const on=b.dataset.switchPart===chosenPart;b.classList.toggle('active',on);if(b.getAttribute('role')==='tab')b.setAttribute('aria-selected',String(on))});
  const main=document.getElementById('detailMain');
  if(chosenPart==='overzicht')main.innerHTML=renderOverview(p);
  if(chosenPart==='prikbord')main.innerHTML=renderBoard(p);
  if(chosenPart==='agenda')main.innerHTML=renderAgenda(p);
  if(chosenPart==='handleiding')main.innerHTML=renderGuide(p);
  if(chosenPart==='buurt')main.innerHTML=renderNearby(p);
  if(chosenPart==='mensen')main.innerHTML=renderPeople(p);
  const aside=document.getElementById('placeAside');
  aside.innerHTML=`<div class="minihead">Bij deze plek</div><h3>Alles wat je nodig hebt, dichtbij.</h3><p>${esc(p.name)} heeft een eigen besloten kring. Alles over aankomst, gebruik en vertrek hoort hier thuis.</p><div class="rz-place-strap"><span>Praktische notities</span><strong>${p.guides.length}</strong></div><div class="rz-place-strap"><span>Mensen in de kring</span><strong>${p.members.length}</strong></div><div class="rz-place-strap"><span>Bevestigde verblijven</span><strong>${getBookings(p).filter(b=>b.status==='approved').length}</strong></div><p class="rz-place-note">“Je hoeft het niet opnieuw te vragen. Het staat bij jullie plek.”</p><div class="demo-warning">Klikdemo, geen echte rechten of e-mails. Geen toegangscodes, wachtwoorden of privésleutels hier invoeren.</div>`;
 }
 function renderOverview(p){
  const b=getBookings(p),next=b.filter(x=>x.status==='approved'&&x.end>='2026-11-10').sort((x,y)=>x.start.localeCompare(y.start))[0];
  const intro=p.type==='camper'?'De praktische gegevens van de camper staan centraal: brandstof, water, stroom, onderweg en bij vertrek.':p.type==='boat'?'Jullie boot, jullie afspraken. Van aanmeren tot stroom en handige aanwijzingen aan boord.':p.role==='rent'?'Een verblijf hoeft niet van jullie te zijn om samen goed voorbereid te zijn. Verzamel wat je weet en vul ervaringen aan.':'Of je nu de sleutel wilt vinden, de verwarming wilt bedienen of samen een weekend wilt plannen: het begint bij deze plek.';
  return `<div class="rz-editorial"><div class="eyebrow">DE PLEK STAAT VOOROP / ${esc(niceType(p.type))}</div><div class="large-serif">Hier begint jullie tijd samen.</div><p class="small-note">${intro}</p></div>
  <div class="rz-overview-grid"><button data-switch-part="agenda" type="button"><div class="eyebrow">01 / BESCHIKBAARHEID</div><span class="metric-strong">${b.filter(x=>x.status==='approved').length||'–'}</span><small> bevestigde verblijven</small><p>Is er nog plek? Bekijk de maand en vraag jouw dagen aan →</p></button><button data-switch-part="mensen" type="button"><div class="eyebrow">02 / JOUW MENSEN</div><span class="metric-strong">${p.members.length}</span><small> mensen rond deze plek</small><p>Wie hoort erbij en wie kun je uitnodigen? →</p></button></div>
  <div class="detail-card"><div class="eyebrow">HANDIG OM TE WETEN</div><h3>Geen vragen die blijven rondzingen.</h3><p>Praktische informatie is de kern van deze plek. Begin bij aankomst, apparatuur of vertrek.</p><div class="rz-guide-short"><button data-switch-part="handleiding"><span class="mini-sym">⌂</span><strong>Aankomen</strong><small>Adres, parkeren, sleuteloverdracht</small></button><button data-switch-part="handleiding"><span class="mini-sym">◇</span><strong>Zo werkt het</strong><small>Verwarming, water, stroom, internet</small></button><button data-switch-part="handleiding"><span class="mini-sym">↗</span><strong>Vertrekken</strong><small>Checklist & afspraken</small></button><button data-switch-part="buurt"><span class="mini-sym">⌖</span><strong>In de buurt</strong><small>Eten, wandelen, tips van elkaar</small></button></div></div>
  ${next?`<div class="rz-place-strap"><span>VOLGEND BEVESTIGD VERBLIJF</span><strong>${esc(next.person)} · ${dateFmt(next.start)} t/m ${dateFmt(next.end)}</strong></div>`:''}
  <div class="detail-card"><div class="eyebrow">VAN JULLIE SAMEN</div><h3>Een berichtje achterlaten?</h3><p>${p.posts[0]?esc(p.posts[0].text):'Het prikbord is nog leeg. Een kleine tip of een simpel bericht is genoeg om te beginnen.'}</p><button class="btn ghost" data-switch-part="prikbord">Open jullie prikbord →</button></div>`;
 }
 function renderBoard(p){
 const posts=p.posts.map(post=>`<article class="demo-post"><div class="post-meta"><strong>${esc(post.author)}</strong> · ${esc(post.date)} · ${esc(p.circle)}</div><p>${esc(post.text)}</p>${post.mentions?.length?`<div class="a-row">${post.mentions.map(m=>`<span class="pill">@${esc(m)}</span>`).join('')}</div>`:''}${post.photo?.startsWith('data:image/jpeg;base64,')?`<img src="${esc(post.photo)}" alt="Gedeelde foto bij dit bericht" style="width:100%;max-height:360px;object-fit:cover;border-radius:11px">`:''}${(post.replies||[]).map(r=>`<div class="replies">${esc(r)}</div>`).join('')}<div class="a-row"><button data-like-post="${esc(post.id)}">♡ ${Number(post.likes)||0} · Leuk</button><button data-comment-post="${esc(post.id)}">Reageren</button><button data-plan-post="${esc(post.id)}">Plan samen</button></div></article>`).join('');
 return `<div class="detail-card"><span class="demo-mark">Samen delen</span><h3>Wat speelt er bij jullie?</h3><p>Een vraag, een tip, een herinnering of een plan voor het volgende bezoek: alles heeft hier een plek. Je deelt alleen met je eigen kring.</p><form id="newPostForm"><div class="form-field"><label for="postText">Schrijf iets voor je kring</label><textarea id="postText" required maxlength="800" placeholder="Bijvoorbeeld: zullen we zaterdag samen naar de markt?"></textarea></div><div class="form-field"><label for="postMention">Iemand noemen (optioneel)</label><select id="postMention"><option value="">Niemand</option>${p.members.filter(x=>x.name!=='Jij').map(x=>`<option value="${esc(x.name)}">@${esc(x.name)}</option>`).join('')}</select></div><div class="form-field"><label for="postPhoto">Foto of herinnering (optioneel, alleen lokale demo)</label><input type="file" id="postPhoto" accept="image/jpeg,image/png,image/webp"><span class="input-hint">Gebruik in deze demo uitsluitend een niet-gevoelige voorbeeldfoto. Hij wordt niet online verstuurd.</span></div><button class="btn" type="submit">Plaats op prikbord</button></form></div><div class="section-head"><h2>Uit jullie kring</h2></div>${posts||'<div class="detail-empty">Nog geen berichten. Begin met een tip of een gezellig plan.</div>'}`;
 }
 function dateFmt(s){const d=new Date(`${s}T12:00:00`);return Number.isNaN(d.getTime())?'Datum onbekend':d.toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric'})}
 function monthISO(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
 function formatRange(b){return dateFmt(b.start)+' – '+dateFmt(b.end)}
 function monthGrid(p){
  const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,count=new Date(y,m+1,0).getDate();
  const days=['ma','di','wo','do','vr','za','zo'].map(n=>`<div class="rz-weekday">${n}</div>`);
  for(let a=0;a<first;a++)days.push('<span class="rz-day empty" aria-hidden="true"></span>');
  for(let d=1;d<=count;d++){
   const date=monthISO(y,m,d),bs=getBookings(p).filter(b=>!['rejected','cancelled'].includes(b.status)&&isReserved(b,date)),approved=bs.find(x=>x.status==='approved'),pending=bs.find(x=>x.status==='pending'),ev=approved||pending;
   const status=approved?'approved':pending?'pending':'free',kind=approved?'Bezet':pending?'Aangevraagd':'Vrij';
   const selected=draftStart===date||draftEnd===date;
   const act=p.showActivities&&p.events.some(e=>e.date===date)?' · activiteit':'';
   days.push(`<button type="button" class="rz-day ${status} ${selected?'selected':''}" data-calendar-day="${date}" aria-label="${d} ${calendarMonth.toLocaleDateString('nl-NL',{month:'long'})}: ${kind}${ev?' door '+esc(ev.person):''}${act}" title="${kind}${ev?' · '+esc(ev.person):''}"><span class="day-num">${d}</span>${ev?`<small>${esc(approved?approved.person:'Aanvraag')}</small>`:'<small>vrij</small>'}${act?'<small>• activiteit</small>':''}</button>`);
  }
  return days.join('');
 }
 function renderAgenda(p){
  const bookings=getBookings(p),pendingList=bookings.filter(b=>b.status==='pending'),monthTitle=calendarMonth.toLocaleDateString('nl-NL',{month:'long',year:'numeric'}),events=[...p.events].sort((a,b)=>a.date.localeCompare(b.date));
  const listed=bookings.filter(b=>['approved','pending'].includes(b.status)).sort((x,y)=>x.start.localeCompare(y.start));
  return `<div class="rz-editorial"><div class="eyebrow">01 / BESCHIKBAARHEID & VERBLIJVEN</div><div class="large-serif">Is er nog een plekje vrij?</div><p class="small-note">Dit is een gedeelde familieagenda, geen verhuurkalender. Alleen mensen met toegang zien de bezetting. De beheerder bevestigt een aanvraag als dat nodig is.</p></div>
  <div class="detail-card"><div class="a-row" style="justify-content:space-between;gap:12px"><strong>Bekijk als</strong><div class="rz-mode-switch"><button type="button" class="${calendarAs==='member'?'active':''}" data-calendar-as="member">Familielid</button><button type="button" class="${calendarAs==='admin'?'active':''}" data-calendar-as="admin">Beheerder</button></div></div><p class="rz-small">Beide rollen zijn hier alleen een demo, niet werkelijk geverifieerd.</p>
  <div class="month-toolbar"><h3>${esc(monthTitle)}</h3><div class="month-arrows"><button type="button" data-calendar-month="prev" aria-label="Vorige maand">‹</button><button type="button" data-calendar-month="now">Vandaag</button><button type="button" data-calendar-month="next" aria-label="Volgende maand">›</button></div></div>
  <div class="rz-month" role="group" aria-label="Maandkalender ${esc(monthTitle)}">${monthGrid(p)}</div>
  <div class="rz-legend"><span><i class="free"></i> Vrij</span><span><i class="approved"></i> Bezet / bevestigd</span><span><i class="pending"></i> Aanvraag loopt</span></div>
  <div class="rz-activities-note">${draftStart?`<strong>Gekozen:</strong> ${esc(dateFmt(draftStart))}${draftEnd?' tot '+esc(dateFmt(draftEnd)):''}. `:''}Klik op een dag om de aankomst te kiezen en daarna op een latere dag voor vertrek. De vertrekdatum is weer beschikbaar.</div></div>
  <div class="detail-card"><div class="eyebrow">02 / VRAAG JOUW DAGEN AAN</div><h3>Wanneer wil je komen?</h3><p>Je hoeft geen groepsapp te sturen om te vragen of het kan. Vul je dagen in; de beheerder kan je aanvraag goedkeuren of afwijzen.</p>
  <form id="newBookingForm"><div class="rz-form-2"><div class="form-field"><label for="bookingStart">Aankomst</label><input type="date" id="bookingStart" required value="${esc(draftStart)}"></div><div class="form-field"><label for="bookingEnd">Vertrek</label><input type="date" id="bookingEnd" required value="${esc(draftEnd)}"></div></div><div class="form-field"><label for="bookingPerson">Voor wie?</label><input id="bookingPerson" maxlength="90" required value="${esc(data.name||'Jij')}" placeholder="Bijvoorbeeld: Sophie en gezin"></div><div class="form-field"><label for="bookingNote">Bericht voor de beheerder (optioneel)</label><textarea id="bookingNote" maxlength="350" placeholder="Bijv. Zou de eerste week van januari kunnen?"></textarea></div><button type="submit" class="btn rz-cal-cta">${p.requireApproval===false?'Verblijf toevoegen':'Aanvraag versturen (demo)'}</button></form>
  <p class="rz-cal-message">In de echte versie krijgt de beheerder een e-mail en een melding in Rumaz. In deze demo wordt uitsluitend een lokaal mailvoorbeeld getoond.</p></div>
  ${emailPreview&&emailPreview.place===p.id?`<div class="rz-mini-email" role="status"><strong>✉ Mailvoorbeeld · niet verzonden</strong><br>Onderwerp: Aanvraag voor ${esc(p.name)}<br>${esc(emailPreview.person)} vraagt ${esc(formatRange(emailPreview))} aan.<br>Beheerder kan via Rumaz veilig goedkeuren of afwijzen.</div>`:''}
  <div class="detail-card"><div class="eyebrow">03 / ZO IS DE PLEK INGEDEELD</div><h3>Geplande verblijven</h3>${listed.length?listed.map(b=>`<div class="rz-request"><div><strong>${esc(b.person)}</strong><p>${esc(formatRange(b))} · ${b.status==='approved'?'Bevestigd':'Nog te beoordelen'}${b.note?' · '+esc(b.note):''}</p></div><span class="state">${b.status==='approved'?'● Bezet':'◌ Aanvraag'}</span></div>`).join(''):'<p>Er staan nog geen verblijven gepland.</p>'}</div>
  ${calendarAs==='admin'?`<div class="detail-card"><div class="eyebrow">BEHEERDER / ACTIE NODIG</div><h3>${pendingList.length} ${pendingList.length===1?'aanvraag':'aanvragen'} te beoordelen</h3><p>In Rumaz zou je als beheerder hier dezelfde aanvragen zien als in je e-mail. Een e-maillink laat je pas na veilig inloggen beslissen.</p>${pendingList.length?pendingList.map(b=>`<div class="rz-request"><div><strong>${esc(b.person)}</strong><p>${esc(formatRange(b))}</p>${b.note?`<p>“${esc(b.note)}”</p>`:''}</div><div class="rz-row-actions"><button class="btn smallbtn" data-booking-approve="${esc(b.id)}">Goedkeuren</button><button class="btn ghost smallbtn" data-booking-reject="${esc(b.id)}">Afwijzen</button></div></div>`).join(''):'<p>Er zijn geen openstaande aanvragen.</p>'}<details class="rz-more-options"><summary>Instellingen voor deze plek</summary><label class="rz-book-label"><input type="checkbox" data-approval-toggle ${p.requireApproval!==false?'checked':''}> Aanvragen eerst laten goedkeuren</label><p class="rz-small">Standaard aan. Je kunt ook directe plaatsing toestaan binnen je eigen kring.</p></details></div>`:''}
  <div class="detail-card"><div class="a-row" style="justify-content:space-between;gap:12px"><div><div class="eyebrow">OPTIONEEL / SAMEN IETS DOEN</div><h3 style="margin:3px 0">Activiteiten</h3></div><label class="rz-book-label"><input type="checkbox" data-activities-toggle ${p.showActivities?'checked':''}> Toon activiteiten</label></div><p>Een uitje naar een restaurant of markt staat los van de beschikbaarheid. Het blokkeert nooit een verblijf.</p>${p.showActivities?`<form id="newEventForm"><div class="form-field"><label for="eventTitle">Wat willen jullie doen?</label><input id="eventTitle" required maxlength="100" placeholder="Bijvoorbeeld: zondag samen lunchen"></div><div class="rz-form-2"><div class="form-field"><label for="eventDate">Datum</label><input type="date" id="eventDate" required></div><div class="form-field"><label for="eventTime">Tijd</label><input type="time" id="eventTime"></div></div><div class="form-field"><label for="eventWho">Met wie?</label><select id="eventWho"><option>Iedereen in de kring</option>${p.members.filter(x=>x.name!=='Jij').map(x=>`<option>${esc(x.name)}</option>`).join('')}</select></div><button class="btn" type="submit">Activiteit delen</button></form><div class="rz-requests">${events.map(x=>`<div class="rz-request"><div><strong>${esc(x.title)}</strong><p>${dateFmt(x.date)} · ${esc(x.time||'Hele dag')} · ${esc(x.who)}</p></div><button class="btn ghost smallbtn" data-going="${esc(x.id)}">${x.going?'✓ Ik ga mee':'Ik ga mee'}</button></div>`).join('')||'<p>Er zijn nog geen activiteiten.</p>'}</div>`:''}</div>`;
 }
 function renderGuide(p){return `<div class="detail-card"><span class="demo-mark">Handig op het juiste moment</span><h3>De handleiding van jullie plek</h3><p>Geen lange Excel of losse instructies. Hier komen korte stappen over aankomst, verwarming, water, stroom, gas, toilet of vertrek.</p><div class="demo-warning"><strong>Bewaar hier geen wachtwoorden, toegangscodes of sleutelplekken.</strong> Zulke informatie vraagt later om een aparte beveiligde kluis met echte toegangsrechten.</div><form id="newGuideForm"><div class="form-field"><label for="guideTitle">Onderwerp</label><input id="guideTitle" required maxlength="90" placeholder="Bijv. Airco instellen"></div><div class="form-field"><label for="guideText">Instructie of tip</label><textarea id="guideText" required maxlength="900" placeholder="Stap 1 ... Stap 2 ..."></textarea></div><button class="btn" type="submit">Bewaar in handleiding</button></form></div><div class="detail-card"><h3>Zo werkt het hier</h3>${p.guides.map(x=>`<details class="wizard-more" style="margin:9px 0!important"><summary>${esc(x.title)}</summary><p>${esc(x.text)}</p></details>`).join('')}</div>`}
 function renderNearby(p){const loc=p.location&&p.location!=='Locatie nog invullen'?p.location:'';const searches=[['🍽','Restaurants','restaurants'],['☕','Koffie & lunch','koffie lunch'],['🍷','Cafés & terrassen','cafes terrassen'],['🛒','Boodschappen','supermarkt']];return `<div class="detail-card"><span class="demo-mark">Tips dichtbij</span><h3>Wat is er te beleven?</h3><p>Een gezellig terras, een wandelroute of de lokale markt. De persoonlijke tips van jullie groep blijven centraal. Open Google Maps voor actuele resultaten.</p>${loc?`<div class="nearby-links">${searches.map(x=>`<a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(x[2]+' '+loc)}">${x[0]} ${esc(x[1])} ↗</a>`).join('')}</div>`:'<p class="muted-light">Voeg eerst een plaats of locatie toe om lokaal te zoeken.</p>'}<div class="demo-warning">Kaartresultaten worden extern bij Google geopend. Rumaz kopieert geen Google-recensies of privégegevens.</div><aside class="demo-warning" aria-label="Toekomstige partnerpositie"><strong>Lokale partner · voorbeeld, geen advertentie</strong><p>Hier kan later één relevante lokale activiteit of eetgelegenheid worden getoond, altijd herkenbaar als gesponsord. Niet in jullie besloten berichten of verblijfsaanvragen.</p><a href="/voor-partners/">Wat betekent dit? →</a></aside><div class="a-row"><a class="btn ghost" href="https://uitinnederland.com/" rel="noopener noreferrer" target="_blank">Lokale UITagenda's ↗</a></div></div><div class="detail-card"><h3>Deel iets leuks met elkaar</h3><p>Plak een evenementlink of voeg een persoonlijke tip toe. Je kunt de tip daarna delen of in jullie agenda zetten.</p><form id="newTipForm"><div class="form-field"><label for="tipType">Wat deel je?</label><select id="tipType"><option value="tip">Tip van mij</option><option value="event">Evenement</option></select></div><div class="form-field"><label for="tipTitle">Naam of onderwerp</label><input id="tipTitle" required maxlength="90" placeholder="Bijv. leuke avondmarkt"></div><div class="form-field"><label for="tipUrl">Link (optioneel)</label><input id="tipUrl" type="url" placeholder="https://..." autocomplete="off"></div><div class="form-field"><label for="tipNote">Waarom is dit leuk?</label><textarea id="tipNote" maxlength="350" placeholder="Wat moeten je vrienden hierover weten?"></textarea></div><button class="btn" type="submit">Deel met jullie kring</button></form></div><div class="detail-card"><h3>Bewaar­de tips en activiteiten</h3>${p.tips.map(x=>`<div class="demo-date"><div class="calendar-day">${x.kind==='event'?'📅':'♡'}</div><div class="demo-date-content"><strong>${esc(x.title)}</strong><small>${esc(x.note||'Toegevoegd door de kring')}</small><div class="a-row">${safeUrl(x.url)?`<a class="pill" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener noreferrer">Bekijk bron ↗</a>`:''}<button data-share-tip="${esc(x.title)}">Op prikbord</button><button data-cal-tip="${esc(x.title)}">In agenda</button></div></div></div>`).join('')||'<div class="detail-empty">Nog geen tips gedeeld.</div>'}</div>`}
 function renderPeople(p){return `<div class="detail-card"><span class="demo-mark">Jouw kring</span><h3>Met wie deel je deze plek?</h3><p>Een plek wordt pas bijzonder door de mensen die er zijn. Nodig familie, vrienden of je reisgezelschap uit. Geef toegang per plek, nooit automatisch tot al jouw plekken.</p>${p.members.map(x=>`<div class="member"><span class="avatar">${esc(x.name.slice(0,1).toUpperCase())}</span><span class="who"><strong>${esc(x.name)}</strong><small>${esc(x.role)}</small></span></div>`).join('')}<form id="newInviteForm"><div class="form-field"><label for="inviteName">Wie wil je uitnodigen?</label><input id="inviteName" required maxlength="60" placeholder="Voornaam van familielid of vriend"></div><div class="form-field"><label for="inviteRole">Rol in deze plek</label><select id="inviteRole"><option>Familie of vriend</option><option>Gast</option><option>Medebeheerder</option></select></div><button class="btn" type="submit">Voeg toe aan de demo-kring</button></form><div class="demo-warning">In deze demo wordt niemand werkelijk uitgenodigd. Voor de echte versie zijn verificatie, e-mailuitnodigingen en server-side rechten vereist.</div></div><div class="detail-card"><h3>Wie ziet wat?</h3><p><strong>Prikbord en agenda</strong>: jullie eigen kring. <strong>Handleiding</strong>: deelnemers met toestemming. <strong>Gevoelige gegevens</strong>: alleen bevoegde personen in een aparte beveiligde kluis.</p><p>Een verhuurder die later een accommodatie claimt, krijgt niet zomaar toegang tot persoonlijke kringen of berichten.</p></div>`}
 function stepToPart(part){if(!['overzicht','prikbord','agenda','handleiding','buurt','mensen'].includes(part))return;chosenPart=part;renderPlace()}
 document.getElementById('detailBack').addEventListener('click',()=>{renderPlaces();selectTab('plekken')});document.getElementById('placeSwitcher').addEventListener('change',e=>openPlace(e.target.value,'overzicht'));
 document.getElementById('resetDemo').addEventListener('click',()=>{data={name:'Jij',places:JSON.parse(JSON.stringify(seedPlaces))};persist();renderPlaces();openPlace('family');notify('De demonstratie is gereset.');});
 document.getElementById('saveDemoPlace').addEventListener('click',()=>{
  if(document.getElementById('importPreview').hidden){notify('Bekijk eerst de voorbeeldplek.');return}
  const type=typeInput.value,role=roleInput.value;
  const fields=typeFieldIds[type].map(id=>{const el=document.getElementById(id);return{id,value:el.value.trim()}}).filter(x=>x.value);
  const name=document.getElementById('ownName').value.trim()||fields.slice(0,2).map(x=>x.value).join(' · ')||'Onze plek';
  const guide=document.getElementById('ownGuide').value.trim();const note=document.getElementById('ownNotes').value.trim();
  pending={id:'plek-'+Date.now(),type,role,name,location:autoLocation(fields),circle:document.getElementById('circleInput').value,fields,members:introMembers(),bookings:[],showActivities:false,requireApproval:true,posts:note?[{id:'p-'+Date.now(),author:'Jij',date:'Zojuist',text:note,likes:0,replies:[],mentions:[]}]:[],events:[],guides:guide?[{title:'Eerste instructie',text:guide}]:[],tips:[]};
  close();document.getElementById('accountModal').classList.add('open');document.getElementById('demoName').focus();
 });
 const closeAccount=()=>document.getElementById('accountModal').classList.remove('open');
 document.getElementById('closeAccount').addEventListener('click',closeAccount);document.getElementById('cancelAccount').addEventListener('click',closeAccount);
 document.getElementById('accountModal').addEventListener('click',e=>{if(e.target.id==='accountModal')closeAccount()});
 document.getElementById('demoAccountForm').addEventListener('submit',e=>{e.preventDefault();if(!pending)return;
  data.name=document.getElementById('demoName').value.trim().slice(0,40)||'Jij';
  data.places.unshift(pending);const newId=pending.id;pending=null;persist();
  document.getElementById('demoPassword').value='';document.getElementById('demoEmail').value='';closeAccount();renderPlaces();openPlace(newId);
  notify('Je plek is lokaal in deze browserdemo bewaard; er is geen echt account aangemaakt.');
 });
 document.addEventListener('click',e=>{
  const b=e.target.closest('button,[data-open-place]');if(!b)return;const p=placeById(chosenPlace);
  
  if(b.dataset.calendarMonth){const shift=b.dataset.calendarMonth;if(shift==='now')calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);else calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+(shift==='prev'?-1:1),1);renderPlace();return}
  if(b.dataset.calendarAs){calendarAs=b.dataset.calendarAs;renderPlace();return}
  if(b.dataset.calendarDay){if(!draftStart||draftEnd||b.dataset.calendarDay<draftStart){draftStart=b.dataset.calendarDay;draftEnd='';}else {draftEnd=b.dataset.calendarDay; if(draftEnd<=draftStart){let d=new Date(draftStart+'T12:00:00');d.setDate(d.getDate()+1);draftEnd=d.toISOString().slice(0,10)}}renderPlace();return}
  if(b.dataset.bookingApprove){const item=getBookings(p).find(x=>x.id===b.dataset.bookingApprove);if(!item)return;if(conflicts(p,item.start,item.end,item.id)){notify('Conflict met een bevestigd verblijf. Kies andere dagen.');return;}item.status='approved';persist();renderPlace();notify('Goedgekeurd in demo; bij echte accounts volgt een e-mail aan aanvrager.');return}
  if(b.dataset.bookingReject){const item=getBookings(p).find(x=>x.id===b.dataset.bookingReject);if(!item)return;item.status='rejected';persist();renderPlace();notify('Afgewezen in demo. Er is geen e-mail verzonden.');return}
  if(b.dataset.openPlace){openPlace(b.dataset.openPlace);return}
  if(b.dataset.switchPart){stepToPart(b.dataset.switchPart);return}
  if(!p)return;
  if(b.dataset.likePost){const post=p.posts.find(x=>x.id===b.dataset.likePost);if(post){post.likes++;persist();renderPlace()}return}
  if(b.dataset.commentPost){const post=p.posts.find(x=>x.id===b.dataset.commentPost);if(post){const reply=prompt('Schrijf een reactie (demo; geen privégegevens):');if(reply?.trim()){post.replies.push(data.name+': '+reply.trim().slice(0,400));persist();renderPlace()}}return}
  if(b.dataset.planPost){chosenPart='agenda';renderPlace();document.getElementById('eventTitle').value='Samen reageren op: '+(p.posts.find(x=>x.id===b.dataset.planPost)?.text||'').slice(0,60);document.getElementById('eventDate').focus();return}
  if(b.dataset.going){const ev=p.events.find(x=>x.id===b.dataset.going);if(ev){ev.going=!ev.going;persist();renderPlace()}return}
  if(b.dataset.shareTip){p.posts.unshift({id:'p-'+Date.now(),author:data.name,date:'Zojuist',text:'Tip voor jullie: '+b.dataset.shareTip,mentions:[],likes:0,replies:[]});persist();stepToPart('prikbord');notify('Tip gedeeld op jullie prikbord.');return}
  if(b.dataset.calTip){p.showActivities=true;chosenPart='agenda';renderPlace();const eventTitle=document.getElementById('eventTitle');if(eventTitle){eventTitle.value=b.dataset.calTip;document.getElementById('eventDate').focus()}return}
 });
 async function demoPhoto(file){
  if(!file)return '';
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Alleen JPG, PNG en WebP zijn ondersteund.');
  if(file.size>12000000)throw new Error('Kies een kleinere voorbeeldfoto (maximaal 12 MB).');
  return await new Promise((resolve,reject)=>{
   const reader=new FileReader();reader.onerror=()=>reject(new Error('Foto kon niet worden gelezen.'));
   reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('Afbeelding kon niet worden geopend.'));
    image.onload=()=>{const max=760,ratio=Math.min(1,max/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));const context=canvas.getContext('2d');context.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.67))};image.src=reader.result};reader.readAsDataURL(file);
  });
 }
 document.addEventListener('submit',async e=>{
  const f=e.target,p=placeById(chosenPlace);if(!p)return;
  if(f.id==='newPostForm'){e.preventDefault();const v=f.querySelector('#postText').value.trim();if(!v)return;const mention=f.querySelector('#postMention').value;let photo='';try{photo=await demoPhoto(f.querySelector('#postPhoto')?.files?.[0])}catch(error){notify(error.message);return}p.posts.unshift({id:'p-'+Date.now(),author:data.name||'Jij',date:'Zojuist',text:v.slice(0,800),mentions:mention?[mention]:[],likes:0,replies:[],photo});persist();renderPlace();notify('Bericht geplaatst in de browserdemo.');}
  
    if(f.id==='newBookingForm'){
     e.preventDefault();const start=f.querySelector('#bookingStart').value,end=f.querySelector('#bookingEnd').value,person=f.querySelector('#bookingPerson').value.trim();
     if(!start||!end||!person){notify('Vul aankomst, vertrek en naam in.');return}
     if(end<=start){notify('Vertrek moet na aankomst liggen.');return}if(start<new Date().toISOString().slice(0,10)){notify('Kies voor een aanvraag een toekomstige aankomstdatum.');return}
     if(conflicts(p,start,end)){notify('Deze periode overlapt een bevestigd verblijf. Kies andere dagen.');return}
     const status=p.requireApproval===false?'approved':'pending';const req={id:'b-'+Date.now(),start,end,person:person.slice(0,90),status,note:f.querySelector('#bookingNote').value.trim().slice(0,350)};
     getBookings(p).push(req);emailPreview={...req,place:p.id};draftStart=start;draftEnd=end;
     persist();renderPlace();notify(status==='pending'?'Aanvraag aangemaakt. Mailvoorbeeld zichtbaar; er is niets verzonden.':'Verblijf bevestigd in deze lokale demo.');return;
    }
    if(f.id==='newEventForm'){e.preventDefault();const title=f.querySelector('#eventTitle').value.trim(),date=f.querySelector('#eventDate').value;if(!title||!date)return;p.events.push({id:'e-'+Date.now(),title:title.slice(0,100),date,time:f.querySelector('#eventTime').value,who:f.querySelector('#eventWho').value,going:false});persist();renderPlace();notify('Afspraak toegevoegd aan de demo-agenda.');}
  if(f.id==='newGuideForm'){e.preventDefault();let title=f.querySelector('#guideTitle').value.trim(),text=f.querySelector('#guideText').value.trim();if(!title||!text)return;p.guides.push({title:title.slice(0,90),text:text.slice(0,900)});persist();renderPlace();notify('Instructie lokaal toegevoegd.');}
  if(f.id==='newTipForm'){e.preventDefault();const title=f.querySelector('#tipTitle').value.trim();if(!title)return;const url=f.querySelector('#tipUrl').value.trim();if(url&&!safeUrl(url)){notify('Vul een geldige http- of https-link in.');return}p.tips.unshift({title:title.slice(0,90),kind:f.querySelector('#tipType').value,url,note:f.querySelector('#tipNote').value.trim().slice(0,350)});persist();renderPlace();notify('Tip toegevoegd aan jullie plek.');}
  if(f.id==='newInviteForm'){e.preventDefault();const name=f.querySelector('#inviteName').value.trim();if(!name)return;if(p.members.some(x=>x.name.toLowerCase()===name.toLowerCase())){notify('Die naam staat al in je demo-kring.');return}p.members.push({name:name.slice(0,60),role:f.querySelector('#inviteRole').value+' · demo'});persist();renderPlace();notify('Toegevoegd aan de demo. Er is geen uitnodiging verstuurd.');}
 });
 document.addEventListener('change',e=>{
  const p=placeById(chosenPlace);if(!p)return;
  if(e.target.matches('[data-activities-toggle]')){p.showActivities=e.target.checked;persist();renderPlace();}
  if(e.target.matches('[data-approval-toggle]')){p.requireApproval=e.target.checked;persist();renderPlace();}
  if(e.target.id==='bookingStart'){draftStart=e.target.value;}
  if(e.target.id==='bookingEnd'){draftEnd=e.target.value;}
 });
 // Zet de bestaande testoverzichtspagina om in een echte toegang tot de plekprofielen.
 document.querySelector('[data-page="plekken"]').insertAdjacentHTML('beforeend',`<div class="section"><div class="section-head"><h2>Jouw plek openen</h2></div><p class="section-intro">Open een voorbeeldplek of de plek die je net hebt toegevoegd. Alle onderdelen erachter zijn klikbaar.</p><div class="place-picker" id="placesDemoList"></div></div>`);
 renderPlaces();renderMemberHome();
 // De bestaande Home blijft, maar wordt een persoonlijke startpagina zodra iemand voor 'Mijn Rumaz' kiest.
 document.querySelectorAll('[data-nav]').forEach(x=>x.addEventListener('click',()=>{if(x.dataset.nav==='plekken')renderPlaces();if(x.dataset.nav==='home'||x.dataset.nav==='berichten')renderMemberHome()}));

 document.getElementById('infoBtn').addEventListener('click',()=>notify('Volledige klikdemo. Plekken en berichten zijn alleen lokaal bewaard; echte accounts en betalingen zijn niet actief.'));
})();
