/* SHADOWREACH · tree view bridge v90 */
(function(){
  'use strict';
  if (window.__srTreeSimpleV90Loading) return;
  window.__srTreeSimpleV90Loading = true;
  var s = document.createElement('script');
  s.src = 'tree-simple-v90.js?v=2026.09.07.90';
  s.async = false;
  s.onload = function(){
    window.__srTreeSimpleV90Loaded = true;
    try { if (typeof render === 'function') render(); } catch(_) {}
  };
  s.onerror = function(){ window.__srTreeSimpleV90Loaded = false; };
  document.body.appendChild(s);
})();
