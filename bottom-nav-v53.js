// BOTTOM_NAV_FANTASY_V59
// Navigation fantasy illustrée inspirée du style validé par l'utilisateur.
(function(){
  const ICONS={
    accueil:`<svg class="fantasyNavSvg" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="homeGold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFF1A8"/><stop offset=".42" stop-color="#E8B44A"/><stop offset="1" stop-color="#8A5718"/></linearGradient>
        <linearGradient id="homeBlue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3FA7FF"/><stop offset="1" stop-color="#173A63"/></linearGradient>
        <radialGradient id="homeGlow"><stop stop-color="#FFF5B8" stop-opacity=".95"/><stop offset=".55" stop-color="#FFC93D" stop-opacity=".45"/><stop offset="1" stop-color="#FFC93D" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="32" cy="53" rx="24" ry="8" fill="url(#homeGlow)"/>
      <path d="M10 48V25l7-3v-8l8 3 7-10 7 10 8-3v8l7 3v23Z" fill="#26344F" stroke="url(#homeGold)" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M18 47V29h8v18M38 47V29h8v18" fill="url(#homeBlue)" stroke="#E8B44A" stroke-width="1.7"/>
      <path d="M25 48V31c0-5 3-9 7-9s7 4 7 9v17Z" fill="url(#homeGold)" stroke="#FFF0B0" stroke-width="1.2"/>
      <path d="M14 24h8M42 24h8M29 17h6" stroke="#FFF0B0" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="35" r="6" fill="#FFF5B8" opacity=".28"/>
    </svg>`,
    equipement:`<svg class="fantasyNavSvg" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="eqSteel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F3F6FA"/><stop offset=".48" stop-color="#A9B7C9"/><stop offset="1" stop-color="#4B5E7B"/></linearGradient>
        <linearGradient id="eqGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFE18A"/><stop offset="1" stop-color="#9B6019"/></linearGradient>
        <linearGradient id="eqBlue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2767B3"/><stop offset="1" stop-color="#10294D"/></linearGradient>
      </defs>
      <path d="M35 10 52 16v16c0 11-7 18-17 23-10-5-17-12-17-23V16Z" fill="url(#eqBlue)" stroke="url(#eqGold)" stroke-width="3"/>
      <path d="M35 16 45 20v12c0 7-4 12-10 16-6-4-10-9-10-16V20Z" fill="#1B2E4D" stroke="#6CA8E8" stroke-width="1.4"/>
      <path d="M13 48 45 16l5-6 4 4-6 5-31 33Z" fill="url(#eqSteel)" stroke="#27364F" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="m12 44 9 9M18 48l-5 5" stroke="url(#eqGold)" stroke-width="4" stroke-linecap="round"/>
      <path d="M35 24 39 30 46 31 41 36 42 43 35 40 29 43 30 36 25 31 32 30Z" fill="url(#eqGold)" opacity=".95"/>
    </svg>`,
    developpement:`<svg class="fantasyNavSvg" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="treeWood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E1A653"/><stop offset=".55" stop-color="#9A5C22"/><stop offset="1" stop-color="#4E2B16"/></linearGradient>
        <linearGradient id="treeLeaf" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#47D5FF"/><stop offset=".55" stop-color="#176FD0"/><stop offset="1" stop-color="#244A9B"/></linearGradient>
        <radialGradient id="treeAura"><stop stop-color="#3FA7FF" stop-opacity=".5"/><stop offset="1" stop-color="#3FA7FF" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="32" cy="51" rx="25" ry="8" fill="url(#treeAura)"/>
      <path d="M32 52c-2-8 1-15-1-22-2-6-8-8-12-12 7 2 11 5 14 9 2-8 7-13 12-17-3 7-6 11-7 18 4-4 8-6 13-8-5 5-10 9-12 15-2 6 2 11 5 17H20c5-4 9-8 12-14" fill="none" stroke="url(#treeWood)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 19 21 10l7 7-6 7ZM33 13l5-10 6 9-6 6ZM45 21l9-5-1 10-7 3ZM14 31l8-4 2 9-8 2ZM40 34l8-5 3 8-8 4Z" fill="url(#treeLeaf)" stroke="#7BE2FF" stroke-width="1.2"/>
      <path d="M14 53c10 3 26 3 36 0" fill="none" stroke="#3FA7FF" stroke-width="1.7" opacity=".8"/>
    </svg>`,
    reglages:`<svg class="fantasyNavSvg" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="gearMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E7D2AE"/><stop offset=".3" stop-color="#A88A63"/><stop offset=".62" stop-color="#65738A"/><stop offset="1" stop-color="#303B50"/></linearGradient>
        <linearGradient id="gearBlue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#74E9FF"/><stop offset=".5" stop-color="#2296FF"/><stop offset="1" stop-color="#2449A7"/></linearGradient>
      </defs>
      <path d="M27 6h10l2 7 6 3 7-3 5 8-5 6v7l5 6-5 8-7-3-6 3-2 8H27l-2-8-6-3-7 3-5-8 5-6v-7l-5-6 5-8 7 3 6-3Z" fill="url(#gearMetal)" stroke="#C7A76B" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="32" cy="31" r="15" fill="#18263D" stroke="#D1B278" stroke-width="2"/>
      <path d="m32 17 11 14-11 14-11-14Z" fill="url(#gearBlue)" stroke="#9CEBFF" stroke-width="1.5"/>
      <path d="M32 18v26M21 31h22" stroke="#D9F8FF" stroke-width="1" opacity=".55"/>
    </svg>`
  };
  const aliases={accueil:'accueil','équipement':'equipement','equipement':'equipement','développement':'developpement','developpement':'developpement','réglages':'reglages','reglages':'reglages'};
  function normalize(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
  function apply(){
    const root=document.getElementById('tabs'); if(!root)return;
    root.querySelectorAll('button,.tab,[data-act]').forEach(el=>{
      const text=normalize(el.textContent);
      const alias=Object.keys(aliases).find(k=>text===k||text.endsWith(k));
      if(!alias)return;
      const key=aliases[alias];
      el.classList.add('fantasyNavV59');
      el.dataset.navIconV59='1';
      const old=el.querySelector('svg,img');
      if(old) old.outerHTML=ICONS[key]; else el.insertAdjacentHTML('afterbegin',ICONS[key]);
    });
  }
  const css=document.createElement('style');
  css.textContent=`
    #tabs .fantasyNavV59{position:relative;overflow:visible}
    #tabs .fantasyNavV59 .fantasyNavSvg{width:38px;height:38px;display:block;margin:0 auto 2px;overflow:visible;filter:drop-shadow(0 3px 4px #000b);transition:transform .15s ease,filter .15s ease,opacity .15s ease}
    #tabs .fantasyNavV59:not(.on):not(.active):not([aria-current="page"]) .fantasyNavSvg{opacity:.72;filter:saturate(.72) brightness(.78) drop-shadow(0 2px 3px #000b)}
    #tabs .fantasyNavV59.on .fantasyNavSvg,#tabs .fantasyNavV59.active .fantasyNavSvg,#tabs .fantasyNavV59[aria-current="page"] .fantasyNavSvg{transform:translateY(-2px) scale(1.08);opacity:1;filter:drop-shadow(0 0 8px #E8B44A99) drop-shadow(0 3px 4px #000b)}
    #tabs .fantasyNavV59.on::before,#tabs .fantasyNavV59.active::before,#tabs .fantasyNavV59[aria-current="page"]::before{content:"";position:absolute;left:26%;right:26%;top:-2px;height:3px;border-radius:999px;background:linear-gradient(90deg,transparent,#FBDD8C 25%,#E8B44A 75%,transparent);box-shadow:0 0 9px #E8B44A}
    @media(max-width:360px){#tabs .fantasyNavV59 .fantasyNavSvg{width:34px;height:34px}}
  `;
  document.head.appendChild(css);
  new MutationObserver(apply).observe(document.getElementById('tabs')||document.body,{childList:true,subtree:true});
  apply();
})();
