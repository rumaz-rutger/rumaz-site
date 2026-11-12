(()=>{
  const root=document.documentElement;
  const header=document.getElementById('siteHeader');
  const hero=document.querySelector('.hero');
  const keystone=document.querySelector('.keystone-stage');
  const keystoneArch=document.querySelector('.keystone-arch');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear();

  const toggle=document.querySelector('.menu-toggle');
  const nav=document.getElementById('primaryNav');
  const closeMenu=()=>{
    if(!header||!toggle)return;
    header.classList.remove('menu-open');
    document.body.classList.remove('menu-active');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Menu openen');
  };
  if(toggle&&header){
    toggle.addEventListener('click',()=>{
      const open=!header.classList.contains('menu-open');
      header.classList.toggle('menu-open',open);
      document.body.classList.toggle('menu-active',open);
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Menu sluiten':'Menu openen');
    });
    nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    window.addEventListener('resize',()=>{if(window.innerWidth>820)closeMenu()});
  }

  /* Add reveals systematically so every page uses the same movement language. */
  const addReveal=(el,variant='up',delay=0)=>{
    if(!el)return;
    if(!el.hasAttribute('data-reveal'))el.setAttribute('data-reveal',variant);
    if(delay)el.style.setProperty('--reveal-delay',`${delay}ms`);
  };
  const stagger=(selector,step=90,variant='up',start=0)=>{
    document.querySelectorAll(selector).forEach((el,i)=>addReveal(el,variant,start+i*step));
  };

  /* Homepage and shared section choreography. */
  document.querySelectorAll('.section-number').forEach(el=>addReveal(el,'up',0));
  document.querySelectorAll('.editorial-head').forEach(head=>{
    const kids=[...head.children];
    kids.forEach((el,i)=>addReveal(el,i===0?'up':'right',i*110));
  });
  stagger('.premium-card',105,'up',40);
  stagger('.editorial-item',85,'up',20);
  stagger('.metric',80,'up',0);
  stagger('.service-list article',85,'up',0);
  stagger('.faq-item',70,'up',0);
  stagger('.legal > *',55,'up',0);
  document.querySelectorAll('.contact-grid').forEach(grid=>[...grid.children].forEach((el,i)=>addReveal(el,i===0?'up':'right',i*120)));
  [...document.querySelectorAll('.footer-grid > *')].forEach((el,i)=>addReveal(el,'up',i*65));
  [...document.querySelectorAll('.footer-bottom > *')].forEach((el,i)=>addReveal(el,'up',i*55));

  /* Inner page hero sequence. */
  document.querySelectorAll('.page-hero').forEach(ph=>{
    addReveal(ph.querySelector('.crumbs'),'up',0);
    const copyRoot=ph.querySelector('.page-hero-copy')||ph;
    addReveal(copyRoot.querySelector(':scope > .eyebrow'),'up',55);
    addReveal(copyRoot.querySelector(':scope > h1'),'up',110);
    const bodyCopy=[...copyRoot.children].filter(el=>el.tagName==='P'&&!el.classList.contains('eyebrow'));
    bodyCopy.forEach((el,i)=>addReveal(el,'up',175+i*75));
    const visual=ph.querySelector('.page-hero-visual'); if(visual)addReveal(visual,'scale',210+bodyCopy.length*60);
  });

  /* Homepage hero gets a slightly more deliberate cadence. */
  if(hero){
    const heroSequence=[...hero.querySelectorAll('.hero-copy-wrap [data-reveal]'),hero.querySelector('.hero-foot')].filter(Boolean);
    heroSequence.forEach((el,i)=>el.style.setProperty('--reveal-delay',`${60+i*90}ms`));
  }

  if(keystoneArch)addReveal(keystoneArch,'scale',130);

  if(reduced){
    document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('in'));
  } else {
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target)}
    }),{threshold:.08,rootMargin:'0px'});
    document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
  }

  let ticking=false;
  const update=()=>{
    const y=window.scrollY||0;
    root.style.setProperty('--sy',y.toFixed(1));
    if(header)header.classList.toggle('scrolled',y>32);

    /* A very small scroll drift inside the keystone image, including touch devices. */
    if(keystoneArch&&!reduced){
      const r=keystoneArch.getBoundingClientRect();
      const vh=window.innerHeight||1;
      const p=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));
      keystoneArch.style.setProperty('--keystone-scroll',p.toFixed(4));
    }
    ticking=false;
  };
  const onScroll=()=>{if(!ticking){requestAnimationFrame(update);ticking=true}};
  window.addEventListener('scroll',onScroll,{passive:true});
  update();

  /* Desktop/pointer hero depth is deliberately preserved. */
  if(!reduced&&hero){
    hero.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch')return;
      const r=hero.getBoundingClientRect();
      const mx=((e.clientX-r.left)/r.width-.5)*2;
      const my=((e.clientY-r.top)/r.height-.5)*2;
      root.style.setProperty('--mx',mx.toFixed(3));
      root.style.setProperty('--my',my.toFixed(3));
    });
    hero.addEventListener('pointerleave',()=>{root.style.setProperty('--mx','0');root.style.setProperty('--my','0')});
  }

  /* Cards keep the premium tilt on fine-pointer devices; scroll reveal does the work on touch. */
  if(!reduced&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('[data-tilt]').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const rx=((e.clientY-r.top)/r.height-.5)*-3.2;
        const ry=((e.clientX-r.left)/r.width-.5)*3.8;
        card.style.transform=`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  document.querySelectorAll('.faq-q').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');const open=!item.classList.contains('open');item.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));}));
})();
