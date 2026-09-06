/* SHADOWREACH BOT TESTERS V1
   Simulated beta-test chatter based on public/local progression signals.
   Bots propose improvements from their simulated player perspectives. */
(() => {
  "use strict";
  const STORE="shadowreach.social.v1.messages", MAX=160, STATE="shadowreach.social.bottest.v1";
  const testers=[
    {name:"Nyx",level:34,power:18000,floor:62,forge:17,style:"progression",bot:true},
    {name:"Kael",level:48,power:42000,floor:81,forge:24,style:"optimiseur",bot:true},
    {name:"Mira",level:27,power:9700,floor:49,forge:12,style:"casual",bot:true},
    {name:"Rook",level:61,power:86000,floor:103,forge:31,style:"avance",bot:true}
  ];
  const now=()=>Date.now();
  function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a.slice(-MAX):[]}catch(_){return[]}}
  function write(a){try{localStorage.setItem(STORE,JSON.stringify(a.slice(-MAX)))}catch(_){}}
  function state(){try{return JSON.parse(localStorage.getItem(STATE)||"{}")||{}}catch(_){return{}}}
  function saveState(s){try{localStorage.setItem(STATE,JSON.stringify(s))}catch(_){}}
  function snapshot(){
    try{
      const raids=S&&S.raids||{};
      return {
        floor:Math.max(1,Number(S.recordFloor||S.floor)||1),
        pe:Math.max(0,Number(S.pe)||0),
        forge:Math.max(1,Number(S.forge&&S.forge.level)||1),
        evoKeys:Math.max(0,Number(raids.evolution&&raids.evolution.keys)||0),
        evoLevel:Math.max(1,Number(raids.evolution&&raids.evolution.level)||1)
      };
    }catch(_){return {floor:1,pe:0,forge:1,evoKeys:0,evoLevel:1}}
  }
  function ideas(s){
    const a=[];
    if(s.floor>=45)a.push({tag:"Progression",texts:["Je commence à sentir un mur sur les boss. J’aimerais avoir un petit résumé de ce qui me limite le plus après plusieurs défaites.","Après quelques boss ratés, ce serait pratique que le jeu me dise si mon équipement, ma Forge ou mon arbre est le point faible."]});
    if(s.pe<100)a.push({tag:"Arbre",texts:["Je trouve que l’arbre donne envie d’avancer, mais quand je manque de PE je ne sais pas toujours quel contenu est le plus rentable. Une indication légère aiderait.","Idée : quand on manque de PE pour le prochain nœud, afficher où en récupérer sans ouvrir une grosse fenêtre."]});
    if(s.evoKeys>=2)a.push({tag:"Raids",texts:["J’ai encore des clés de raid. J’aimerais voir directement la récompense du niveau avant de lancer le combat.","Pour les raids, un aperçu gain actuel + gain du prochain niveau rendrait le choix plus clair."]});
    if(s.forge>=10)a.push({tag:"Forge",texts:["À ce niveau de Forge, j’aimerais voir en un coup d’œil ce que le prochain niveau va réellement améliorer avant de dépenser mes minerais.","La Forge devient importante. Un comparatif avant/après sur l’amélioration serait vraiment utile."]});
    a.push({tag:"Interface",texts:["Petite idée : garder les récompenses visibles quelques secondes sans bloquer les boutons. Ça rendrait les gains plus satisfaisants.","J’aimerais pouvoir toucher une récompense récente pour revoir rapidement d’où elle vient."]});
    return a;
  }
  function post(bot,idea,special=false){
    const list=read();
    const text=idea.texts[Math.floor(Math.random()*idea.texts.length)];
    const msg={id:"bt"+now()+Math.random().toString(36).slice(2,7),type:"text",channel:"world",ts:now(),author:bot.name,profile:bot,text:(special?"💡 Suggestion · ":"")+text,bot:true,botTester:true,suggestion:special,topic:idea.tag};
    list.push(msg);write(list);
    try{window.dispatchEvent(new StorageEvent("storage",{key:STORE,newValue:JSON.stringify(list)}))}catch(_){window.dispatchEvent(new Event("storage"))}
  }
  function tick(){
    const st=state(), t=now();
    if(!st.next){st.next=t+70000+Math.random()*110000;saveState(st);return}
    if(t<st.next)return;
    const s=snapshot(), pool=ideas(s), bot=testers[Math.floor(Math.random()*testers.length)], idea=pool[Math.floor(Math.random()*pool.length)];
    const recent=read().filter(m=>m&&m.botTester&&m.topic===idea.tag&&t-Number(m.ts||0)<20*60*1000).length;
    post(bot,idea,recent>=2);
    st.next=t+90000+Math.random()*180000;saveState(st);
  }
  setInterval(tick,12000);tick();
})();