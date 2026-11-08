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

/* Bot command authority, isolated to the clan sandbox and never the game save.
 * Manual rounds make orders observable, never award actual resources or war wins.
 */
const ORDERS_KEY='shadowreach.clan.bot-orders.v1';
const ORDERS=Object.freeze({
 auto:'Objectif du jour',forge:'Forge',raid:'Raids',skills:'Compétences',
 familiar:'Familiers',save:'Économiser',attack:'Attaquer',defend:'Défendre',rest:'Repos'
});
const ACTIVITY_LABEL=Object.freeze({
 forge_item:'Forge',forge_gold:'Amélioration Forge',raid_key:'Raid',
 skill_summon:'Invocation',skill_upgrade:'Compétences',familiar_hatch:'Éclosion',
 familiar_merge:'Fusion familiers',tree_research:'Recherche',
 clan_attack:'Assaut',clan_brawl:'Combat collectif'
});
const MAX_JOURNAL=36,DAY_LIMIT=8,ATTACK_LIMIT=5;
function commandRoster(clanId){
 const index=CLANS.findIndex(c=>c.id===clanId);
 return index>=0?bots(clanId,index,12):clanId==='custom'?bots('custom',CLANS.length,8):[];
}
function freshOrders(clanId){return {version:1,clanId:clanId||null,day:1,global:'auto',perBot:{},counts:{},journal:[]};}
function sanitizeOrders(raw,clanId){
 const safe=freshOrders(clanId);
 if(!clanId||!commandRoster(clanId).length||!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==1||raw.clanId!==clanId)return safe;
 const valid=new Set(commandRoster(clanId).map(b=>b.id));
 const known=mode=>Object.prototype.hasOwnProperty.call(ORDERS,mode);
 safe.day=Number.isInteger(raw.day)&&raw.day>=1&&raw.day<=7?raw.day:1;
 if(known(raw.global))safe.global=raw.global;
 const overrides=raw.perBot&&typeof raw.perBot==='object'&&!Array.isArray(raw.perBot)?raw.perBot:{};
 const counts=raw.counts&&typeof raw.counts==='object'&&!Array.isArray(raw.counts)?raw.counts:{};
 for(const id of valid){
  if(known(overrides[id]))safe.perBot[id]=overrides[id];
  if(Array.isArray(counts[id]))safe.counts[id]=Array.from({length:6},(_,i)=>{
   const n=counts[id][i];return Number.isSafeInteger(n)&&n>=0?Math.min(n,i===5?ATTACK_LIMIT:DAY_LIMIT):0;
  });
 }
 if(Array.isArray(raw.journal))safe.journal=raw.journal.slice(-MAX_JOURNAL).filter(e=>
   e&&valid.has(e.id)&&Number.isInteger(e.day)&&e.day>=1&&e.day<=6&&
   typeof e.action==='string'&&Object.prototype.hasOwnProperty.call(ACTIVITY_LABEL,e.action)&&
   Number.isSafeInteger(e.points)&&e.points>=0&&e.points<=10
 ).map(e=>({id:e.id,day:e.day,action:e.action,points:e.points}));
 return safe;
}
function readOrders(storage,clanId){
 try{return sanitizeOrders(JSON.parse(storage.getItem(ORDERS_KEY)||'null'),clanId);}
 catch(_){return freshOrders(clanId);}
}
function writeOrders(storage,clanId,orders){
 try{storage.setItem(ORDERS_KEY,JSON.stringify(sanitizeOrders(orders,clanId)));return true;}
 catch(_){return false;}
}
function clearOrders(storage){try{storage.removeItem(ORDERS_KEY);return true;}catch(_){return false;}}
function setOrder(raw,clanId,mode,botId){
 const state=sanitizeOrders(raw,clanId),roster=commandRoster(clanId);
 if(!roster.length)return {ok:false,error:'Rejoins un clan pour diriger des bots.',state};
 if(botId!==undefined&&botId!==null){
  if(!roster.some(b=>b.id===botId))return {ok:false,error:'Ce bot n’appartient pas à ton clan.',state};
  if(mode==='inherit'){delete state.perBot[botId];return {ok:true,state};}
  if(!Object.prototype.hasOwnProperty.call(ORDERS,mode))return {ok:false,error:'Ordre inconnu.',state};
  state.perBot[botId]=mode;
 }else{
  if(!Object.prototype.hasOwnProperty.call(ORDERS,mode))return {ok:false,error:'Ordre inconnu.',state};
  state.global=mode;
 }
 return {ok:true,state};
}
function chooseDay(raw,clanId,day){
 const state=sanitizeOrders(raw,clanId);
 if(!commandRoster(clanId).length)return {ok:false,error:'Aucun clan rejoint.',state};
 if(!Number.isInteger(day)||day<1||day>7)return {ok:false,error:'Jour invalide.',state};
 state.day=day;return {ok:true,state};
}
function taskFor(order,allowed,index,used){
 if(order==='save'||order==='rest'||order==='defend')return null;
 if(order==='auto')return allowed.length?allowed[(index+used)%allowed.length]:null;
 const matches={
  forge:['forge_item','forge_gold'],raid:['raid_key'],
  skills:['skill_upgrade','skill_summon'],familiar:['familiar_hatch','familiar_merge'],
  attack:['clan_attack']
 }[order]||[];
 return matches.find(a=>allowed.includes(a))||null;
}
function runRound(raw,clanId,rules){
 const state=sanitizeOrders(raw,clanId),roster=commandRoster(clanId);
 if(!roster.length)return {ok:false,error:'Aucun clan à commander.',state};
 const day=state.day,config=rules&&typeof rules.dayConfig==='function'?rules.dayConfig(day):null;
 if(!config||day===7)return {ok:false,error:'Jour 7 : bilan, aucune action.',state};
 const allowed=Array.isArray(config.actions)?config.actions:[];
 const reports=[];let acted=0,points=0;
 roster.forEach((bot,index)=>{
  const order=state.perBot[bot.id]||state.global;
  const counts=(state.counts[bot.id]||[0,0,0,0,0,0]).slice();
  const used=counts[day-1],task=taskFor(order,allowed,index,used);
  const capacity=day===6?ATTACK_LIMIT:DAY_LIMIT;
  let message;
  if(order==='save')message='Réserves préservées';
  else if(order==='rest')message='Repos';
  else if(order==='defend')message=day===6?'Position défensive tenue':'Attente de J6';
  else if(!task)message='Ordre en attente pour un autre jour';
  else if(used>=capacity)message=day===6?'5 tickets utilisés':'Quota d’entraînement atteint';
  else{
   const gain=day===6?2+(index+used)%3:1+(index+used+day)%3;
   counts[day-1]++;state.counts[bot.id]=counts;
   state.journal.push({id:bot.id,day,action:task,points:gain});
   acted++;points+=gain;
   message=ACTIVITY_LABEL[task]+' effectué · +'+gain+' points fictifs';
  }
  reports.push({id:bot.id,name:bot.name,order,message,acted:!!task&&used<capacity});
 });
 state.journal=state.journal.slice(-MAX_JOURNAL);
 return {ok:true,state,reports,acted,points};
}
function commandStats(raw,clanId){
 const s=sanitizeOrders(raw,clanId);
 const roster=commandRoster(clanId);
 const botsInfo=roster.map(bot=>{
  const counts=s.counts[bot.id]||[0,0,0,0,0,0];
  return {id:bot.id,name:bot.name,order:s.perBot[bot.id]||s.global,
   override:s.perBot[bot.id]||null,dayCount:s.day===7?0:counts[s.day-1],
   attacks:counts[5],total:counts.reduce((n,c)=>n+c,0)};
 });
 return {day:s.day,global:s.global,bots:botsInfo,
  total:botsInfo.reduce((n,b)=>n+b.total,0),recent:s.journal.slice(-12).reverse()};
}
function resetRounds(raw,clanId){
 const state=sanitizeOrders(raw,clanId);state.counts={};state.journal=[];
 return {ok:true,state};
}


/* Exhibition war: independent, bounded, local-only; never grants in-game rewards.
 * Reuses the orders engine to avoid duplicating tactical activity rules.
 */
const WAR_KEY='shadowreach.clan.bot-exhibition.v1',WAR_VERSION=1;
const WAR_HOUR_MS=3600000,MAX_OFFLINE_ROUNDS=8;
function rivalCandidates(clanId){return CLANS.filter(c=>c.id!==clanId);}
function pickRival(clanId){
 const all=rivalCandidates(clanId);
 return all.length?all[clanId==='custom'?0:(CLANS.findIndex(c=>c.id===clanId)+2)%all.length].id:null;
}
function newExhibition(clanId,rivalId){
 const selected=rivalCandidates(clanId).some(c=>c.id===rivalId)?rivalId:pickRival(clanId);
 return {version:WAR_VERSION,clanId:clanId||null,rivalId:selected,day:1,
  scores:[0,0,0,0,0,0],counts:{},journal:[],auto:false,lastAt:null};
}
function cleanExhibition(raw,clanId){
 const fresh=newExhibition(clanId);
 if(!clanId||!commandRoster(clanId).length||!raw||typeof raw!=='object'||Array.isArray(raw)||
   raw.version!==WAR_VERSION||raw.clanId!==clanId)return fresh;
 const safe=newExhibition(clanId,raw.rivalId);
 safe.day=Number.isInteger(raw.day)&&raw.day>=1&&raw.day<=7?raw.day:1;
 const valid=new Set(commandRoster(clanId).map(x=>x.id));
 const rawCounts=raw.counts&&typeof raw.counts==='object'&&!Array.isArray(raw.counts)?raw.counts:{};
 for(const id of valid)if(Array.isArray(rawCounts[id]))
   safe.counts[id]=Array.from({length:6},(_,i)=>{
    const n=rawCounts[id][i];
    return Number.isSafeInteger(n)&&n>=0?Math.min(n,i===5?ATTACK_LIMIT:DAY_LIMIT):0;
   });
 if(Array.isArray(raw.scores))safe.scores=Array.from({length:6},(_,i)=>{
  const n=raw.scores[i],bound=valid.size*(i===5?ATTACK_LIMIT:DAY_LIMIT)*4;
  return Number.isSafeInteger(n)&&n>=0?Math.min(n,bound):0;
 });
 if(Array.isArray(raw.journal))safe.journal=raw.journal.slice(-MAX_JOURNAL).filter(e=>
   e&&valid.has(e.id)&&Number.isInteger(e.day)&&e.day>=1&&e.day<=6&&
   typeof e.action==='string'&&Object.prototype.hasOwnProperty.call(ACTIVITY_LABEL,e.action)&&
   Number.isSafeInteger(e.points)&&e.points>=0&&e.points<=4)
   .map(e=>({id:e.id,day:e.day,action:e.action,points:e.points}));
 safe.auto=raw.auto===true;
 safe.lastAt=Number.isSafeInteger(raw.lastAt)&&raw.lastAt>=0?raw.lastAt:null;
 return safe;
}
function readExhibition(storage,clanId){
 try{return cleanExhibition(JSON.parse(storage.getItem(WAR_KEY)||'null'),clanId);}
 catch(_){return newExhibition(clanId);}
}
function writeExhibition(storage,clanId,war){
 try{storage.setItem(WAR_KEY,JSON.stringify(cleanExhibition(war,clanId)));return true;}
 catch(_){return false;}
}
function clearExhibition(storage){try{storage.removeItem(WAR_KEY);return true;}catch(_){return false;}}
function setRival(clanId,id){
 const state=newExhibition(clanId,id);
 if(!commandRoster(clanId).length)return {ok:false,error:'Rejoins un clan.',state};
 if(!rivalCandidates(clanId).some(c=>c.id===id))return {ok:false,error:'Adversaire inconnu.',state};
 return {ok:true,state};
}
function rivalTarget(clanId,rivalId,day){
 if(!Number.isInteger(day)||day<1||day>6||!rivalCandidates(clanId).some(c=>c.id===rivalId))return null;
 const count=commandRoster(clanId).length,enemyIndex=CLANS.findIndex(c=>c.id===rivalId);
 const bonus=((day*7+enemyIndex*3)%7-3)*0.035;
 const difficulty=(enemyIndex%2===0?0.68:0.72)+bonus;
 return Math.max(1,Math.round(count*(day===6?ATTACK_LIMIT:DAY_LIMIT)*(day===6?3:2)*difficulty));
}
function exhibitionSummary(raw,clanId,rules){
 const state=cleanExhibition(raw,clanId),closed=[];
 for(let i=1;i<state.day;i++){
  const rival=rivalTarget(clanId,state.rivalId,i);
  if(rival===null)break;
  closed.push({day:i,closed:true,homePoints:state.scores[i-1],awayPoints:rival});
 }
 const verdict=rules&&typeof rules.summarizeDays==='function'?rules.summarizeDays(closed):null;
 const rival=CLANS.find(c=>c.id===state.rivalId);
 return {day:state.day,rivalId:state.rivalId,rivalName:rival?rival.name:'Rival',
  scores:state.scores.slice(),rivalScore:state.day===7?null:rivalTarget(clanId,state.rivalId,state.day),
  settled:closed,verdict,auto:state.auto,botCount:commandRoster(clanId).length};
}
function exhibitionRound(raw,orders,clanId,rules){
 const state=cleanExhibition(raw,clanId);
 if(!commandRoster(clanId).length)return {ok:false,error:'Aucun clan.',state};
 if(state.day===7)return {ok:false,error:'Match terminé.',state};
 const plan=sanitizeOrders(orders,clanId);
 const temporary={...plan,day:state.day,counts:state.counts,journal:state.journal};
 const attempt=runRound(temporary,clanId,rules);
 if(!attempt.ok)return {ok:false,error:attempt.error,state};
 state.counts=attempt.state.counts;state.journal=attempt.state.journal;
 state.scores[state.day-1]=Math.min(commandRoster(clanId).length*(state.day===6?ATTACK_LIMIT:DAY_LIMIT)*4,
  state.scores[state.day-1]+attempt.points);
 return {ok:true,state,acted:attempt.acted,points:attempt.points,reports:attempt.reports};
}
function exhibitionNextDay(raw,clanId,rules){
 const state=cleanExhibition(raw,clanId);
 if(state.day===7||!commandRoster(clanId).length)return {ok:false,error:'Journée impossible à clôturer.',state};
 const day=state.day;state.day++;state.lastAt=null;
 return {ok:true,state,closedDay:day,summary:exhibitionSummary(state,clanId,rules)};
}
function setExhibitionAuto(raw,clanId,enable,now){
 const state=cleanExhibition(raw,clanId);
 if(!commandRoster(clanId).length||state.day===7)return {ok:false,error:'Aucune guerre active.',state};
 if(!Number.isSafeInteger(now)||now<0)return {ok:false,error:'Horloge invalide.',state};
 state.auto=enable===true;state.lastAt=state.auto?now:null;
 return {ok:true,state};
}
function exhibitionCatchUp(raw,orders,clanId,rules,now){
 const state=cleanExhibition(raw,clanId);
 if(!state.auto||state.day===7||!Number.isSafeInteger(now)||now<0)
  return {ok:true,state,ticks:0,acted:0,points:0};
 if(state.lastAt===null||now<state.lastAt){
  state.lastAt=now;return {ok:true,state,ticks:0,acted:0,points:0};
 }
 const elapsed=Math.floor((now-state.lastAt)/WAR_HOUR_MS);
 const ticks=Math.max(0,Math.min(MAX_OFFLINE_ROUNDS,elapsed));
 if(!ticks)return {ok:true,state,ticks:0,acted:0,points:0};
 let acted=0,points=0;
 for(let i=0;i<ticks;i++){
  const step=exhibitionRound(state,orders,clanId,rules);
  if(!step.ok)return {ok:false,error:step.error,state,ticks:i,acted,points};
  acted+=step.acted;points+=step.points;
  state.counts=step.state.counts;state.journal=step.state.journal;state.scores=step.state.scores;
 }
 state.lastAt=elapsed>MAX_OFFLINE_ROUNDS?now:state.lastAt+ticks*WAR_HOUR_MS;
 return {ok:true,state,ticks,acted,points};
}

return Object.freeze({KEY,VERSION,CRESTS,CLANS,MAX_MEMBERS,fresh,clean,validName,allClans,myClan,join,create,leave,read,write,clear,ORDERS_KEY,ORDERS,ACTIVITY_LABEL,readOrders,writeOrders,clearOrders,sanitizeOrders,setOrder,chooseDay,runRound,commandStats,resetRounds,WAR_KEY,WAR_HOUR_MS,MAX_OFFLINE_ROUNDS,newExhibition,cleanExhibition,readExhibition,writeExhibition,clearExhibition,rivalCandidates,setRival,rivalTarget,exhibitionSummary,exhibitionRound,exhibitionNextDay,setExhibitionAuto,exhibitionCatchUp});
});
