/* SHADOWREACH · Legacy Divin rollback v131
   One-time correction requested after two pre-v130 DIVIN pieces were sacrificed
   under v130 rewards. Old ladder value is restored as its exact fusion-equivalent:
   2 old DIVIN = 16 EPIQUE_I = 1 MYTHIQUE_III.
   The two v130 DIVIN reward bundles are removed. */
(function(){
'use strict';
if(window.__srSanctuaryDivineRollbackV131)return;window.__srSanctuaryDivineRollbackV131=true;
if(typeof S==='undefined'||typeof sanctMergeState!=='function')return;
var st=sanctMergeState();
if(st.legacyDivinRollbackV131)return;

/* Reverse exactly two DIVIN reward bundles from v130. Negative balances are
   deliberately avoided: if a granted consumable was already spent, the
   remainder becomes an explicit rollback debt so future gains repay it rather
   than manufacturing resources through the correction. */
function take(obj,key,amount,debtKey){
  amount=Math.max(0,Number(amount)||0);var cur=Math.max(0,Number(obj[key])||0),used=Math.min(cur,amount);
  obj[key]=cur-used;var miss=amount-used;if(miss){st.rollbackDebtV131=st.rollbackDebtV131||{};st.rollbackDebtV131[debtKey]=(st.rollbackDebtV131[debtKey]||0)+miss;}
}
take(S,'minerai',200000,'minerai');
take(S,'essence',100000,'essence');
take(S,'eclat',100000,'eclat');
take(S,'universalKeys',50,'universalKeys');
take(st,'stabilitySeals',100,'stabilitySeals');
S.rebirth=S.rebirth||{};take(S.rebirth,'pr',10000,'pr');
take(st,'divineTokens',2,'divineTokens');

/* The title came from the first of these invalid legacy-value sacrifices. */
st.divineTitleUnlocked=false;
if(S.titles&&Object.prototype.hasOwnProperty.call(S.titles,'divin'))delete S.titles.divin;

/* Exact old-economy material equivalence under the new ladder:
   old DIVIN = 8 EPIQUE; therefore 2 = 16 EPIQUE_I = MYTHIQUE_III. */
var restored='MYTHIQUE_III',placed=false;
for(var i=0;i<st.mergeBoard.length;i++)if(!st.mergeBoard[i]){st.mergeBoard[i]=restored;placed=true;break;}
if(!placed){st.mergeReserve=Array.isArray(st.mergeReserve)?st.mergeReserve:[];st.mergeReserve.push(restored);}

st.legacyDivinRollbackV131={count:2,restored:restored,at:Date.now()};
st.sacrifices=Math.max(0,(Number(st.sacrifices)||0)-2);
try{dirty=true;if(typeof saveNow==='function')saveNow();if(typeof toast==='function')toast('Correction Divin · 2 anciens Divins annulés · Mythique III restauré',true);if(typeof render==='function')render();}catch(e){console.warn('Legacy Divin rollback v131',e);}
})();