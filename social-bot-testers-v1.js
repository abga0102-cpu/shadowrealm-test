/* SHADOWREACH BOT TESTERS V3
   Independent simulated beta-test profiles with visible activity rates.
   Bots can now answer player follow-up questions from their own simulation state. */
(() => {
  "use strict";
  const STORE="shadowreach.social.v1.messages",MAX=160,STATE="shadowreach.social.bottest.v2";
  const profiles=[
    {name:"Kael",level:48,power:42000,floor:81,forge:24,style:"optimiseur",activity:100,bot:true},
    {name:"Nyx",level:34,power:18000,floor:62,forge:17,style:"progression",activity:85,bot:true},
    {name:"Rook",level:61,power:86000,floor:103,forge:31,style:"avance",activity:70,bot:true},
    {name:"Mira",level:27,power:9700,floor:49,forge:12,style:"casual",activity:45,bot:true}
  ];
  const byName=Object.fromEntries(profiles.map(p=>[p.name.toLowerCase(),p]));
  const now=()=>Date.now();
  function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a.slice(-MAX):[]}catch(_){return[]}}
  function write(a){try{localStorage.setItem(STORE,JSON.stringify(a.slice(-MAX)))}catch(_){}}
  function load(){
    let s={};try{s=JSON.parse(localStorage.getItem(STATE)||"{}")||{}}catch(_){}
    s.bots=s.bots||{};s.responded=s.responded||{};
    for(const p of profiles){
      if(!s.bots[p.name])s.bots[p.name]={floor:p.floor,forge:p.forge,pe:40,keys:2,actions:0,bossFails:0,lastBossFloor:Math.ceil(p.floor/10)*10,observations:{},lastTopic:""};
      const b=s.bots[p.name];b.observations=b.observations||{};b.lastBossFloor=Number(b.lastBossFloor)||Math.ceil((Number(b.floor)||p.floor)/10)*10;
    }
    return s;
  }
  function save(s){try{localStorage.setItem(STATE,JSON.stringify(s))}catch(_){}}
  function addObs(b,topic,weight=1){b.observations[topic]=(Number(b.observations[topic])||0)+weight;b.lastTopic=topic}
  function simulateAction(p,b){
    b.actions=(Number(b.actions)||0)+1;
    const roll=Math.random();
    if(roll<.38){
      const hurdle=Math.min(.55,.10+b.floor/350),bossFloor=Math.max(10,Math.ceil((Number(b.floor)||1)/10)*10);
      if(Math.random()<hurdle){b.bossFails++;b.lastBossFloor=bossFloor;addObs(b,"Progression",1)}
      else {b.floor++;b.pe+=Math.max(1,Math.round(4+b.floor*.08));if(b.bossFails>0)b.bossFails--}
    } else if(roll<.58){
      if(b.keys>0){b.keys--;b.pe+=Math.round(35+b.floor*.45);addObs(b,"Raids",.35)} else if(Math.random()<.35){b.keys++;}
    } else if(roll<.73){
      if(Math.random()<.58){b.forge++;addObs(b,"Forge",.45)}
    } else if(roll<.87){
      if(b.pe<100)addObs(b,"Arbre",.75);else b.pe=Math.max(0,b.pe-80);
    } else {
      addObs(b,p.style==="casual"?"Interface":p.style==="optimiseur"?"Recompenses":p.style==="avance"?"Endgame":"Progression",.55);
    }
  }
  function weightedBot(){const sum=profiles.reduce((a,p)=>a+p.activity,0);let r=Math.random()*sum;for(const p of profiles){r-=p.activity;if(r<=0)return p}return profiles[0]}
  function ideaFor(p,b){
    const entries=Object.entries(b.observations).sort((a,c)=>c[1]-a[1]);
    const topic=entries[0]&&entries[0][0]||"Interface",count=entries[0]&&entries[0][1]||0,score=count*(p.activity/100),serious=score>=2.2;
    const map={
      Progression:["Je rencontre plusieurs blocages sur les boss. Après plusieurs échecs, j’aimerais voir ce qui limite réellement mon build.","J’ai eu plusieurs passages où ma progression s’arrête net. Une aide basée sur les vraies défaites serait utile."],
      Raids:["Après plusieurs raids, j’aimerais voir clairement le gain actuel et celui du prochain niveau avant de dépenser une clé.","Les raids sont utiles, mais comparer immédiatement récompense actuelle et prochaine récompense rendrait mes choix plus simples."],
      Forge:["J’utilise souvent la Forge. Un comparatif avant/après sur chaque amélioration me ferait gagner du temps.","À force d’améliorer la Forge, je trouve qu’il manque une lecture immédiate du bénéfice exact du prochain niveau."],
      Arbre:["Quand mes PE deviennent faibles, j’aimerais que le jeu indique discrètement quelle activité peut m’aider à débloquer le prochain nœud.","Je me retrouve régulièrement à court de PE. Une indication contextuelle sur leur source serait utile sans ouvrir un gros tutoriel."],
      Interface:["Sur une session longue, j’aimerais pouvoir revoir les dernières récompenses sans interrompre le jeu.","Je joue surtout tranquillement et certaines infos disparaissent vite. Un historique léger des derniers gains m’aiderait."],
      Recompenses:["Je compare beaucoup les rendements. Il manque parfois une vue claire du gain par activité pour décider où dépenser mon temps.","Pour optimiser, j’aimerais davantage de comparaisons directes entre coût, temps et récompense."],
      Endgame:["À haut niveau, j’aimerais distinguer clairement un vrai mur d’équilibrage d’un simple manque d’optimisation du build.","Sur les paliers avancés, un indicateur de difficulté relative aiderait à savoir si je dois farmer ou simplement changer de stratégie."]
    };
    const pool=map[topic]||map.Interface;return {topic,count,score,serious,text:pool[Math.floor(Math.random()*pool.length)]};
  }
  function dispatch(list){try{window.dispatchEvent(new StorageEvent("storage",{key:STORE,newValue:JSON.stringify(list)}))}catch(_){window.dispatchEvent(new Event("storage"))}}
  function post(p,b,idea){
    const list=read(),levelTag=idea.serious?"⚠️ Signal fort":"🧪 Retour test",prefix=levelTag+" · BOT TEST · Activité "+p.activity+"% · ";
    list.push({id:"bt2"+now()+Math.random().toString(36).slice(2,7),type:"text",channel:"world",ts:now(),author:p.name,profile:{...p,floor:b.floor,forge:b.forge},text:prefix+idea.text,bot:true,botTester:true,activity:p.activity,suggestion:idea.serious,topic:idea.topic,evidence:Math.round(idea.score*10)/10});
    write(list);if(idea.serious)b.observations[idea.topic]=Math.max(0,(Number(b.observations[idea.topic])||0)*.35);dispatch(list);
  }
  function norm(v){return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
  function targetForQuestion(msg,list){
    const t=norm(msg.text);
    for(const p of profiles)if(t.includes("@"+p.name.toLowerCase())||new RegExp("(^|\\s)"+p.name.toLowerCase()+"([ ?!,.]|$)").test(t))return p;
    const idx=list.findIndex(x=>x&&x.id===msg.id);if(idx<0)return null;
    for(let i=idx-1;i>=Math.max(0,idx-5);i--){const m=list[i];if(m&&m.botTester&&now()-Number(m.ts||0)<8*60*1000)return byName[String(m.author||"").toLowerCase()]||null}
    return null;
  }
  function answerFor(p,b,text){
    const q=norm(text),boss=Math.max(10,Number(b.lastBossFloor)||Math.ceil((Number(b.floor)||1)/10)*10),fails=Math.max(1,Number(b.bossFails)||1),topic=b.lastTopic||"Progression";
    if(/quel.*boss|boss.*quel|etage.*boss/.test(q))return "Surtout le boss de l’étage "+boss+". Je l’ai raté "+fails+" fois récemment dans ma simulation.";
    if(/combien.*fois|combien.*echec|tentative|rate/.test(q))return "Sur mon état actuel : "+fails+" échec"+(fails>1?"s":"")+" récent"+(fails>1?"s":"")+" sur le boss de l’étage "+boss+".";
    if(/pourquoi|qu.est.ce qui bloque|cause|probleme/.test(q))return topic==="Progression"?"Je vois surtout une progression de puissance trop lente par rapport au palier du boss. Ma Forge est niveau "+b.forge+" et je suis autour de l’étage "+b.floor+".":"Le point qui revient le plus dans ma simulation en ce moment, c’est « "+topic+" ».";
    if(/forge|niveau.*forge/.test(q))return "Ma Forge simulée est niveau "+b.forge+". Activité "+p.activity+"%, donc je l’utilise "+(p.activity>=85?"très souvent":"régulièrement")+".";
    if(/niveau|etage|tu es ou|t.en es ou/.test(q))return "Je suis actuellement autour de l’étage "+b.floor+" dans ma simulation, avec une Forge niveau "+b.forge+".";
    if(/pe|point.*evolution|arbre/.test(q))return "J’ai environ "+Math.max(0,Math.round(b.pe))+" PE dans ma simulation. "+(b.pe<100?"Je suis assez vite limité pour continuer l’arbre.":"Pour l’instant l’arbre reste accessible.");
    if(/raid|cle/.test(q))return "Il me reste "+Math.max(0,Math.round(b.keys))+" clé"+(b.keys===1?"":"s")+" dans ma simulation. Mon retour concerne surtout la lisibilité du rendement avant de les dépenser.";
    if(/propose|suggestion|amelior|tu ferais quoi|solution/.test(q)){
      const suggestions={Progression:"Après 2 ou 3 défaites sur le même boss, afficher une aide discrète qui compare équipement, Forge et arbre.",Raids:"Afficher avant combat le gain actuel et celui du prochain niveau de raid.",Forge:"Ajouter un vrai comparatif avant/après pour la prochaine amélioration.",Arbre:"Quand les PE manquent, indiquer discrètement où en récupérer.",Interface:"Ajouter un petit historique des récompenses récentes.",Recompenses:"Afficher coût, temps et récompense côte à côte pour les activités importantes.",Endgame:"Montrer si un palier est normalement difficile ou si le build du joueur est sous le niveau attendu."};
      return "Je proposerais ceci : "+(suggestions[topic]||suggestions.Progression);
    }
    if(/activite|pourcentage|100%|70%|85%|45%/.test(q))return "Mon activité est de "+p.activity+"%. Ça représente la fréquence de mes actions simulées, pas une certitude que mon retour est forcément un bug.";
    return "D’après ma simulation actuelle, mon principal retour concerne « "+topic+" ». Si tu veux, demande-moi le boss, mes échecs, ma Forge, mes PE ou ce que je proposerais.";
  }
  function scanQuestions(){
    const list=read(),s=load();
    const candidates=list.slice(-10).filter(m=>m&&!m.bot&&m.type!=="combat"&&m.channel==="world"&&m.id&&!s.responded[m.id]&&String(m.text||"").trim());
    for(const m of candidates){
      const p=targetForQuestion(m,list);if(!p)continue;
      const q=String(m.text||"").trim();
      const looksQuestion=q.includes("?")||/^(quel|quelle|combien|pourquoi|comment|tu |t.es|ta |ton |tes |et |mais |propose|suggestion|forge|raid|pe|niveau)/i.test(q);
      if(!looksQuestion)continue;
      const b=s.bots[p.name];if(!b)continue;
      s.responded[m.id]=now();
      const answer=answerFor(p,b,q),reply={id:"btr"+now()+Math.random().toString(36).slice(2,7),type:"text",channel:"world",ts:now()+500,author:p.name,profile:{...p,floor:b.floor,forge:b.forge},text:"↳ "+answer,bot:true,botTester:true,activity:p.activity,replyTo:m.id,topic:b.lastTopic||"Question"};
      const fresh=read();fresh.push(reply);write(fresh);dispatch(fresh);break;
    }
    const cutoff=now()-24*60*60*1000;for(const [id,ts] of Object.entries(s.responded))if(Number(ts)<cutoff)delete s.responded[id];save(s);
  }
  function tick(){
    const s=load(),t=now();
    for(const p of profiles){const b=s.bots[p.name],actions=Math.max(1,Math.round(p.activity/25));for(let i=0;i<actions;i++)if(Math.random()*100<p.activity)simulateAction(p,b)}
    if(!s.nextPost)s.nextPost=t+70000+Math.random()*90000;
    if(t>=s.nextPost){const p=weightedBot(),b=s.bots[p.name],idea=ideaFor(p,b);post(p,b,idea);s.nextPost=t+90000+Math.random()*180000}
    save(s);
  }
  setInterval(tick,12000);setInterval(scanQuestions,2200);tick();
})();