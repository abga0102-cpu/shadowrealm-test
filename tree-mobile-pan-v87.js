/* SHADOWREACH · tree view bridge v92 */
(function(){
  'use strict';
  if (window.__srTreeForgeV92Loading) return;
  window.__srTreeForgeV92Loading = true;
  var s = document.createElement('script');
  s.src = 'tree-forgemaster-v92.js?v=2026.09.07.92';
  s.async = false;
  s.onload = function(){
    window.__srTreeForgeV92Loaded = true;
    try { if (typeof render === 'function') render(); } catch(_) {}
  };
  s.onerror = function(){ window.__srTreeForgeV92Loaded = false; };
  document.body.appendChild(s);
})();
