/* Shadowreach · journal de versions compact V533 (information uniquement) */
(function(){
'use strict';
if(document.getElementById('srUpdates533'))return;
var entries=[
 {cat:'Corrections',icon:'🛠',items:[
  ['10/10/2026','V535','Forge : restauration immédiate du défilement lors des reconstructions de l’accueil (test mobile requis).'],
  ['10/10/2026','V532','Conservation du défilement du conteneur de forge lors des actualisations.'],
  ['10/10/2026','V531','Premier correctif de position de la forge.'],
  ['10/10/2026','V530','Moins de recalculs de l’accueil et de la maîtrise de forge.']
 ]},
 {cat:'Équilibrage · puissance',icon:'⚔️',items:[
  ['10/10/2026','V529','Raids : puissance de base +25 %, puis progression renforcée par paliers de 5 niveaux.'],
  ['10/10/2026','V521','Première révision de la montée en puissance des ennemis de raid.']
 ]},
 {cat:'Forge & équipement',icon:'⚒️',items:[
  ['10/10/2026','V525–526','Maîtrise affichée en chiffres romains ; taille de la forge réajustée.'],
  ['10/10/2026','V522–524','Réorganisation visuelle de la forge et de son affichage.']
 ]},
 {cat:'Économie & récompenses',icon:'💎',items:[
  ['10/10/2026','V538','Sanctuaire : bonus Abondance désormais appliqué aux minerais du sacrifice Divin.'],
  ['10/10/2026','V537','Sanctuaire : récompenses Rebirth obsolètes remplacées pour les prochains sacrifices ; anciens boosts PR utilisables en bonus Or.'],
  ['10/10/2026','V536','Sanctuaire : prix Épique I ajusté pour respecter le coût de fusion de quatre Rare I.'],
  ['10/10/2026','V527–528','Accomplissement des 1 500 fusions : récupération des minéraux et option de correction volontaire de l’or.'],
  ['10/10/2026','V520','Objectif de victoires en raid révisé à 150.']
 ]}
];
var style=document.createElement('style');style.textContent=`
#srUpdates533{position:fixed;z-index:2147483000;right:12px;bottom:calc(74px + env(safe-area-inset-bottom,0px));font-family:system-ui,sans-serif;color:#eef5ff}
#srUpdates533 *{box-sizing:border-box}
#srUpdates533 .srUButton{border:1px solid #b99a5a;border-radius:22px;padding:9px 14px;background:#172a3c;color:#ffe5a4;box-shadow:0 3px 15px #0009;font-size:12px;font-weight:900}
#srUpdates533 .srUPanel{position:fixed;right:10px;left:10px;bottom:calc(65px + env(safe-area-inset-bottom,0px));margin:auto;max-width:440px;max-height:min(70dvh,570px);overflow:auto;overscroll-behavior:contain;background:#101d30;border:1px solid #b99a5a;border-radius:15px;box-shadow:0 12px 35px #000c;padding:14px}
#srUpdates533 .srUHead{display:flex;align-items:center;justify-content:space-between;gap:8px}
#srUpdates533 h2{font-size:17px;margin:0;color:#ffdc92}
#srUpdates533 .srUClose{border:0;background:#273c54;color:white;border-radius:9px;padding:7px 11px;font-size:18px}
#srUpdates533 .srUSub{font-size:11px;color:#9fb4c9;margin:5px 0 12px}
#srUpdates533 details{border:1px solid #30445b;border-radius:10px;margin:7px 0;background:#15273c;overflow:hidden}
#srUpdates533 summary{cursor:pointer;list-style:none;padding:11px;font-weight:800;font-size:12px;display:flex;justify-content:space-between;gap:5px}
#srUpdates533 summary::-webkit-details-marker{display:none}
#srUpdates533 .srUCount{color:#a9c2d7;font-weight:500}
#srUpdates533 .srUEntry{padding:9px 11px;border-top:1px solid #2b3d52;font-size:11px;line-height:1.5}
#srUpdates533 .srUDate{color:#ffd894;font-weight:800;margin-right:6px}
#srUpdates533 .srUVer{color:#9bc4e5;font-weight:700;margin-right:6px}
#srUpdates533 .srUFoot{font-size:11px;color:#c5d1de;text-align:center;padding-top:8px}
#srUpdates533 .srUFoot a{color:#ffd894;text-decoration:underline}
`;document.head.appendChild(style);
var root=document.createElement('aside');root.id='srUpdates533';root.setAttribute('aria-label','Journal des mises à jour');
var button=document.createElement('button');button.type='button';button.className='srUButton';button.textContent='📋 Mises à jour';button.setAttribute('aria-expanded','false');
var panel=document.createElement('section');panel.className='srUPanel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Mises à jour de Shadowreach');
var head=document.createElement('div');head.className='srUHead';var title=document.createElement('h2');title.textContent='Journal des mises à jour';var close=document.createElement('button');close.type='button';close.className='srUClose';close.textContent='×';close.setAttribute('aria-label','Fermer');head.append(title,close);panel.append(head);
var sub=document.createElement('p');sub.className='srUSub';sub.textContent='Historique récent · regroupé par thème · dates et versions';panel.append(sub);
entries.forEach(function(group,index){var d=document.createElement('details');if(index===0)d.open=true;var summary=document.createElement('summary');var name=document.createElement('span');name.textContent=group.icon+' '+group.cat;var count=document.createElement('span');count.className='srUCount';count.textContent=group.items.length+' entrées ▾';summary.append(name,count);d.append(summary);group.items.forEach(function(item){var row=document.createElement('div');row.className='srUEntry';var date=document.createElement('span');date.className='srUDate';date.textContent=item[0];var version=document.createElement('span');version.className='srUVer';version.textContent=item[1];var desc=document.createElement('span');desc.textContent=item[2];row.append(date,version,desc);d.append(row);});panel.append(d);});
var foot=document.createElement('div');foot.className='srUFoot';var link=document.createElement('a');link.href='https://github.com/abga0102-cpu/shadowrealm-test/commits';link.target='_blank';link.rel='noopener noreferrer';link.textContent='voir ghb pour + d’infos';foot.append(link);panel.append(foot);
function toggle(open){panel.hidden=!open;button.setAttribute('aria-expanded',String(open));}
button.addEventListener('click',function(){toggle(panel.hidden);});close.addEventListener('click',function(){toggle(false);});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)toggle(false);});
root.append(button,panel);document.body.append(root);
})();