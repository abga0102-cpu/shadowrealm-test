// BOTTOM_NAV_FANTASY_V66
// Navigation principale fantasy. V188 standardizes every primary tab to the same DOM contract.
(function(){
  const ICONS={
    accueil:`<span class="fantasyNavIcon fantasyHome"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fhg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFF2A6"/><stop offset=".45" stop-color="#E7B64D"/><stop offset="1" stop-color="#8A5718"/></linearGradient><linearGradient id="fhb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4CB5FF"/><stop offset="1" stop-color="#123766"/></linearGradient></defs><ellipse cx="32" cy="54" rx="24" ry="5" fill="#E8B44A" opacity=".28"/><path d="M10 48V25l8-5v-7l8 5 6-10 6 10 8-5v7l8 5v23H10Z" fill="url(#fhg)" stroke="#5B3510" stroke-width="2"/><path d="M16 29h8v13h-8zm24 0h8v13h-8z" fill="url(#fhb)"/><path d="M25 48V32c0-5 3-9 7-9s7 4 7 9v16H25Z" fill="#FFCF45" stroke="#6D430F" stroke-width="2"/><path d="M29 48V33c0-3 1-5 3-5s3 2 3 5v15" fill="#FFF1A0" opacity=".75"/></svg></span>`,
    equipement:`<span class="fantasyNavIcon fantasyEquip"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="feg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF1A4"/><stop offset=".5" stop-color="#C99432"/><stop offset="1" stop-color="#6C4214"/></linearGradient><linearGradient id="fes" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset=".45" stop-color="#AFC5DE"/><stop offset="1" stop-color="#4C6380"/></linearGradient><linearGradient id="feb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#376DA8"/><stop offset="1" stop-color="#142B4C"/></linearGradient></defs><path d="M35 10c8 5 14 5 20 3v20c0 11-8 17-20 21-12-4-20-10-20-21V13c6 2 12 2 20-3Z" fill="url(#feb)" stroke="url(#feg)" stroke-width="3"/><path d="M20 16 48 44" stroke="#5A3510" stroke-width="7" stroke-linecap="round"/><path d="M18 12 52 46" stroke="url(#fes)" stroke-width="4" stroke-linecap="round"/><path d="m14 11 9 1-8 8Z" fill="url(#feg)"/><path d="m47 38 8 8-4 4-8-8Z" fill="url(#feg)"/></svg></span>`,
    developpement:`<span class="fantasyNavIcon fantasyDev"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fdg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFD66A"/><stop offset="1" stop-color="#784616"/></linearGradient><radialGradient id="fdb"><stop stop-color="#8EEBFF"/><stop offset=".45" stop-color="#2D9BFF"/><stop offset="1" stop-color="#0E3D82"/></radialGradient></defs><ellipse cx="32" cy="55" rx="23" ry="5" fill="#178BFF" opacity=".25"/><path d="M32 54c-2-10 3-15 1-24-1-7 2-14 3-18-7 9-8 15-7 22-3-5-7-8-12-10 7 6 9 13 8 21-5 0-9 3-12 8h38c-4-5-8-8-13-8 1-8 4-15 10-22-6 3-10 7-13 12 1-9 0-14-3-23" fill="none" stroke="url(#fdg)" stroke-width="5" stroke-linecap="round"/><g fill="url(#fdb)" stroke="#62CFFF" stroke-width="1"><path d="M15 23c5-5 10-4 13 1-5 4-10 4-13-1Z"/><path d="M39 20c4-6 10-7 14-3-3 6-8 8-14 3Z"/><path d="M25 13c2-7 7-10 12-7-1 7-5 10-12 7Z"/><path d="M43 31c5-4 10-2 12 3-5 4-10 3-12-3Z"/><path d="M14 35c5-4 10-2 12 3-5 4-10 3-12-3Z"/></g></svg></span>`,
    reglages:`<span class="fantasyNavIcon fantasySettings"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fsg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E8D3A2"/><stop offset=".45" stop-color="#987044"/><stop offset="1" stop-color="#4C3421"/></linearGradient><radialGradient id="fsb"><stop stop-color="#C8F4FF"/><stop offset=".35" stop-color="#3BB7FF"/><stop offset="1" stop-color="#14509C"/></radialGradient></defs><path d="m32 7 5 6 8-1 2 8 7 4-4 7 4 7-7 4-2 8-8-1-5 6-5-6-8 1-2-8-7-4 4-7-4-7 7-4 2-8 8 1 5-6Z" fill="url(#fsg)" stroke="#D2B57A" stroke-width="2"/><circle cx="32" cy="31" r="15" fill="#17243A" stroke="#D2B57A" stroke-width="2"/><path d="m32 18 10 13-10 13-10-13Z" fill="url(#fsb)" stroke="#70D6FF" stroke-width="2"/></svg></span>`
  };
  const LABELS={accueil:'Accueil',equipement:'Équipement',developpement:'Développement',reglages:'Réglages'};
  function normalize(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')}
  function keyFor(el){const t=normalize(el.textContent);if(t.includes('accueil'))return'accueil';if(t.includes('equipement'))return'equipement';if(t.includes('developpement'))return'developpement';if(t.includes('reglages'))return'reglages';return''}
  function directPrimaryTabs(root){return Array.from(root.children).filter(el=>el.matches('.tab,button,[data-act]'))}
  function ensureStructure(el,k){
    let ico=el.querySelector(':scope > .ico');
    if(!ico){ico=document.createElement('span');ico.className='ico';el.insertBefore(ico,el.firstChild);}

    let icon=el.querySelector('.fantasyNavIcon');
    if(!icon){
      const old=ico.querySelector('svg,img')||el.querySelector(':scope > svg,:scope > img');
      if(old)old.remove();
      ico.insertAdjacentHTML('beforeend',ICONS[k]);
      icon=ico.querySelector('.fantasyNavIcon');
    }else if(icon.parentElement!==ico){ico.appendChild(icon);}

    let label=el.querySelector(':scope > .navLabel');
    if(!label){
      label=Array.from(el.children).find(ch=>ch.matches('span')&&!ch.classList.contains('ico')&&!ch.classList.contains('fantasyNavIcon')&&!ch.classList.contains('dot'))||null;
      if(!label){label=document.createElement('span');el.appendChild(label);}
      label.classList.add('navLabel');
    }
    label.textContent=LABELS[k];

    Array.from(el.childNodes).forEach(node=>{
      if(node.nodeType===3&&normalize(node.textContent))node.remove();
    });
    Array.from(el.children).forEach(ch=>{
      if(ch===ico||ch===label||ch.classList.contains('dot'))return;
      if(ch.matches('span')&&!ch.dataset.act&&!ch.querySelector('[data-act]'))ch.remove();
    });

    if(label.previousElementSibling!==ico)el.insertBefore(ico,label);
    el.classList.add('fantasyNavV66');
    el.classList.remove('fantasyNavV65');
    el.dataset.fantasyNav='66';
    el.dataset.navKey=k;
  }
  function apply(){
    const root=document.getElementById('tabs');if(!root)return;
    directPrimaryTabs(root).forEach(el=>{const k=keyFor(el)||el.dataset.navKey||'';if(k)ensureStructure(el,k);});
  }
  const css=document.createElement('style');css.id='fantasyNavStyleV66';css.textContent=`
    #tabs .fantasyNavV66{position:relative;overflow:visible}
    #tabs .fantasyNavV66>.ico{display:block}
    #tabs .fantasyNavIcon{width:38px;height:38px;display:block;margin:0 auto;filter:drop-shadow(0 3px 4px #000a);transition:filter .18s,opacity .18s}
    #tabs .fantasyNavIcon svg{width:100%;height:100%;display:block;overflow:visible}
    #tabs .fantasyNavV66:not(.on):not(.active):not([aria-current="page"]) .fantasyNavIcon{opacity:.62;filter:saturate(.72) brightness(.78) drop-shadow(0 2px 3px #0009)}
    #tabs .fantasyNavV66.on .fantasyNavIcon,#tabs .fantasyNavV66.active .fantasyNavIcon,#tabs .fantasyNavV66[aria-current="page"] .fantasyNavIcon{filter:brightness(1.16) saturate(1.15) drop-shadow(0 0 8px #E8B44A99) drop-shadow(0 3px 4px #000a)}
    #tabs .fantasyNavV66.on,#tabs .fantasyNavV66.active,#tabs .fantasyNavV66[aria-current="page"]{color:#FBDD8C!important;text-shadow:0 0 10px #E8B44A66}
  `;document.getElementById('fantasyNavStyleV65')?.remove();document.head.appendChild(css);
  const root=document.getElementById('tabs');if(root)new MutationObserver(apply).observe(root,{childList:true,subtree:true});
  apply();
})();