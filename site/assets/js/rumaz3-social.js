
(async()=>{
 const intent=window.RumazIntent;
 const requestedType=intent?.fromSearch(location.search);
 const live=window.RUMAZ_AUTH_CONFIG?.enabled===true;
 let remote=null,backend=null;
 if(live){try{backend=await import('./rumaz3-data.js');remote=new backend.RumazData();await remote.session();}catch{document.getElementById('demoToast').textContent='Verbinding niet beschikbaar. Probeer het later opnieuw.';document.getElementById('demoToast').style.display='block';return;}}
 const pendingType=requestedType||(remote?.user?intent?.read():null);
 const incomingInvite=location.hash.match(/^#uitnodiging=([a-f0-9]{64})$/)?.[1];
 if(live&&incomingInvite){sessionStorage.setItem('rumaz_invitation',incomingInvite);history.replaceState(null,'',location.pathname);}
 const login=()=>{sessionStorage.setItem('rumaz_return_to','/app/'+location.hash);location.assign('/app/account/inloggen/');};
 document.body.classList.add('guest');
 const tabs=[['home','Home','i-home'],['plekken','Plekken','i-layers'],['plek','Mijn plek','i-keystone'],['berichten','Berichten','i-chat'],['profiel','Mijn omgeving','i-user']];
 const navMarkup=()=>tabs.map(([id,label,icon])=>`<button class="tab ${id==='home'?'active':''}" type="button" data-nav="${id}" aria-label="${label}" ${id==='home'?'aria-current="page"':''}><svg class="symbol" aria-hidden="true"><use href="#${icon}"/></svg><span class="tab-name">${label}</span></button>`).join('');
 document.getElementById('bottomNav').innerHTML=navMarkup();document.getElementById('desktopNav').innerHTML=navMarkup();
 let user='guest',current='home';const g=document.getElementById('guestBtn'),m=document.getElementById('memberBtn'),modal=document.getElementById('addModal'),toast=document.getElementById('demoToast');let toastTimer;
 function notify(msg){toast.textContent=msg;toast.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.style.display='none',3500)}
 function selectTab(tab){if(live&&['plek','plekken','berichten'].includes(tab)&&!remote.user){login();return;}if(!tabs.some(t=>t[0]===tab))return;if(tab==='plek'){if(user==='guest'){user='member';document.body.classList.remove('guest');g.classList.remove('active');m.classList.add('active');g.setAttribute('aria-pressed','false');m.setAttribute('aria-pressed','true');}renderPlace();}if(tab==='profiel')showHubOverview();current=tab;document.querySelectorAll('.page').forEach(x=>x.classList.toggle('current',x.dataset.page===tab));document.querySelectorAll('[data-nav]').forEach(x=>{const on=x.dataset.nav===tab;x.classList.toggle('active',on);if(on)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});document.getElementById('mainContent').scrollIntoView({block:'start',behavior:'instant'});}
 function setUser(v){if(live&&v==='member'&&!remote.user){login();return;}user=v;document.body.classList.toggle('guest',v==='guest');g.classList.toggle('active',v==='guest');m.classList.toggle('active',v==='member');g.setAttribute('aria-pressed',v==='guest');m.setAttribute('aria-pressed',v==='member');selectTab('home');}
 document.querySelectorAll('[data-nav]').forEach(x=>x.addEventListener('click',()=>{if(user==='guest'&&['berichten','plekken'].includes(x.dataset.nav)){setUser('member');}if(x.dataset.nav==='plek') {openPlace(chosenPlace||'family','overzicht');} else selectTab(x.dataset.nav)}));
 document.querySelectorAll('[data-go]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();selectTab(x.dataset.go)}));

 // Secondary pages sit behind 'Mijn omgeving'; public routes continue to use existing site URLs.
 const hubPages={
  account:{title:'Mijn account',category:'Mijn Rumaz',description:'Beheer je persoonlijke gegevens en toegang tot Rumaz.',route:'/app/account/'},
  uitnodigingen:{title:'Uitnodigingen en kringen',category:'Mijn Rumaz',description:'Een eigen plek deel je met familie en vrienden. Hier zie je wie is uitgenodigd en welke rol iemand heeft. Besloten informatie blijft beschermd door echte toegangsrechten zodra het platform wordt gebouwd.',route:'/app/uitnodigingen/'},
  meldingen:{title:'Meldingen en privacy',category:'Mijn Rumaz',description:'Kies later welke berichten je wilt ontvangen, bijvoorbeeld een nieuwe tip, een uitnodiging of een wijziging in de agenda. Gegevens van je besloten kringen worden niet openbaar.',route:'/app/instellingen/'},
  over:{title:'Over Rumaz',category:'Ontdek Rumaz',description:'Het verhaal van Rumaz: waarom een plek zoveel meer is dan een adres, en hoe de sluitsteen ons met elkaar verbindt.',route:'/over/',url:'https://rumaz.nl/over/'},
  objects:{title:'Rumaz Objects',category:'Ontdek Rumaz',description:'Een afzonderlijke winkel voor de producten van Rumaz. De bestaande Objects- en Mollie-techniek blijft bewaard, maar is in deze demo niet actief. De winkel mag het sociale karakter niet overheersen.',route:'/objects/'},
  transparantie:{title:'Transparantie',category:'Ontdek Rumaz',description:'Hoe Rumaz omgaat met informatie, ervaringen, bronvermeldingen en de mensen die bij een plek horen.',route:'/transparantie/',url:'https://rumaz.nl/transparantie/'},
  contact:{title:'Contact',category:'Ontdek Rumaz',description:'Een vraag, een idee of een mooie ontdekking? Stuur Rumaz een bericht.',route:'/contact/',url:'https://rumaz.nl/contact/'},
  faq:{title:'Veelgestelde vragen',category:'Hulp en voorwaarden',description:'Antwoorden over eigen en gehuurde plekken, familiekringen, uitnodigingen, privacy en praktische informatie.',route:'/faq/',url:'https://rumaz.nl/faq/'},
  voorwaarden:{title:'Algemene voorwaarden',category:'Hulp en voorwaarden',description:'Lees welke afspraken gelden voor Rumaz en waar de grenzen van het gebruik liggen.',route:'/algemene-voorwaarden/',url:'https://rumaz.nl/algemene-voorwaarden/'},
  privacy:{title:'Privacy',category:'Hulp en voorwaarden',description:'Hoe Rumaz zorgvuldig omgaat met persoonsgegevens, gedeelde informatie en jouw privacy.',route:'/privacy/',url:'https://rumaz.nl/privacy/'},
  disclaimer:{title:'Disclaimer',category:'Hulp en voorwaarden',description:'Uitleg over het gebruik van informatie, brongegevens en de tips die mensen met elkaar delen.',route:'/disclaimer/',url:'https://rumaz.nl/disclaimer/'},
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
  document.getElementById('hubDetailRoute').textContent='Pagina: '+item.route;
  const actions=document.getElementById('hubDetailActions');actions.replaceChildren();
  if(['account','over','objects','transparantie','contact','faq','voorwaarden','privacy','disclaimer'].includes(key) && (location.protocol==='http:'||location.protocol==='https:')){const link=document.createElement('a');link.className='btn';link.href=item.route;link.textContent='Open openbare pagina ↗';if(key!=='account'){link.target='_blank';link.rel='noopener noreferrer'}actions.append(link)}
  document.getElementById('hubDetailNote').textContent=['uitnodigingen','meldingen','abonnement','claimen','adverteren'].includes(key)?'Deze mogelijkheid is nog niet actief. Je persoonlijke gegevens en besloten kringen worden hier niet openbaar getoond.':'Bekijk deze informatie binnen Rumaz. In de losse bladerversie zitten de complete openbare pagina’s in het bijbehorende websitepakket.';
  document.getElementById('mainContent').scrollIntoView({block:'start',behavior:'instant'});
 }
 document.querySelectorAll('[data-hub-page]').forEach(b=>b.addEventListener('click',()=>showHubDetail(b.dataset.hubPage)));
 document.getElementById('hubBack').addEventListener('click',()=>{showHubOverview();document.getElementById('mainContent').scrollIntoView({block:'start',behavior:'instant'});});

 g.addEventListener('click',async()=>{if(live){try{await remote.logout();location.reload();}catch{notify('Uitloggen is niet gelukt. Probeer opnieuw.');}return;}setUser('guest')});m.addEventListener('click',()=>setUser('member'));document.getElementById('visitorStart').addEventListener('click',e=>{e.preventDefault();document.getElementById('choicesTitle').focus();});
 const roleInput=document.getElementById('roleInput'),typeInput=document.getElementById('typeInput');
 const addRoles={own:'Mijn eigen plek',shared:'Een plek die ik deel',rent:'Een plek die ik huur'};
 const placeTypes={home:'Woning',chalet:'Chalet',huisje:'Huisje',appartement:'Appartement',camper:'Camper',caravan:'Caravan',static:'Stacaravan',boat:'Boot',other:'Andere plek'};
 const formKind=type=>['chalet','huisje','appartement'].includes(type)?'home':type;
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
  document.querySelectorAll('[data-fields]').forEach(el=>{el.hidden=el.dataset.fields!==formKind(type)});
  document.getElementById('typeSummary').textContent=placeTypes[type]+' · '+addRoles[role];
  document.getElementById('modalIntro').textContent=role==='rent'?'Ook zonder medewerking van de verhuurder kun je jullie verblijf, agenda en tips bij elkaar houden.':'Voeg deze plek toe voor jezelf en je mensen. Jullie vullen samen de praktische informatie en herinneringen aan.';
  document.getElementById('importPreview').hidden=true;
 }
 const open=()=>{modalTrigger=document.activeElement;document.body.classList.add('modal-open');modal.classList.add('open');document.getElementById('importPreview').hidden=true;updateInputs();typeInput.focus()};
 let modalTrigger;
 const close=()=>{modal.classList.remove('open');document.body.classList.remove('modal-open');if(modalTrigger?.isConnected)modalTrigger.focus();};
 const chooseRole=(role,type='home')=>{
  roleInput.value=role;typeInput.value=type;
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
 document.addEventListener('keydown',e=>{if(!modal.classList.contains('open'))return;if(e.key==='Escape'){close();return;}if(e.key==='Tab'){const nodes=[...modal.querySelectorAll('button,input,select,textarea,a[href]')].filter(x=>!x.disabled&&!x.closest('[hidden]')&&x.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 document.getElementById('simulateAdd').addEventListener('click',()=>{
  const type=typeInput.value,role=roleInput.value,name=document.getElementById('ownName').value.trim();
  const values=typeFieldIds[formKind(type)].map(id=>{const el=document.getElementById(id);return {id,label:el.labels?.[0]?.textContent?.trim()||id,value:el.value.trim()}}).filter(x=>x.value);
  if(!values.length&&!name){notify('Geef een adres, kenteken, camping, ligplaats of naam op zodat je de plek herkent.');document.getElementById(typeFieldIds[formKind(type)][0]).focus();return;}
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
 let data;
 try{data=live?await remote.load():localRead();}catch{notify('Je plekken konden niet worden geladen. Vernieuw de pagina om opnieuw te proberen.');return;}
 if(!data || !Array.isArray(data.places)){data={name:'Jij',places:seedPlaces}}
 function persist(){if(live){throw new Error('Local persistence disabled for authenticated data');}try{localStorage.setItem(STORE,JSON.stringify(data))}catch{notify('Browseropslag is niet beschikbaar. Dit blijft alleen in deze sessie zichtbaar.')}renderMemberHome();renderPlaces();}
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let chosenPlace=live?(data.places[0]?.id||''):'family',chosenPart='overzicht',pending=null,calendarMonth=live?new Date(new Date().getFullYear(),new Date().getMonth(),1):new Date(2027,0,1),calendarAs='member',draftStart='',draftEnd='',emailPreview=null;
 const placeById=id=>data.places.find(p=>p.id===id) || data.places[0];
 const niceType=t=>({home:'Woning',chalet:'Chalet',huisje:'Huisje',appartement:'Appartement',camper:'Camper',caravan:'Caravan',static:'Stacaravan',boat:'Boot',other:'Andere plek'}[t]||'Plek');
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
 function openPlace(id,part='overzicht'){if(live&&!remote.user){login();return;}if(live&&!data.places.length){selectTab('plek');return;}
  chosenPlace=placeById(id)?.id||'family';chosenPart=part;
  calendarMonth=chosenPlace==='family'?new Date(2027,0,1):new Date(new Date().getFullYear(),new Date().getMonth(),1);
  if(user!=='member'){user='member';document.body.classList.remove('guest');g.classList.remove('active');m.classList.add('active');g.setAttribute('aria-pressed','false');m.setAttribute('aria-pressed','true');}
  selectTab('plek');renderPlace();
 }
 function getBookings(p){return Array.isArray(p.bookings)?p.bookings:(p.bookings=[])}
 function isReserved(booking,day){return booking.start<=day && day<booking.end}
 function conflicts(p,start,end,exceptId='') {return getBookings(p).some(b=>b.id!==exceptId&&b.status==='approved'&&start<b.end&&end>b.start)}
 function approvedPeople(p){return p.members.filter(x=>x.name!=='Jij').length}
 if(!live&&!data.schemaV4){const sample=seedPlaces.find(p=>p.id==='family');for(const p of data.places){if(p.id==='family' && !Array.isArray(p.bookings))p.bookings=JSON.parse(JSON.stringify(sample.bookings));if(typeof p.showActivities!=='boolean')p.showActivities=false;if(typeof p.requireApproval!=='boolean')p.requireApproval=true;}data.schemaV4=true;try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}}

 function renderPlace(){
  const p=placeById(chosenPlace);
  document.getElementById('placeParts').hidden=!p;
  if(!p){document.getElementById('detailName').textContent='Jouw eerste plek';document.getElementById('detailMeta').textContent='Voeg een plek toe voor jou en je mensen.';document.getElementById('detailMain').innerHTML='<button class="btn" id="firstPlaceAdd" type="button">Plek toevoegen</button>';document.getElementById('firstPlaceAdd').addEventListener('click',()=>chooseRole('own'));return;}
  if(live)calendarAs=p.accessRole==='admin'?'admin':'member';
  document.getElementById('detailName').textContent=p.name;
  document.getElementById('detailMeta').textContent=[(p.type==='home'&&['chalet','huisje','appartement'].includes(p.fields?.find(f=>f.id==='placeSubtype')?.value)?placeTypes[p.fields.find(f=>f.id==='placeSubtype').value]:niceType(p.type)),p.location,p.circle].filter(Boolean).join(' · ');
  const picker=document.getElementById('placeSwitcher');
  picker.innerHTML=data.places.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('');
  document.querySelectorAll('[data-switch-part]').forEach(b=>{const on=b.dataset.switchPart===chosenPart;b.classList.toggle('active',on);if(b.getAttribute('role')==='tab')b.setAttribute('aria-selected',String(on))});
  const main=document.getElementById('detailMain');
  if(chosenPart==='overzicht')main.innerHTML=renderOverview(p);
  if(chosenPart==='prikbord')main.innerHTML=renderBoard(p);
  if(chosenPart==='agenda')main.innerHTML=renderAgenda(p);
  if(chosenPart==='planner')main.innerHTML=renderPlanner(p);
  if(chosenPart==='handleiding')main.innerHTML=renderGuide(p);
  if(chosenPart==='buurt')main.innerHTML=renderNearby(p);
  if(chosenPart==='mensen')main.innerHTML=renderPeople(p);
  const aside=document.getElementById('placeAside');
  aside.innerHTML=`<div class="minihead">Bij ${esc(p.name)}</div><h3>Je vindt het hier.</h3><img class="rz-aside-graphic" src="/assets/img/rumaz-illustratie-informatie-rumaz3.svg" alt="Getekend huis met praktische aanwijzingen en de sluitsteen"/><button class="rz-aside-link" data-switch-part="agenda">Wie komt wanneer? →</button><button class="rz-aside-link" data-switch-part="planner">Wat moet er gebeuren? →</button><button class="rz-aside-link" data-switch-part="handleiding">Hoe werkt het hier? →</button><p class="rz-aside-foot">Alles bij deze plek. Alleen voor jullie kring.</p>`;
 }
 function visualHeader(kind,title,sub){
  const labels={agenda:'Maandkalender',planner:'Aankomst & vertrek',prikbord:'Uit jullie kring',informatie:'Jullie handleiding'};
  const assets={agenda:'/assets/img/rumaz-illustratie-agenda-rumaz3.svg',planner:'/assets/img/rumaz-illustratie-planner-rumaz3.svg',prikbord:'/assets/img/rumaz-illustratie-prikbord-rumaz3.svg',informatie:'/assets/img/rumaz-illustratie-informatie-rumaz3.svg'};
  return `<div class="rz-visual-header"><img src="${assets[kind]||''}" alt="Rumaz lijnillustratie voor ${esc(labels[kind]||kind)} met originele sluitsteen"><div class="rz-visual-headline"><span class="eyebrow">${esc(labels[kind]||kind)}</span><h2>${title}</h2><p>${sub}</p></div></div>`;
 }
 function renderOverview(p){
  const b=getBookings(p),approved=b.filter(x=>x.status==='approved'),pendingCount=b.filter(x=>x.status==='pending').length;
  const next=approved.filter(x=>x.end>=new Date().toISOString().slice(0,10)).sort((x,y)=>x.start.localeCompare(y.start))[0];
  return `<div class="rz-place-welcome"><p class="eyebrow">Jullie plek, jullie mensen</p><h2>${esc(p.name)}</h2><p>Alles voor je volgende verblijf. Bij elkaar, op één vertrouwde plek.</p></div>
  ${Array.isArray(p.fields)?p.fields.filter(f=>['onboarding_rooms','onboarding_beds','onboarding_capacity','onboarding_bathrooms','onboarding_kitchens'].includes(f.id)&&/^\d{1,3}$/.test(String(f.value))).map(f=>`<p>${({onboarding_rooms:p.type==='boat'?'Hutten':'Slaapkamers',onboarding_beds:'Bedden',onboarding_capacity:'Slaapplaatsen',onboarding_bathrooms:'Badkamers',onboarding_kitchens:'Keukens'})[f.id]}: ${esc(f.value)}</p>`).join(''):''}
  <div class="rz-action-four" aria-label="Onderdelen van deze plek">
    <button data-switch-part="agenda"><img src="/assets/img/rumaz-illustratie-agenda-rumaz3.svg" alt="Getekende maandagenda met sluitsteen"><strong>Is er plek?</strong><span>Agenda en aanvragen ↗</span></button>
    <button data-switch-part="planner"><img src="/assets/img/rumaz-illustratie-planner-rumaz3.svg" alt="Getekende vertrekchecklist met sluitsteen"><strong>Goed voorbereid.</strong><span>Aankomst en vertrek ↗</span></button>
    <button data-switch-part="prikbord"><img src="/assets/img/rumaz-illustratie-prikbord-rumaz3.svg" alt="Getekende familieberichten met sluitsteen"><strong>Wat speelt er?</strong><span>Prikbord en foto's ↗</span></button>
    <button data-switch-part="handleiding"><img src="/assets/img/rumaz-illustratie-informatie-rumaz3.svg" alt="Getekende huisinformatie met sluitsteen"><strong>Hoe werkt het?</strong><span>Praktische informatie ↗</span></button>
  </div>
  <div class="rz-place-updates"><div><p class="eyebrow">VOLGEND VERBLIJF</p><strong>${next?`${esc(next.person)} · ${dateFmt(next.start)} – ${dateFmt(next.end)}`:'Nog niets gepland'}</strong><button class="rz-text-action" data-switch-part="agenda">Bekijk kalender →</button></div><div><p class="eyebrow">JOUW KRING</p><strong>${p.members.length===1?'Je bent de eerste.':esc(p.members.map(x=>x.name).slice(0,3).join(', '))}</strong><button class="rz-text-action" data-switch-part="mensen">Nodig iemand uit →</button></div></div>
  ${pendingCount?`<button class="rz-inline-flag" data-switch-part="agenda">${pendingCount} ${pendingCount===1?'aanvraag wacht':'aanvragen wachten'} op reactie →</button>`:''}
  <div class="rz-live-quote"><span>VAN JULLIE SAMEN</span><p>${p.posts[0]?esc(p.posts[0].text):'Heb je een tip of iets leuks te vertellen?'}</p><button data-switch-part="prikbord" class="rz-text-action">Naar het prikbord →</button></div>
  <button class="rz-text-action rz-nearby-link" data-switch-part="buurt">⌖ Ontdek de buurt en jullie favoriete adressen →</button>`;
 }
 function renderBoard(p){return window.RumazViews.prikbord(p,{esc,live,visualHeader});}
 function getPlanner(p){
  if(live&&!Array.isArray(p.planner))p.planner=[];
  if(!Array.isArray(p.planner))p.planner=[
   {id:'arrival-'+p.id,phase:'aankomst',text:'Check aankomsttijd en de route',done:false},
   {id:'during-'+p.id,phase:'verblijf',text:'Bekijk de praktische informatie',done:false},
   {id:'leave-'+p.id,phase:'vertrek',text:'Loop samen de vertrekafspraken na',done:false}
  ];return p.planner;
 }
 function renderPlanner(p){return window.RumazViews.planner(p,{getPlanner,visualHeader,esc});}
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
 function renderAgenda(p){return window.RumazViews.agenda(p,{getBookings,calendarMonth,calendarAs,draftStart,draftEnd,emailPreview,data,live,esc,monthGrid,dateFmt,formatRange,visualHeader});}
 function renderGuide(p){return window.RumazViews.handleiding(p,{esc,visualHeader});}
 function renderNearby(p){return window.RumazViews.omgeving(p,{esc,safeUrl});}
 function renderPeople(p){return window.RumazViews.kring(p,{esc,live});}
 function stepToPart(part){if(!['overzicht','prikbord','agenda','planner','handleiding','buurt','mensen'].includes(part))return;chosenPart=part;renderPlace()}
 document.getElementById('detailBack').addEventListener('click',()=>{renderPlaces();selectTab('plekken')});document.getElementById('placeSwitcher').addEventListener('change',e=>openPlace(e.target.value,'overzicht'));
 document.getElementById('resetDemo').addEventListener('click',()=>{data={name:'Jij',places:JSON.parse(JSON.stringify(seedPlaces))};persist();renderPlaces();openPlace('family');notify('De demonstratie is gereset.');});
 document.getElementById('saveDemoPlace').addEventListener('click',()=>{
  if(document.getElementById('importPreview').hidden){notify('Bekijk eerst de voorbeeldplek.');return}
  const type=typeInput.value,role=roleInput.value;
  const fields=typeFieldIds[formKind(type)].map(id=>{const el=document.getElementById(id);return{id,value:el.value.trim()}}).filter(x=>x.value);
  const name=document.getElementById('ownName').value.trim()||fields.slice(0,2).map(x=>x.value).join(' · ')||'Onze plek';
  if(['chalet','huisje','appartement'].includes(type))fields.push({id:'placeSubtype',value:type});
  const guide=document.getElementById('ownGuide').value.trim();const note=document.getElementById('ownNotes').value.trim();
  pending={id:'plek-'+Date.now(),type:formKind(type),role,name,location:autoLocation(fields),circle:document.getElementById('circleInput').value,fields,members:introMembers(),bookings:[],showActivities:false,requireApproval:true,posts:note?[{id:'p-'+Date.now(),author:'Jij',date:'Zojuist',text:note,likes:0,replies:[],mentions:[]}]:[],events:[],guides:guide?[{title:'Eerste instructie',text:guide}]:[],tips:[]};
  if(live){
   const draft=backend.saveDraft(pending);close();
   if(!remote.user){location.assign('/app/account/registreren/');return;}
   runRemote(async()=>{const id=await remote.createPlace(draft);backend.clearDraft();await refresh();openPlace(id);},'Je plek is opgeslagen.');return;
  }
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
  if(b.dataset.openPart){openPlace(chosenPlace,b.dataset.openPart);return}
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
  if(f.id==='newPlannerForm'){e.preventDefault();const title=f.querySelector('#plannerText').value.trim();const phase=f.querySelector('#plannerPhase').value;if(!title)return;getPlanner(p).push({id:'t-'+Date.now(),phase,text:title.slice(0,130),done:false});persist();renderPlace();notify('Taak aan de voorbeeldplanner toegevoegd.');return}
  if(f.id==='newGuideForm'){e.preventDefault();let title=f.querySelector('#guideTitle').value.trim(),text=f.querySelector('#guideText').value.trim();if(!title||!text)return;p.guides.push({title:title.slice(0,90),text:text.slice(0,900)});persist();renderPlace();const addedGuides=document.querySelectorAll('#detailMain details.wizard-more');addedGuides[addedGuides.length-1]?.setAttribute('open','');notify('Instructie lokaal toegevoegd.');}
  if(f.id==='newTipForm'){e.preventDefault();const title=f.querySelector('#tipTitle').value.trim();if(!title)return;const url=f.querySelector('#tipUrl').value.trim();if(url&&!safeUrl(url)){notify('Vul een geldige http- of https-link in.');return}p.tips.unshift({title:title.slice(0,90),kind:f.querySelector('#tipType').value,url,note:f.querySelector('#tipNote').value.trim().slice(0,350)});persist();renderPlace();notify('Tip toegevoegd aan jullie plek.');}
  if(f.id==='newInviteForm'){e.preventDefault();const name=f.querySelector('#inviteName').value.trim();if(!name)return;if(p.members.some(x=>x.name.toLowerCase()===name.toLowerCase())){notify('Die naam staat al in je demo-kring.');return}p.members.push({name:name.slice(0,60),role:f.querySelector('#inviteRole').value+' · demo'});persist();renderPlace();notify('Toegevoegd aan de demo. Er is geen uitnodiging verstuurd.');}
 });
 document.addEventListener('change',e=>{
  const p=placeById(chosenPlace);if(!p)return;
  if(e.target.matches('[data-plan-toggle]')){const item=getPlanner(p).find(t=>t.id===e.target.dataset.planToggle);if(item){item.done=e.target.checked;persist();renderPlace();}return;}
  if(e.target.matches('[data-activities-toggle]')){p.showActivities=e.target.checked;persist();renderPlace();}
  if(e.target.matches('[data-approval-toggle]')){p.requireApproval=e.target.checked;persist();renderPlace();}
  if(e.target.id==='bookingStart'){draftStart=e.target.value;}
  if(e.target.id==='bookingEnd'){draftEnd=e.target.value;}
 });

 async function refresh(){data=await remote.load();if(!data.places.some(p=>p.id===chosenPlace))chosenPlace=data.places[0]?.id||'';renderPlaces();renderMemberHome();renderPlace();}
 let writeBusy=false;
 async function runRemote(action,success){
  if(writeBusy){notify('Even wachten, je vorige wijziging wordt opgeslagen.');return;}
  writeBusy=true;
  try{await action();if(success)notify(success);}catch{notify('Opslaan is niet gelukt. Controleer je toegang en probeer opnieuw.');try{await refresh();}catch{}}
  finally{writeBusy=false;}
 }
 if(live){
  document.addEventListener('submit',e=>{
   const f=e.target,p=placeById(chosenPlace);if(!['newPostForm','newBookingForm','newPlannerForm','newGuideForm','newTipForm','newInviteForm','newEventForm','demoAccountForm'].includes(f.id))return;
   e.preventDefault();e.stopImmediatePropagation();if(!p)return;
   const val=id=>f.querySelector('#'+id)?.value.trim()||'';
   runRemote(async()=>{
    if(f.id==='newPostForm'){
     await remote.post(p.id,(val('postMention')?'@'+val('postMention')+' — ':'')+val('postText'),f.querySelector('#postPhoto')?.files?.[0]);
    }else if(f.id==='newBookingForm'){await remote.requestStay(p.id,val('bookingStart'),val('bookingEnd'),val('bookingNote'));
    }else if(f.id==='newPlannerForm'){await remote.add('place_tasks',{place_id:p.id,phase:val('plannerPhase'),content:val('plannerText')});
    }else if(f.id==='newGuideForm'){await remote.add('place_guides',{place_id:p.id,title:val('guideTitle'),body:val('guideText')});
    }else if(f.id==='newTipForm'){const url=val('tipUrl');if(url&&!safeUrl(url))throw new Error('INVALID_URL');await remote.add('place_tips',{place_id:p.id,title:val('tipTitle'),source_url:url||null,note:val('tipNote')});
    }else if(f.id==='newInviteForm'){await remote.invite(p.id,val('inviteEmail'),val('inviteRole')==='Gast'?'guest':'member');await refresh();notify('De uitnodigingsmail is verzonden.');return;
    }else if(f.id==='newEventForm'){await remote.add('place_events',{place_id:p.id,title:val('eventTitle'),event_date:val('eventDate'),event_time:val('eventTime')||null,audience:val('eventWho')});
    }else{return;}
    await refresh();notify('Opgeslagen bij jouw plek.');
   });
  },true);
  document.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;const p=placeById(chosenPlace);
   const handled=b.dataset.bookingApprove||b.dataset.bookingReject||b.dataset.commentPost||b.dataset.shareTip||b.dataset.calendarAs||b.dataset.likePost||b.dataset.going||b.dataset.planPost||b.dataset.calTip||b.id==='resetDemo';
   if(!handled)return;e.preventDefault();e.stopImmediatePropagation();if(!p)return;
   if(b.dataset.calendarAs){notify('Je rol wordt bepaald door de rechten bij deze plek.');return;}
   runRemote(async()=>{
    if(b.dataset.bookingApprove||b.dataset.bookingReject){await remote.decideStay(b.dataset.bookingApprove||b.dataset.bookingReject,!!b.dataset.bookingApprove);
    }else if(b.dataset.commentPost){const reply=prompt('Schrijf een reactie:');if(!reply?.trim())return;await remote.add('post_replies',{post_id:b.dataset.commentPost,content:reply.trim().slice(0,800)});
    }else if(b.dataset.shareTip){await remote.add('place_posts',{place_id:p.id,content:'Tip voor jullie: '+b.dataset.shareTip});
    }else if(b.dataset.likePost){const post=p.posts.find(x=>x.id===b.dataset.likePost);await remote.toggle('post_likes','post_id',post.id,!post.liked);
    }else if(b.dataset.going){const event=p.events.find(x=>x.id===b.dataset.going);await remote.toggle('event_attendees','event_id',event.id,!event.going);
    }else if(b.dataset.planPost||b.dataset.calTip){await remote.activities(p.id,true);await refresh();stepToPart('agenda');const field=document.getElementById('eventTitle');if(field){field.value=(b.dataset.calTip||p.posts.find(x=>x.id===b.dataset.planPost)?.text||'').slice(0,100);field.focus();}return;
    }else{return;}
    await refresh();notify('Opgeslagen.');
   });
  },true);
  document.addEventListener('change',e=>{
   const el=e.target,p=placeById(chosenPlace);if(!el.matches('[data-plan-toggle],[data-approval-toggle],[data-activities-toggle]'))return;
   e.stopImmediatePropagation();if(!p)return;
   runRemote(async()=>{if(el.matches('[data-plan-toggle]'))await remote.taskDone(el.dataset.planToggle,el.checked);
    else if(el.matches('[data-approval-toggle]'))await remote.approval(p.id,el.checked);
    else await remote.activities(p.id,el.checked);await refresh();});
  },true);
 }
 // Zet de bestaande testoverzichtspagina om in een echte toegang tot de plekprofielen.
 document.querySelector('[data-page="plekken"]').insertAdjacentHTML('beforeend',`<div class="section"><div class="section-head"><h2>Jouw plek openen</h2></div><p class="section-intro">Open een voorbeeldplek of de plek die je net hebt toegevoegd. Alle onderdelen erachter zijn klikbaar.</p><div class="place-picker" id="placesDemoList"></div></div>`);
 renderPlaces();renderMemberHome();
 // De bestaande Home blijft, maar wordt een persoonlijke startpagina zodra iemand voor 'Mijn Rumaz' kiest.
 document.querySelectorAll('[data-nav]').forEach(x=>x.addEventListener('click',()=>{if(x.dataset.nav==='plekken')renderPlaces();if(x.dataset.nav==='home'||x.dataset.nav==='berichten')renderMemberHome()}));

 // Deep-linking from public pages and account pages returns to the correct social tab.
 function openEntryHash(){let entry;try{entry=decodeURIComponent(location.hash.replace(/^#/,''));}catch{return;}const requested=new URLSearchParams(location.search).get('place');if(requested&&data.places.some(p=>p.id===requested))chosenPlace=requested;
  if(entry==='plek-planner'){openPlace(chosenPlace||'family','planner');return}
  if(entry==='plek-prikbord'){openPlace(chosenPlace||'family','prikbord');return}
  if(entry==='plek-agenda'){openPlace(chosenPlace||'family','agenda');return}
  if(entry==='plek-buurt'){openPlace(chosenPlace||'family','buurt');return}
  if(['home','plekken','plek','berichten','profiel'].includes(entry)){
   if(entry==='plek')openPlace(chosenPlace||'family','overzicht');
   else {if(entry!=='home'&&user==='guest')setUser('member');selectTab(entry)}
  }
 }
 window.addEventListener('hashchange',openEntryHash);
 if(live&&!remote.user&&sessionStorage.getItem('rumaz_invitation')){login();return;}
 if(live&&remote.user){
  setUser('member');
  const invitation=sessionStorage.getItem('rumaz_invitation');
  if(invitation)await runRemote(async()=>{const id=await remote.accept(invitation);sessionStorage.removeItem('rumaz_invitation');await refresh();openPlace(id);},'Je doet mee met deze plek.');
  const draft=backend.readDraft();
  if(draft&&!pendingType)await runRemote(async()=>{const id=await remote.createPlace(draft);backend.clearDraft();await refresh();openPlace(id);},'Je plek is opgeslagen.');
 }
 if(!pendingType)openEntryHash();
 // Read-only visitor intent: controls only which add-place form opens, never permissions.
 const startIntent = new URLSearchParams(location.search).get('start');
 if(!pendingType&&['own','shared','rent'].includes(startIntent)){
  chooseRole(startIntent);
  // Prevent a back/refresh loop while keeping a working, shareable initial deep link.
  try {history.replaceState(history.state,'',location.pathname+location.hash)}catch{}
 }
 function startPlace(code){
  if(!intent?.valid(code))return;
  if(live&&!remote.user){intent.remember(code);history.replaceState(history.state,'','/app/#home');location.assign(intent.route('/app/account/registreren/',code));return;}
  selectTab('plek');chooseRole('own',code==='woning'?'home':code==='boot'?'boat':code);intent.clear();
  history.replaceState(history.state,'','/app/#plek');
 }
 // Home-kaarten gebruiken hun eigen /start-plek/-link; geen JavaScript-omleiding.
 if(pendingType)startPlace(pendingType);
 if(location.hash==='#kies-plek'){selectTab('home');document.getElementById('choicesTitle').focus();}
 document.getElementById('infoBtn').addEventListener('click',()=>notify(live?'Je plekken zijn alleen zichtbaar voor deelnemers met toegang.':'Dit is een lokale demonstratie.'));
 if(live){document.getElementById('resetDemo').hidden=true;g.textContent=remote.user?'Uitloggen':'Bezoeker';g.hidden=!remote.user;}
})();
