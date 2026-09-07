/* SHADOWREACH · clearer personal-tree labels v117
   Naming only. No effects, requirements, costs, levels, timers or saves changed. */
(function(){
'use strict';
if(typeof TREE_BY_ID==='undefined')return;
var names={
  n1_07:'Gain d’Or I',
  n2_07:'Gain d’Or II',
  n3_07:'Gain d’Or III',
  n4_07:'Gain d’Or IV'
};
Object.keys(names).forEach(function(id){
  var n=TREE_BY_ID[id];
  if(!n)return;
  n.label=names[id];
  n.short=names[id];
});
try{if(typeof render==='function')render();}catch(_){}
})();