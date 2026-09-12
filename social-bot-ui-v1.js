/* SHADOWREACH BOT TESTER UI V3
   Bot tester presentation is confined to the real chat. The UI no longer scans
   the whole document every 900 ms; enhancement work happens on demand and only
   while the chat exists. */
(() => {
  "use strict";
  const messageStore=window.__srSocialMessageStoreV1;
  const STORE=messageStore.key;
  const activities={Kael:100,Nyx:85,Rook:70,Mira:45};
  const read=messageStore.read;
  function cleanLegacy(){
    const a=read();let changed=false;
    const b=a.filter(m=>{
      if(!m||!m.bot)return true;
      if(m.botTester)return true;
      if(m.id==="seed-world")return true;
      if(/^b\d/.test(String(m.id||""))){changed=true;return false}
      return true;
    });
    if(changed)try{localStorage.setItem(STORE,messageStore.serialize(b))}catch(_){ }
  }
  function removeStraySocial(){
    document.querySelectorAll('[data-bot-test-output],[id*="botTestOutput"],[class*="botTestOutput"]').forEach(el=>el.remove());
  }
  function enhance(){
    const root=document.getElementById("srSocial");if(!root)return;
    const messages=read();
    const byId=new Map(messages.filter(Boolean).map(m=>[String(m.id||""),m]));
    root.querySelectorAll('.srName[data-id]').forEach(nameEl=>{
      const id=nameEl.getAttribute('data-id'),m=byId.get(String(id||""));
      if(!m||!m.botTester)return;
      const row=nameEl.parentElement;if(!row)return;
      row.querySelectorAll('.srBot').forEach(x=>x.remove());
      if(row.querySelector('.srBotTestMeta'))return;
      const meta=document.createElement('span');meta.className='srBotTestMeta';
      const pct=Number(m.activity)||activities[m.author]||0;
      const strong=!!m.suggestion;
      meta.textContent=(strong?'SIGNAL FORT':'BOT TEST')+' · '+pct+'%';
      meta.title='Activité de simulation '+pct+'%'+(m.evidence!=null?' · score '+m.evidence:'');
      row.insertBefore(meta,row.querySelector('.srMeta')||null);
      const card=nameEl.closest('.srMsg');if(card){card.classList.add('botTesterMsg');if(strong)card.classList.add('strongSignal')}
    });
    root.querySelectorAll('.srProfile').forEach(p=>{
      const title=p.querySelector('div[style*="font-weight:900"]');if(!title)return;
      const name=(title.textContent||'').trim(),pct=activities[name];if(!pct)return;
      const status=p.querySelector('.srStatus');if(status)status.textContent='BOT TEST · Activité '+pct+'%';
    });
  }
  function style(){if(document.getElementById('srBotTesterStyle'))return;const s=document.createElement('style');s.id='srBotTesterStyle';s.textContent=`
.srBotTestMeta{font-size:8px;margin-left:5px;border:1px solid #496A91;border-radius:5px;padding:1px 4px;color:#A9CFFF;font-weight:900}.srMsg.botTesterMsg{background:#0D1727;border:1px solid #263D5E!important;border-radius:9px}.srMsg.botTesterMsg.strongSignal{background:#251B0D;border-color:#9A6E20!important;box-shadow:inset 3px 0 #D59A2F}.srMsg.botTesterMsg.strongSignal .srBotTestMeta{color:#FBDD8C;border-color:#9A6E20}
#app>.srMsg,#app>.srMessages,body>.srMsg,body>.srMessages{display:none!important}
`;document.head.appendChild(s)}
  function refresh(){removeStraySocial();enhance()}
  style();cleanLegacy();removeStraySocial();
  window.addEventListener('storage',e=>{if(!e||!e.key||e.key===STORE)setTimeout(refresh,0)});
  document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#srChatBtn,#srSocial'))setTimeout(refresh,0)},true);
  setInterval(()=>{if(document.getElementById('srSocial'))enhance()},3000);
})();