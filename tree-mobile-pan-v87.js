/* SHADOWREACH · tree camera bridge v88 */
(function(){
  'use strict';
  if (window.__srTreeCameraV88Loading) return;
  window.__srTreeCameraV88Loading = true;
  var s = document.createElement('script');
  s.src = 'tree-camera-v88.js?v=2026.09.07.88';
  s.async = false;
  s.onload = function(){ window.__srTreeCameraV88Loaded = true; };
  s.onerror = function(){ window.__srTreeCameraV88Loaded = false; };
  document.body.appendChild(s);
})();
