/* SHADOWREACH · tree camera bridge v89 */
(function(){
  'use strict';
  if (window.__srTreeCameraV89Loading) return;
  window.__srTreeCameraV89Loading = true;
  var s = document.createElement('script');
  s.src = 'tree-camera-v88.js?v=2026.09.07.89';
  s.async = false;
  s.onload = function(){ window.__srTreeCameraV89Loaded = true; };
  s.onerror = function(){ window.__srTreeCameraV89Loaded = false; };
  document.body.appendChild(s);
})();
