/* SHADOWREACH BOT TESTER UI V1
   Presentation + compatibility layer for Bot Tester V2.
   Hides legacy decorative bot chatter and exposes activity/evidence in chat. */
(() => {
  "use strict";
  const STORE="shadowreach.social.v1.messages",MAX=160;
  const activities={Kael:100,Nyx:85,Rook:70,Mira:45};
  function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a.slice(-MAX):[]}catch(_){return[]}}
  function cleanLegacy(){
    const a=read();let changed=false;
    const b=a.filter(m=>{
      if(!m||!m.bot)return true;
      if(m.botTester)return true;
      if(m.id==="seed-world")return true;
      if(/^b\d/.test(String(m.id||""))){changed=true;return false}
      return true;
    });
    if(changed)try{localStorage.setItem(STORE,JSON.stringify(b.slice(-MAX)))}catch(_){ }
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
`;document.head.appendChild(s)}
  style();cleanLegacy();
  setInterval(()=>{cleanLegacy();enhance()},800);
  window.addEventListener('storage',()=>setTimeout(()=>{cleanLegacy();enhance()},0));
})();