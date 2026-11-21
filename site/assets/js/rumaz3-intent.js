/* Only a non-sensitive category is retained. Never an identity or authorization grant. */
(()=>{
 const key='rumaz_place_intent_v1',ttl=86400000;
 const choices=Object.freeze({woning:{kind:'home',label:'Woning'},appartement:{kind:'home',label:'Appartement'},huisje:{kind:'home',label:'Huisje'},camper:{kind:'camper',label:'Camper'},caravan:{kind:'caravan',label:'Caravan'},boot:{kind:'boat',label:'Boot'},chalet:{kind:'home',label:'Chalet'}});
 const valid=code=>typeof code==='string'&&Object.hasOwn(choices,code);
 const clear=()=>{try{localStorage.removeItem(key)}catch{}};
 function remember(code){if(!valid(code))return null;const value={code,savedAt:Date.now()};try{localStorage.setItem(key,JSON.stringify(value))}catch{}return code;}
 function read(){try{const v=JSON.parse(localStorage.getItem(key)||'null');if(valid(v?.code)&&Number.isFinite(v.savedAt)&&Date.now()-v.savedAt>=0&&Date.now()-v.savedAt<ttl)return v.code;}catch{}clear();return null;}
 const fromSearch=search=>{const code=new URLSearchParams(search).get('pleksoort');return valid(code)?code:null;};
 const route=(path,code)=>path+(valid(code)?'?pleksoort='+code:'');
 window.RumazIntent=Object.freeze({choices,valid,remember,read,clear,fromSearch,route,app:code=>route('/app/',code)+'#plek'});
})();
