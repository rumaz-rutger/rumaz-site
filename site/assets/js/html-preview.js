(()=>{
 const config=JSON.parse(document.getElementById('rumaz-html-config').textContent);
 const base=new URL(config.root,location.href);
 const fix=()=>document.querySelectorAll('a[href^="/"]').forEach(a=>{const raw=a.getAttribute('href');if(raw.startsWith('//'))return;const url=new URL(raw.slice(1),base);if(url.pathname.endsWith('/'))url.pathname+='index.html';a.setAttribute('href',url.href);});
 new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});fix();
})();