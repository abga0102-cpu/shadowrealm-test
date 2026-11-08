/* Shadowreach bot clans: fictional local training data, no real multiplayer authority.
 * Explicitly independent of the Shadowreach game save and economy.
 */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.ShadowreachBotClans=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEY='shadowreach.clan.bot-preview.v1',VERSION=1,MAX_MEMBERS=20;
const CRESTS=Object.freeze(['🛡️','🔥','🌙','🐺','⚔️','🐉']);
const CLANS=Object.freeze([
  {id:'aube',name:"L'Ordre de l'Aube",tag:'AUBE',crest:'🛡️',color:'#e8b96c'},
  {id:'cendre',name:'Légion de Cendre',tag:'CEND',crest:'🔥',color:'#e77a61'},
  {id:'ombre',name:'Veilleurs des Ombres',tag:'OMBR',crest:'🌙',color:'#b9a1ed'},
  {id:'nord',name:'Crocs du Nord',tag:'NORD',crest:'🐺',color:'#9ccee6'},
  {id:'obsidienne',name:'Garde Obsidienne',tag:'OBSI',crest:'⚔️',color:'#8ac6ac'},
  {id:'dragon',name:'Sang du Dragon',tag:'DRAG',crest:'🐉',color:'#eaa17a'}
].map(x=>Object.freeze(x)));
const FIRST=['Kael','Nyx','Mira','Rook','Ardan','Elyra','Soren','Vara','Tarek','Liora','Darek','Yuna','Brom','Asha','Corvin','Nessa','Vey','Oryn','Tala','Fen'];
const LAST=['Noirforge','Solstice','Brume','Fer','Cendre','Lune','Givre','Ronce','Acier','Fauve','Éclat','Drake'];
const fresh=()=>({version:VERSION,memberOf:null,created:null});
const normal=s=>typeof s==='string'?s.normalize('NFC').trim().replace(/\s+/g,' '):'';
const validName=s=>{s=normal(s);return s.length>=3&&s.length<=24&&!/[<>()[\]{}\\/\u0000-\u001f\u007f]/.test(s);};
const tag=s=>normal(s).replace(/[^a-zA-Z0-9À-ÿ]/g,'').slice(0,4).toUpperCase()||'CLAN';
function clean(data){
  const s=fresh();if(!data||Array.isArray(data)||typeof data!=='object'||data.version!==VERSION)return s;
  if(data.created&&data.created.id==='custom'&&validName(data.created.name)&&!CLANS.some(c=>c.name.toLowerCase()===normal(data.created.name).toLowerCase())){
    s.created={id:'custom',name:normal(data.created.name),tag:tag(data.created.name),crest:CRESTS.includes(data.created.crest)?data.created.crest:'🛡️',color:'#efc776'};
  }
  if(CLANS.some(c=>c.id===data.memberOf)||(data.memberOf==='custom'&&s.created))s.memberOf=data.memberOf;
  return s;
}
function bots(clanId,index,count){
  return Array.from({length:count},(_,i)=>{
    const id=index*12+i+3,level=12+(id*13+index)%67;
    return Object.freeze({id:'bot:'+clanId+':'+i,kind:'bot',name:FIRST[id%FIRST.length]+' '+LAST[Math.floor(id/FIRST.length)%LAST.length],level,power:level*(148+(id*37)%111)+id*17,role:clanId!=='custom'&&i===0?'Chef':i===1?'Officier':'Membre'});
  });
}
function allClans(source,name='Héros'){
  const state=clean(source),defs=state.created?CLANS.concat([state.created]):CLANS;
  return defs.map((def,index)=>{
    const joined=state.memberOf===def.id,roster=bots(def.id,index,def.id==='custom'?8:12);
    if(joined)roster.unshift(Object.freeze({id:'player:demo',kind:'demo',name:(normal(name)||'Héros').slice(0,18),role:def.id==='custom'?'Chef':'Membre'}));
    return Object.freeze({...def,isDemo:true,isCreated:def.id==='custom',joined,members:Object.freeze(roster),count:roster.length,capacity:MAX_MEMBERS,power:roster.reduce((sum,m)=>sum+(m.power||0),0)});
  });
}
const myClan=(s,name)=>allClans(s,name).find(c=>c.joined)||null;
function join(source,id){
  const state=clean(source);
  if(state.memberOf)return {ok:false,error:'Déjà membre d’un clan.',state};
  if(!allClans(state).some(c=>c.id===id))return {ok:false,error:'Clan introuvable.',state};
  return {ok:true,state:{...state,memberOf:id}};
}
function create(source,name,crest){
  const state=clean(source),s=normal(name);
  if(state.memberOf||state.created)return {ok:false,error:'Quitte ton clan actuel.',state};
  if(!validName(s))return {ok:false,error:'Nom invalide (3 à 24 caractères).',state};
  if(CLANS.some(c=>c.name.toLowerCase()===s.toLowerCase()))return {ok:false,error:'Ce nom existe déjà.',state};
  if(!CRESTS.includes(crest))return {ok:false,error:'Blason invalide.',state};
  return {ok:true,state:{version:VERSION,memberOf:'custom',created:{id:'custom',name:s,crest,tag:tag(s),color:'#efc776'}}};
}
function leave(source){
  const state=clean(source);if(!state.memberOf)return {ok:false,error:'Aucun clan à quitter.',state};
  return {ok:true,state:{version:VERSION,memberOf:null,created:state.memberOf==='custom'?null:state.created}};
}
function read(storage){
  try{return clean(JSON.parse(storage.getItem(KEY)||'null'));}catch(_){return fresh();}
}
function write(storage,data){
  try{storage.setItem(KEY,JSON.stringify(clean(data)));return true;}catch(_){return false;}
}
function clear(storage){try{storage.removeItem(KEY);return true;}catch(_){return false;}}
return Object.freeze({KEY,VERSION,CRESTS,CLANS,MAX_MEMBERS,fresh,clean,validName,allClans,myClan,join,create,leave,read,write,clear});
});
