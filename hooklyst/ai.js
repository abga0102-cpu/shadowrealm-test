
(function(){
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];});}
  function recent(){try{return JSON.parse(localStorage.getItem("hooklyst_recent_ideas")||"[]").slice(-8);}catch(e){return [];}}
  function remember(t){try{var a=recent();a.push(String(t||""));localStorage.setItem("hooklyst_recent_ideas",JSON.stringify(a.slice(-8)));}catch(e){}}
  function parseJson(raw){
    raw=String(raw||"").trim();
    raw=raw.replace(/^\`\`\`json\s*/i,"").replace(/^\`\`\`\s*/,"").replace(/\s*\`\`\`$/,"");
    var a=raw.indexOf("{"),b=raw.lastIndexOf("}");
    if(a<0||b<a) throw new Error("Réponse IA non structurée");
    return JSON.parse(raw.slice(a,b+1));
  }
  function render(d){
    var el=document.getElementById("result");
    el.innerHTML='<div>'+
      '<span class="pill">'+esc(d.duration||"18–30 s")+'</span><span class="pill">Généré par IA</span>'+
      '<h3>'+esc(d.title)+'</h3>'+
      '<div class="block"><small>HOOK</small><p>'+esc(d.hook)+'</p></div>'+
      '<div class="block"><small>SCÈNE 1</small><p>'+esc(d.scene1)+'</p></div>'+
      '<div class="block"><small>SCÈNE 2</small><p>'+esc(d.scene2)+'</p></div>'+
      '<div class="block"><small>SCÈNE 3</small><p>'+esc(d.scene3)+'</p></div>'+
      '<div class="block"><small>TEXTE ÉCRAN</small><p>'+esc(d.screenText)+'</p></div>'+
      '<div class="block"><small>CTA</small><p>'+esc(d.cta)+'</p></div>'+
      '<div class="block"><small>LÉGENDE</small><p>'+esc(d.caption)+'</p></div>'+
      '</div>';
  }

  var oldForm=document.getElementById("form");
  if(!oldForm)return;
  var form=oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(form,oldForm);
  var status=document.getElementById("status");
  if(status) status.textContent="Génération IA active • Une connexion Puter peut être demandée au premier essai.";

  form.addEventListener("submit",async function(e){
    e.preventDefault();
    var business=document.getElementById("business").value.trim();
    var offer=document.getElementById("offer").value.trim();
    var audience=document.getElementById("audience").value.trim();
    var format=document.getElementById("format").value;
    var tone=document.getElementById("tone").value;
    var previous=recent();
    var btn=form.querySelector('button[type="submit"]');

    btn.disabled=true;
    btn.textContent="Création en cours…";
    if(status) status.textContent="Hooklyst cherche un angle différent…";

    var prompt=[
      "Tu es HOOKLYST, directeur créatif spécialisé TikTok, Instagram Reels et YouTube Shorts.",
      "Crée UNE idée de vidéo originale, réellement tournable au téléphone, très spécifique au brief.",
      "",
      "BRIEF",
      "Activité : "+business,
      "Offre : "+offer,
      "Audience : "+audience,
      "Format : "+format,
      "Ton : "+tone,
      "",
      "IDÉES RÉCENTES À NE PAS RÉPÉTER",
      previous.length ? previous.map(function(x,i){return (i+1)+". "+x;}).join("\n") : "Aucune",
      "",
      "RÈGLES",
      "- Prends un angle nettement différent à chaque génération.",
      "- Ne commence pas systématiquement par Si tu... ou POV :.",
      "- Évite les banalités marketing et les conseils génériques.",
      "- Montre quelque chose avant de l'expliquer.",
      "- 18 à 30 secondes, 3 scènes maximum, simples à filmer.",
      "- Intègre le produit ou service naturellement.",
      "- CTA varié : commentaire, sauvegarde, partage, DM, visite, ou aucun si plus naturel.",
      "- Français naturel, pas de jargon d'agence.",
      "- Ne crée aucune fausse statistique ni promesse médicale ou financière.",
      "- Seed créatif : "+Date.now()+"-"+Math.random().toString(36).slice(2),
      "",
      "Réponds UNIQUEMENT avec ce JSON valide, sans markdown :",
      '{"title":"","duration":"","hook":"","scene1":"","scene2":"","scene3":"","screenText":"","cta":"","caption":""}'
    ].join("\n");

    try{
      if(!window.puter||!puter.ai) throw new Error("Le moteur IA n'est pas chargé");
      var response=await puter.ai.chat(prompt,{model:"gpt-5.6-luna",normalize:true});
      var data=parseJson(response&&response.message&&response.message.content);
      var keys=["title","hook","scene1","scene2","scene3","screenText","cta","caption"];
      if(keys.some(function(k){return !data[k];})) throw new Error("Réponse IA incomplète");
      render(data);
      remember(data.title);
      if(status) status.textContent="Nouvelle fiche générée par IA. Reclique pour obtenir un autre angle.";
    }catch(err){
      console.error(err);
      document.getElementById("result").innerHTML='<div class="empty"><span>!</span><h3>La génération n\'a pas abouti</h3><p>'+esc(err&&err.message?err.message:"Erreur inconnue")+'</p></div>';
      if(status) status.textContent="Réessaie et accepte la connexion Puter si elle est proposée.";
    }finally{
      btn.disabled=false;
      btn.textContent="Générer une nouvelle fiche";
    }
  });
})();