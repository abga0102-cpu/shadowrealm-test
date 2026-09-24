/* SHADOWREACH · contextual system help V446
   One reusable help surface for every major system. It is deliberately outside
   #screen so opening/closing help never changes screen height or scroll position. */
(function(){
  'use strict';
  if (window.__srSystemInfoV446) return;
  window.__srSystemInfoV446 = true;

  var HELP = {
    accueil: { title:'Campagne & Forge', text:'La Campagne est ta progression principale. Gagne des combats pour avancer, obtenir de l’or et de l’EXP. La Forge transforme le Minerai en équipements : 10 Minerais = 1 équipement. Au départ, tes 50 Minerais permettent 5 essais pour comprendre la boucle.' },
    equipement: { title:'Équipement', text:'Équipe les pièces qui améliorent réellement ton build. Compare la Puissance gagnée ou perdue avant de remplacer une pièce. La rareté seule ne garantit pas qu’un objet soit meilleur.' },
    competences: { title:'Compétences', text:'Les Compétences complètent tes attaques avec dégâts, soins, buffs et effets de zone. Les doublons servent à les faire progresser. Équipe celles qui correspondent à ton build.' },
    familiers: { title:'Familiers', text:'Les Familiers renforcent ton héros. Fais éclore des œufs, choisis un familier actif et fusionne les doublons lorsque tu en as assez pour monter en rareté.' },
    raid: { title:'Raids', text:'Les Raids dépensent des clés et donnent des ressources spécialisées : Or, Minerai, Éclats, Essence ou PE. Leur difficulté suit ta progression de Campagne.' },
    arbre: { title:'Arbre personnel', text:'Dépense les PE obtenus notamment en Raid Évolution pour rechercher des bonus permanents. Les branches permettent de spécialiser combat, survie, ressources, familiers et compétences.' },
    mega: { title:'Méga-Boss', text:'Les Méga-Boss sont des défis avancés liés aux Boss de Campagne. Une première victoire débloque de nouvelles étapes de progression, dont le Sanctuaire.' },
    sanctuaire: { title:'Sanctuaire', text:'Le Sanctuaire transforme des ressources compatibles par fusion. Les recettes découvertes restent visibles afin que tu puisses préparer les prochaines fusions.' },
    ascension: { title:'Ascension', text:'L’Ascension est une progression avancée. Avant de confirmer, lis toujours ce qui est réinitialisé, ce qui est conservé et le bonus permanent obtenu.' },
    developpement: { title:'Développement', text:'Ce hub regroupe les systèmes qui renforcent durablement ton héros : Compétences, Familiers et Arbre personnel. Ouvre un système puis touche ⓘ pour son explication détaillée.' },
    defis: { title:'Défis', text:'Ce hub regroupe les combats spéciaux comme les Raids et Méga-Boss. Ils complètent la Campagne avec des ressources et récompenses ciblées.' },
    clan: { title:'Clan', text:'Le Clan regroupe la progression et les activités collectives. Consulte les objectifs du clan avant de dépenser les ressources liées à une activité commune.' },
    boutique: { title:'Boutique', text:'La Boutique regroupe les achats disponibles. Vérifie toujours la ressource utilisée et ce que tu obtiens avant de confirmer.' },
    evenement: { title:'Événement', text:'Les Événements proposent des objectifs temporaires et des récompenses dédiées. Vérifie la progression et récupère les récompenses terminées avant la fin.' },
    classement: { title:'Classement', text:'Le Classement permet de situer ta progression par rapport aux autres joueurs selon les critères affichés.' }
  };

  var style = document.createElement('style');
  style.textContent =
    '#srSystemInfoBtn{position:fixed;z-index:8500;right:max(12px,env(safe-area-inset-right));top:calc(env(safe-area-inset-top) + 62px);width:34px;height:34px;border-radius:50%;border:1px solid #4b6d9e;background:#0c1728eF;color:#9fd2ff;font:900 18px/1 system-ui;box-shadow:0 4px 16px #0008;display:flex;align-items:center;justify-content:center;cursor:pointer}' +
    '#srSystemInfoBtn:active{transform:scale(.94)}' +
    '#srSystemInfoOverlay{position:fixed;z-index:30000;inset:0;background:#02060dcc;display:flex;align-items:center;justify-content:center;padding:18px}' +
    '#srSystemInfoCard{width:min(420px,100%);max-height:78vh;overflow:auto;background:linear-gradient(180deg,#111f34,#09121f);border:1px solid #38577f;border-radius:16px;padding:16px;box-shadow:0 18px 60px #000c;color:#eaf3ff;font:500 13px/1.55 system-ui}' +
    '#srSystemInfoCard h2{font-size:17px;margin:0 36px 8px 0;color:#fff}' +
    '#srSystemInfoCard p{margin:0;color:#bfd0e5}' +
    '#srSystemInfoClose{float:right;width:32px;height:32px;border-radius:9px;border:1px solid #38577f;background:#16263d;color:#fff;font-size:20px;cursor:pointer}';
  document.head.appendChild(style);

  function currentKey(){
    try { return typeof route !== 'undefined' ? String(route || 'accueil') : 'accueil'; }
    catch (_) { return 'accueil'; }
  }
  function currentHelp(){ return HELP[currentKey()] || null; }

  function ensureButton(){
    var info = currentHelp();
    var btn = document.getElementById('srSystemInfoBtn');
    if (!info) { if (btn) btn.remove(); return; }
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'srSystemInfoBtn';
      btn.type = 'button';
      btn.textContent = 'ⓘ';
      btn.setAttribute('aria-label','Informations sur ce système');
      document.body.appendChild(btn);
    }
    btn.title = 'Comprendre : ' + info.title;
  }

  function closeInfo(){
    var old = document.getElementById('srSystemInfoOverlay');
    if (old) old.remove();
  }
  function openInfo(){
    var info = currentHelp();
    if (!info) return;
    closeInfo();
    var overlay = document.createElement('div');
    overlay.id = 'srSystemInfoOverlay';
    overlay.innerHTML = '<div id="srSystemInfoCard" role="dialog" aria-modal="true" aria-labelledby="srSystemInfoTitle">' +
      '<button id="srSystemInfoClose" type="button" aria-label="Fermer">×</button>' +
      '<h2 id="srSystemInfoTitle">' + info.title + '</h2><p>' + info.text + '</p></div>';
    document.body.appendChild(overlay);
  }

  document.addEventListener('click', function(e){
    var t = e.target;
    if (!t) return;
    if (t.id === 'srSystemInfoBtn') { e.preventDefault(); openInfo(); return; }
    if (t.id === 'srSystemInfoClose' || t.id === 'srSystemInfoOverlay') { e.preventDefault(); closeInfo(); }
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeInfo(); });

  var screen = document.getElementById('screen');
  if (screen && typeof MutationObserver !== 'undefined') {
    var pending = false;
    new MutationObserver(function(){
      if (pending) return;
      pending = true;
      requestAnimationFrame(function(){ pending = false; ensureButton(); });
    }).observe(screen, {childList:true});
  }
  ensureButton();
  window.__srSystemInfoHelpV446 = HELP;
})();
