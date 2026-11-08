const assert=require('node:assert/strict');
const C=require('../clan-bot-sandbox.js'),W=require('../clan-war-rules.js');
const clan=C.create(C.fresh(),'Alliance Test','🔥').state;
assert.equal(C.rivalCandidates('custom').length,6);
let war=C.newExhibition('custom','nord');
assert.equal(war.day,1);assert.equal(war.rivalId,'nord');
assert.ok(C.rivalTarget('custom','nord',1)>0);
assert.equal(C.setRival('custom','custom').ok,false);
const orders=C.setOrder(C.sanitizeOrders(null,'custom'),'custom','auto').state;
for(let day=1;day<=6;day++){
 assert.equal(war.day,day);
 const cap=day===6?5:8;
 for(let round=0;round<cap;round++){
  const r=C.exhibitionRound(war,orders,'custom',W);
  assert.equal(r.ok,true);assert.equal(r.acted,8);
  assert.ok(r.points>0);war=r.state;
 }
 assert.equal(C.exhibitionRound(war,orders,'custom',W).acted,0,'no extra rounds over cap');
 const finished=C.exhibitionNextDay(war,'custom',W);
 assert.equal(finished.ok,true);
 assert.equal(finished.summary.settled.length,day);
 war=finished.state;
}
assert.equal(war.day,7);
assert.equal(C.exhibitionRound(war,orders,'custom',W).ok,false);
assert.equal(C.exhibitionNextDay(war,'custom',W).ok,false);
const summary=C.exhibitionSummary(war,'custom',W);
assert.equal(summary.verdict.settledDays,6);
assert.ok(['home','away','tie'].includes(summary.verdict.status));
assert.ok(summary.verdict.homeVictoryPoints+summary.verdict.awayVictoryPoints<=13);
const early=C.exhibitionNextDay(C.newExhibition('custom','nord'),'custom',W);
assert.equal(early.summary.settled[0].homePoints,0);
assert.equal(early.summary.verdict.awayVictoryPoints,1);
const automatic=C.setExhibitionAuto(C.newExhibition('custom','nord'),'custom',true,1000).state;
const caught=C.exhibitionCatchUp(automatic,orders,'custom',W,1000+9*C.WAR_HOUR_MS);
assert.equal(caught.ticks,8);assert.equal(caught.acted,64);
assert.equal(caught.state.day,1);
assert.equal(C.exhibitionCatchUp(caught.state,orders,'custom',W,1000+9*C.WAR_HOUR_MS).ticks,0);
assert.equal(C.exhibitionCatchUp(automatic,orders,'custom',W,500).ticks,0);
assert.equal(C.exhibitionCatchUp(automatic,orders,'custom',W,1000+1000*C.WAR_HOUR_MS).ticks,8);
const disabled=C.setExhibitionAuto(C.newExhibition('custom','nord'),'custom',false,1234).state;
assert.equal(C.exhibitionCatchUp(disabled,orders,'custom',W,1234+8*C.WAR_HOUR_MS).ticks,0);
const corrupted=C.cleanExhibition({version:1,clanId:'custom',day:99,rivalId:'nord',
 scores:[999999,-1,NaN,0,0,0],counts:{'bot:custom:0':[999,0,0,0,0,999],'bot:nord:0':[1,1,1,1,1,1]}},'custom');
assert.equal(corrupted.day,1);assert.equal(corrupted.scores[1],0);
assert.equal(corrupted.counts['bot:custom:0'][0],8);
assert.equal(corrupted.counts['bot:custom:0'][5],5);
assert.equal(corrupted.counts['bot:nord:0'],undefined);
const memory={'shadowreach.save.local':'UNTOUCHED'},calls=[];
const storage={getItem:k=>(calls.push(k),memory[k]),setItem:(k,v)=>(calls.push(k),memory[k]=v),removeItem:k=>(calls.push(k),delete memory[k])};
assert.equal(C.writeExhibition(storage,'custom',war),true);
assert.equal(C.readExhibition(storage,'custom').day,7);
assert.equal(C.clearExhibition(storage),true);
assert.equal(memory['shadowreach.save.local'],'UNTOUCHED');
assert.ok(calls.every(k=>k===C.WAR_KEY));
assert.equal(C.readExhibition({getItem(){throw Error('blocked')}},'custom').day,1);
assert.equal(C.writeExhibition({setItem(){throw Error('blocked')}},'custom',war),false);
console.log('Clan exhibition war domain: PASS');