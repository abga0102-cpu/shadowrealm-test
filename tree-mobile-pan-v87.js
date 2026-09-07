/* SHADOWREACH · radial tree mobile viewport v87
   Creates a real two-axis viewport around the radial SVG and centers on NOYAU.
*/
(function(){
  'use strict';

  function install(svg){
    if(!svg || svg.dataset.srPanReady==='1') return;
    svg.dataset.srPanReady='1';

    var parent=svg.parentNode;
    if(!parent) return;

    var viewport=document.createElement('div');
    viewport.className='srTreeViewport';
    viewport.setAttribute('data-sr-tree-viewport','1');
    parent.insertBefore(viewport,svg);
    viewport.appendChild(svg);

    /* The tree keeps its readable 1100px canvas. The viewport is the phone-sized
       window through which the player moves around it. */
    svg.style.margin='0';
    svg.style.maxWidth='none';
    svg.style.display='block';
    svg.style.touchAction='pan-x pan-y';

    function center(){
      var maxX=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
      var maxY=Math.max(0,viewport.scrollHeight-viewport.clientHeight);
      viewport.scrollLeft=Math.round(maxX/2);
      viewport.scrollTop=Math.round(maxY/2);
    }

    requestAnimationFrame(function(){
      requestAnimationFrame(center);
    });

    /* Re-center only when the viewport itself changes size. Normal tree renders
       recreate the SVG and therefore get their own fresh centered viewport. */
    if(typeof ResizeObserver!=='undefined'){
      var ro=new ResizeObserver(function(){
        if(!viewport.dataset.srCentered){
          viewport.dataset.srCentered='1';
          center();
        }
      });
      ro.observe(viewport);
    }
  }

  function scan(root){
    var scope=root&&root.querySelectorAll?root:document;
    var svgs=scope.querySelectorAll?scope.querySelectorAll('.srRadialTree'):[];
    for(var i=0;i<svgs.length;i++) install(svgs[i]);
    if(root&&root.matches&&root.matches('.srRadialTree')) install(root);
  }

  var style=document.createElement('style');
  style.textContent=
    '.srTreeViewport{width:100%;height:min(72vh,720px);min-height:430px;overflow:auto!important;'+
    'position:relative;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-x pan-y;'+
    'scrollbar-width:none;border-radius:18px;box-sizing:border-box}'+
    '.srTreeViewport::-webkit-scrollbar{display:none}'+
    '.srTreeViewport>.srRadialTree{min-width:1100px!important;width:1100px!important;height:1100px!important;'+
    'max-width:none!important;flex:0 0 auto!important;margin:0!important}'+
    '@media(max-width:600px){.srTreeViewport{height:68vh;min-height:390px}}';
  document.head.appendChild(style);

  scan(document);
  var obs=new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var nodes=muts[i].addedNodes||[];
      for(var j=0;j<nodes.length;j++){
        if(nodes[j].nodeType===1) scan(nodes[j]);
      }
    }
  });
  if(document.body) obs.observe(document.body,{childList:true,subtree:true});
  else document.addEventListener('DOMContentLoaded',function(){scan(document);obs.observe(document.body,{childList:true,subtree:true});},{once:true});
})();
