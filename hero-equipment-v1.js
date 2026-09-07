/* SHADOWREACH HERO EQUIPMENT VISUAL V1
   The hero starts in a neutral white T-shirt + white shorts. Visible gear is
   derived from S.equipped every frame, without changing combat stats or saves.
   The existing weapon renderer remains authoritative for weapons/projectiles. */
(()=>{
"use strict";
if(typeof drawArena!=="function") return;

const originalDrawArena=drawArena;
const slotItem=(...keys)=>{
  const eq=(typeof S!=="undefined"&&S&&S.equipped)||{};
  for(const k of keys){if(eq[k]) return eq[k];}
  return null;
};
const itemColor=(it,fallback)=>{
  try{return it&&typeof RARITY!=="undefined"&&RARITY[it.rarity]?RARITY[it.rarity].c:fallback;}catch(_){return fallback;}
};
const escAttr=(v)=>String(v||"").replace(/["&<>]/g,c=>({"":"&quot;","&":"&amp;","<":"&lt;",">":"&gt;"}[c]||c));

function gearMarkup(){
  const helm=slotItem("casque","helm");
  const armor=slotItem("armure","armor");
  const gloves=slotItem("gants","gloves");
  const boots=slotItem("bottes","boots");
  const belt=slotItem("ceinture","belt");
  const necklace=slotItem("collier","necklace");
  const ring=slotItem("anneau","ring");
  const hc=itemColor(helm,"#7184a7"),ac=itemColor(armor,"#7184a7"),gc=itemColor(gloves,"#7184a7"),bc=itemColor(boots,"#7184a7"),
        bec=itemColor(belt,"#d0a64d"),nc=itemColor(necklace,"#d0a64d"),rc=itemColor(ring,"#8feff4");
  return '<div class="hevBody" aria-hidden="true">'+
    '<div class="hevLeg l"></div><div class="hevLeg r"></div>'+
    '<div class="hevShorts"></div>'+
    '<div class="hevArm l"></div><div class="hevArm r"></div>'+
    '<div class="hevShirt"></div>'+
    '<div class="hevNeck"></div><div class="hevHead"></div><div class="hevHair"></div>'+
    (armor?'<div class="hevArmor" style="--gear:'+ac+'" title="'+escAttr(armor.name)+'"></div>':'')+
    (belt?'<div class="hevBelt" style="--gear:'+bec+'"></div>':'')+
    (gloves?'<div class="hevGlove l" style="--gear:'+gc+'"></div><div class="hevGlove r" style="--gear:'+gc+'"></div>':'')+
    (boots?'<div class="hevBoot l" style="--gear:'+bc+'"></div><div class="hevBoot r" style="--gear:'+bc+'"></div>':'')+
    (necklace?'<div class="hevNecklace" style="--gear:'+nc+'"></div>':'')+
    (ring?'<div class="hevRing" style="--gear:'+rc+'"></div>':'')+
    (helm?'<div class="hevHelm" style="--gear:'+hc+'" title="'+escAttr(helm.name)+'"></div>':'')+
  '</div>';
}

function applyHeroVisual(){
  const layer=document.getElementById("aLayer");
  if(!layer) return;
  const hero=layer.querySelector(":scope > .unit");
  if(!hero) return;
  hero.classList.add("heroEqUnit");
  const sprite=hero.querySelector(":scope > img");
  if(sprite) sprite.classList.add("heroOriginalSprite");
  if(!hero.querySelector(":scope > .heroEqVisual")){
    const v=document.createElement("div");
    v.className="heroEqVisual";
    v.innerHTML=gearMarkup();
    const before=sprite||hero.firstChild;
    hero.insertBefore(v,before);
  }
  const v=hero.querySelector(":scope > .heroEqVisual");
  if(v&&sprite){
    const m=(sprite.style.transform||"").match(/rotate\([^)]*\)/);
    v.style.transform=m?m[0]:"";
  }
}

drawArena=function(){
  originalDrawArena.apply(this,arguments);
  try{applyHeroVisual();}catch(_){/* visual layer must never break combat */}
};

const style=document.createElement("style");
style.id="heroEquipmentVisualStyle";
style.textContent=`
.heroEqUnit>.heroOriginalSprite{display:none!important}
.heroEqVisual{position:absolute;inset:0;z-index:1;pointer-events:none;transform-origin:50% 82%;transition:transform .05s linear}
.hevBody{position:absolute;inset:0;filter:drop-shadow(0 2px 2px #0008)}
.hevHead{position:absolute;left:36%;top:7%;width:28%;height:24%;border-radius:48% 48% 44% 44%;background:linear-gradient(135deg,#d99a72,#aa6849);border:1px solid #4d2c24}
.hevHair{position:absolute;left:33%;top:2%;width:34%;height:17%;border-radius:55% 55% 35% 35%;background:#171923;clip-path:polygon(0 52%,12% 17%,28% 30%,43% 0,55% 26%,78% 8%,100% 45%,91% 75%,73% 54%,65% 88%,45% 60%,25% 91%,18% 58%)}
.hevNeck{position:absolute;left:45%;top:27%;width:10%;height:8%;background:#bd7957;border-radius:3px}
.hevShirt{position:absolute;left:29%;top:31%;width:42%;height:30%;border-radius:8px 8px 5px 5px;background:linear-gradient(180deg,#fff,#e8edf3);border:1px solid #aeb8c7;clip-path:polygon(11% 0,89% 0,100% 20%,86% 34%,82% 100%,18% 100%,14% 34%,0 20%)}
.hevArm{position:absolute;top:34%;width:11%;height:31%;border-radius:8px;background:linear-gradient(180deg,#d99a72,#aa6849)}
.hevArm.l{left:20%;transform:rotate(8deg)}.hevArm.r{right:20%;transform:rotate(-8deg)}
.hevShorts{position:absolute;left:32%;top:58%;width:36%;height:18%;background:linear-gradient(180deg,#fff,#dfe5ed);border:1px solid #aeb8c7;clip-path:polygon(0 0,100% 0,94% 100%,55% 100%,50% 47%,45% 100%,6% 100%)}
.hevLeg{position:absolute;top:73%;width:11%;height:24%;border-radius:0 0 7px 7px;background:linear-gradient(180deg,#c98761,#9f5d43)}
.hevLeg.l{left:35%}.hevLeg.r{right:35%}
.hevArmor{position:absolute;left:25%;top:29%;width:50%;height:34%;background:linear-gradient(145deg,color-mix(in srgb,var(--gear) 72%,#fff),color-mix(in srgb,var(--gear) 72%,#111));border:2px solid color-mix(in srgb,var(--gear) 60%,#0a1020);clip-path:polygon(18% 0,82% 0,100% 24%,86% 100%,14% 100%,0 24%);box-shadow:inset 0 2px #ffffff55,0 0 7px color-mix(in srgb,var(--gear) 50%,transparent)}
.hevArmor:after{content:"";position:absolute;left:42%;top:8%;width:16%;height:70%;background:#ffffff22;clip-path:polygon(50% 0,100% 45%,50% 100%,0 45%)}
.hevHelm{position:absolute;left:31%;top:1%;width:38%;height:27%;background:linear-gradient(145deg,color-mix(in srgb,var(--gear) 78%,#fff),color-mix(in srgb,var(--gear) 70%,#111));border:2px solid #111827;clip-path:polygon(15% 15%,50% 0,85% 15%,100% 48%,87% 100%,68% 76%,32% 76%,13% 100%,0 48%);box-shadow:inset 0 2px #ffffff55}
.hevHelm:after{content:"";position:absolute;left:47%;top:24%;width:6%;height:60%;background:#0b1020}
.hevGlove{position:absolute;top:57%;width:14%;height:13%;border-radius:45%;background:var(--gear);border:1px solid #101522;box-shadow:inset 0 1px #ffffff55}.hevGlove.l{left:17%}.hevGlove.r{right:17%}
.hevBoot{position:absolute;top:84%;width:16%;height:14%;border-radius:3px 3px 7px 7px;background:linear-gradient(180deg,var(--gear),color-mix(in srgb,var(--gear) 65%,#111));border:1px solid #101522}.hevBoot.l{left:31%}.hevBoot.r{right:31%}
.hevBelt{position:absolute;left:28%;top:58%;width:44%;height:7%;border-radius:3px;background:linear-gradient(180deg,var(--gear),color-mix(in srgb,var(--gear) 65%,#111));border:1px solid #111827}.hevBelt:after{content:"";position:absolute;left:43%;top:-20%;width:14%;height:140%;border:1px solid #f4d06f;border-radius:2px}
.hevNecklace{position:absolute;left:41%;top:31%;width:18%;height:13%;border-left:2px solid var(--gear);border-right:2px solid var(--gear);border-bottom:2px solid var(--gear);border-radius:0 0 50% 50%}.hevNecklace:after{content:"";position:absolute;left:41%;bottom:-5px;width:5px;height:5px;background:var(--gear);transform:rotate(45deg);box-shadow:0 0 5px var(--gear)}
.hevRing{position:absolute;right:18%;top:61%;width:6px;height:6px;border:2px solid var(--gear);border-radius:50%;box-shadow:0 0 5px var(--gear)}
`;
document.head.appendChild(style);
})();
