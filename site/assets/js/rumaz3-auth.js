import {getClient, safeReturn, verifiedUser} from './rumaz3-client.js';
const message = document.querySelector('#authMessage');
function tell(text){if(message){message.textContent=text;message.classList.add('visible');}}
const intent=window.RumazIntent;
const placeType=intent?.fromSearch(location.search)||intent?.read();
if(placeType){
 intent.remember(placeType);
 const notice=document.querySelector('#placeIntentMessage');
 if(notice)notice.textContent='Je gaat een '+intent.choices[placeType].label+' toevoegen. Na aanmelden vul je de gegevens in.';
 for(const a of document.querySelectorAll('a[href]'))if(['/app/account/registreren/','/app/account/inloggen/'].includes(a.getAttribute('href')))a.href=intent.route(a.getAttribute('href'),placeType);
}
const nextRoute=()=>{
 const saved=sessionStorage.getItem('rumaz_return_to');
 return saved?safeReturn(saved):placeType?intent.app(placeType):'/app/';
};
const base=location.origin;
const recoveryPage=location.pathname==='/app/account/wachtwoord-instellen/';
const welcomePage=location.pathname==='/app/account/welkom/';
let recoveryGranted=false;
let api;
try {
  api=getClient();
  // Subscribe before initialization finishes: a regular login is not a recovery grant.
  api.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY') recoveryGranted=true;});
} catch { tell('Aanmelden is nog niet beschikbaar. Je gegevens zijn niet verstuurd.'); }
const ready=(async()=>{
  if(!api)return false;
  const {error}=await api.auth.getSession();
  if(error){tell('Deze link is ongeldig of verlopen. Vraag een nieuwe link aan.');return false;}
  const params=new URLSearchParams(location.search);
  if(params.has('error') || new URLSearchParams(location.hash.slice(1)).has('error')){
    tell('Deze link is ongeldig of verlopen. Vraag een nieuwe link aan.');return false;
  }
  // Remove callback parameters only after the SDK has processed the PKCE code.
  if(params.has('code'))history.replaceState(null,'',location.pathname);
  if(placeType&&['/app/account/registreren/','/app/account/inloggen/'].includes(location.pathname)&&await verifiedUser()){
    location.assign(nextRoute());return false;
  }
  if(welcomePage){
    const user=await verifiedUser();
    if(user&&placeType){location.assign(nextRoute());return true;}
    if(!placeType){const notice=document.querySelector('#placeIntentMessage');if(notice&&notice.insertAdjacentHTML)notice.insertAdjacentHTML('beforeend','Geen pleksoort meer geselecteerd? <a href="/app/#kies-plek">Kies je plek opnieuw</a>.');}
    tell(user?'Je e-mailadres is bevestigd. Je kunt verder naar je plekken.':'Je bevestiging is niet voltooid. Open de link op hetzelfde apparaat en in dezelfde browser als je aanmelding, of log opnieuw in.');
  }
  if(recoveryPage && !recoveryGranted)tell('Open je herstellink in dezelfde browser waarin je die hebt aangevraagd. Vraag zo nodig een nieuwe link aan.');
  return true;
})();
for(const form of document.querySelectorAll('form[data-auth-action]')){
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(form.dataset.busy)return;
    const data=new FormData(form),action=form.dataset.authAction;
    const email=String(data.get('email')||'').trim(),password=String(data.get('password')||'');
    if(action==='update' && password!==String(data.get('passwordConfirm')||'')){tell('De wachtwoorden komen niet overeen.');return;}
    if(['register','update'].includes(action)&&password.length<12){tell('Kies een wachtwoord met minimaal 12 tekens.');return;}
    if(!api || !await ready)return;
    const buttons=[...form.querySelectorAll('[type="submit"]')];
    form.dataset.busy='true';buttons.forEach(b=>b.disabled=true);
    try {
      let result;
      if(action==='register'){
        result=await api.auth.signUp({email,password,options:{data:{display_name:String(data.get('displayName')||'').trim().slice(0,80)},emailRedirectTo:base+'/app/account/welkom/'}});
        if(result.error)throw result.error;
        location.assign(intent?intent.route('/app/account/controleer-je-mail/',placeType):'/app/account/controleer-je-mail/');return;
      }
      if(action==='login'){
        result=await api.auth.signInWithPassword({email,password});if(result.error)throw result.error;
        if(!await verifiedUser())throw new Error('UNCONFIRMED');
        const next=nextRoute();
        sessionStorage.removeItem('rumaz_return_to');location.assign(next);return;
      }
      if(action==='forgot'){
        result=await api.auth.resetPasswordForEmail(email,{redirectTo:base+'/app/account/wachtwoord-instellen/'});
        if(result.error)throw result.error;
        tell('Als dit adres bij Rumaz bekend is, ontvang je een e-mail met een herstellink.');return;
      }
      if(action==='update'){
        if(!recoveryGranted || !await verifiedUser()){tell('Je herstellink is ongeldig of verlopen. Vraag een nieuwe link aan.');return;}
        result=await api.auth.updateUser({password});if(result.error)throw result.error;
        recoveryGranted=false;
        const signedOut=await api.auth.signOut();if(signedOut.error)throw signedOut.error;
        form.reset();tell('Je wachtwoord is gewijzigd. Log opnieuw in om je plekken te openen.');return;
      }
    }catch {tell('Het is niet gelukt. Controleer je gegevens of probeer het later opnieuw.');}
    finally {delete form.dataset.busy;buttons.forEach(b=>b.disabled=false);}
  });
}
