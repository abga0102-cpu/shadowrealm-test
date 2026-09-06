// BOTTOM_NAV_ICONS_V53
// Icônes vectorielles sobres pour la navigation principale. Aucun nouvel asset image.
(function(){
  const ICONS={
    'accueil':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.2 12 4l8.5 7.2v8.3a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5Z"/><path d="m2.5 12 9.5-8 9.5 8"/></svg>','équipement':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.2 5.2 4.6-2 2 2-2 4.6-8.9 8.9-4.6 1 1-4.6Z"/><path d="m12.5 6.9 4.6 4.6M4 4l5 5M3 3l3.5 1L4 6.5Z"/></svg>','developpement':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V9M12 13c-4.2 0-7-2.5-7-6 4.2 0 7 2.1 7 6ZM12 10c.2-4 2.7-6.5 7-6.5.1 4-2.3 6.5-7 6.5Z"/><path d="M8 21h8"/></svg>','développement':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V9M12 13c-4.2 0-7-2.5-7-6 4.2 0 7 2.1 7 6ZM12 10c.2-4 2.7-6.5 7-6.5.1 4-2.3 6.5-7 6.5Z"/><path d="M8 21h8"/></svg>','réglages':'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.2 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.5 1a8.2 8.2 0 0 0-2.6-1.5L13.8 2h-3.9l-.4 3.1A8.2 8.2 0 0 0 7 6.6l-2.5-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.5-1a8.2 8.2 0 0 0 2.6 1.5l.4 3.1h3.9l.4-3.1a8.2 8.2 0 0 0 2.6-1.5l2.5 1 2-3.4Z"/></svg>'
  };
  function normalize(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
  function apply(){
    const root=document.getElementById('tabs'); if(!root)return;
    root.querySelectorAll('button,.tab,[data-act]').forEach(el=>{
      const key=normalize(el.textContent);
      const name=Object.keys(ICONS).find(k=>key===k||key.endsWith(k));
      if(!name||el.dataset.navIconV53)return;
      el.dataset.navIconV53='1'; el.classList.add('navIconV53');
      const old=el.querySelector('svg,img'); if(old) old.outerHTML=ICONS[name];
      else el.insertAdjacentHTML('afterbegin',ICONS[name]);
    });
  }
  const css=document.createElement('style');
  css.textContent='#tabs .navIconV53 svg{width:27px;height:27px;display:block;margin:0 auto 4px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 2px 3px #0008)}#tabs .navIconV53[aria-current="page"] svg,#tabs .navIconV53.on svg,#tabs .navIconV53.active svg{stroke-width:2.15;filter:drop-shadow(0 0 6px currentColor)}';
  document.head.appendChild(css);
  new MutationObserver(apply).observe(document.getElementById('tabs')||document.body,{childList:true,subtree:true});
  apply();
})();