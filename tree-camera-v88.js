/* SHADOWREACH · radial tree camera v89 */
(function(){
'use strict';
var cam={x:0,y:0,scale:.72,ready:false},ABS_MIN=.30,MAX=1.35,SIZE=1100;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function distance(a,b){var x=a.clientX-b.clientX,y=a.clientY-b.clientY;return Math.sqrt(x*x+y*y);}
function midpoint(a,b){return{x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2};}
function install(svg){
 if(!svg||svg.dataset.srCamera==='1')return;svg.dataset.srCamera='1';
 var parent=svg.parentNode;if(!parent)return;
 var viewport=document.createElement('div'),stage=document.createElement('div');
 viewport.className='srTreeCamera';stage.className='srTreeStage';parent.insertBefore(viewport,svg);viewport.appendChild(stage);stage.appendChild(svg);
 svg.style.width=SIZE+'px';svg.style.height=SIZE+'px';svg.style.minWidth=SIZE+'px';svg.style.maxWidth='none';svg.style.margin='0';svg.style.touchAction='none';
 function minScale(){var vw=Math.max(1,viewport.clientWidth),vh=Math.max(1,viewport.clientHeight);return clamp(Math.min((vw-20)/SIZE,(vh-20)/SIZE),ABS_MIN,.52);}
 function normalize(){var vw=viewport.clientWidth,vh=viewport.clientHeight,w=SIZE*cam.scale,h=SIZE*cam.scale,m=54,minX,maxX,minY,maxY;if(w<=vw){minX=maxX=(vw-w)/2;}else{minX=vw-w-m;maxX=m;}if(h<=vh){minY=maxY=(vh-h)/2;}else{minY=vh-h-m;maxY=m;}cam.x=clamp(cam.x,minX,maxX);cam.y=clamp(cam.y,minY,maxY);}
 function render(){cam.scale=clamp(cam.scale,minScale(),MAX);normalize();stage.style.transform='translate3d('+cam.x+'px,'+cam.y+'px,0) scale('+cam.scale+')';}
 function center(force){if(cam.ready&&!force)return;cam.scale=clamp(cam.scale,minScale(),MAX);cam.x=(viewport.clientWidth-SIZE*cam.scale)/2;cam.y=(viewport.clientHeight-SIZE*cam.scale)/2;cam.ready=true;render();}
 requestAnimationFrame(function(){requestAnimationFrame(function(){center(false);});});
 var pointers={},drag=null,pinch=null,moved=false;
 function pts(){return Object.keys(pointers).map(function(k){return pointers[k];});}
 function localMid(a,b){var r=viewport.getBoundingClientRect(),m=midpoint(a,b);return{x:m.x-r.left,y:m.y-r.top};}
 function beginPinch(p){pinch={d:Math.max(20,distance(p[0],p[1])),scale:cam.scale,mid:localMid(p[0],p[1]),x:cam.x,y:cam.y};drag=null;}
 viewport.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;try{viewport.setPointerCapture(e.pointerId);}catch(_){ }pointers[e.pointerId]={clientX:e.clientX,clientY:e.clientY};moved=false;var p=pts();if(p.length===1){drag={px:p[0].clientX,py:p[0].clientY,x:cam.x,y:cam.y};pinch=null;}else if(p.length>=2)beginPinch(p);},{passive:false});
 viewport.addEventListener('pointermove',function(e){if(!pointers[e.pointerId])return;pointers[e.pointerId]={clientX:e.clientX,clientY:e.clientY};var p=pts();if(p.length>=2){e.preventDefault();moved=true;if(!pinch)beginPinch(p);var m=localMid(p[0],p[1]),ns=clamp(pinch.scale*(distance(p[0],p[1])/pinch.d),minScale(),MAX),wx=(pinch.mid.x-pinch.x)/pinch.scale,wy=(pinch.mid.y-pinch.y)/pinch.scale;cam.scale=ns;cam.x=m.x-wx*ns;cam.y=m.y-wy*ns;render();}else if(p.length===1&&drag){e.preventDefault();var dx=p[0].clientX-drag.px,dy=p[0].clientY-drag.py;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;cam.x=drag.x+dx;cam.y=drag.y+dy;render();}},{passive:false});
 function end(e){delete pointers[e.pointerId];var p=pts();if(p.length===1){drag={px:p[0].clientX,py:p[0].clientY,x:cam.x,y:cam.y};pinch=null;}else if(p.length>=2)beginPinch(p);else{drag=null;pinch=null;}render();}
 viewport.addEventListener('pointerup',end,{passive:false});viewport.addEventListener('pointercancel',end,{passive:false});viewport.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
 if(typeof ResizeObserver!=='undefined'){var ro=new ResizeObserver(render);ro.observe(viewport);}window.__srTreeCamera={reset:function(){cam.ready=false;center(true);},fit:function(){cam.scale=minScale();cam.ready=false;center(true);},get:function(){return{x:cam.x,y:cam.y,scale:cam.scale,min:minScale()};}};
}
function scan(root){var s=root&&root.querySelectorAll?root:document,a=s.querySelectorAll?s.querySelectorAll('.srRadialTree'):[];for(var i=0;i<a.length;i++)install(a[i]);if(root&&root.matches&&root.matches('.srRadialTree'))install(root);}
var style=document.createElement('style');style.textContent='.srTreeViewport{display:contents!important}.srTreeCamera{width:100%;height:min(72vh,720px);min-height:430px;overflow:hidden!important;position:relative;touch-action:none;overscroll-behavior:contain;border-radius:18px;box-sizing:border-box;background:#050811}.srTreeStage{position:absolute;left:0;top:0;width:1100px;height:1100px;transform-origin:0 0;will-change:transform}.srTreeCamera .srRadialTree{width:1100px!important;height:1100px!important;min-width:1100px!important;max-width:none!important;margin:0!important;touch-action:none!important;user-select:none;-webkit-user-select:none}@media(max-width:600px){.srTreeCamera{height:68vh;min-height:390px}}';document.head.appendChild(style);scan(document);var obs=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var ns=ms[i].addedNodes||[];for(var j=0;j<ns.length;j++)if(ns[j].nodeType===1)scan(ns[j]);}});if(document.body)obs.observe(document.body,{childList:true,subtree:true});else document.addEventListener('DOMContentLoaded',function(){scan(document);obs.observe(document.body,{childList:true,subtree:true});},{once:true});
})();
