import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const chrome = process.env.CHROME || process.env.PUPPETEER_EXECUTABLE_PATH;
if (!chrome) {
  console.error('CHROME or PUPPETEER_EXECUTABLE_PATH is required');
  process.exit(1);
}

/*
 * STEP 7 — deterministic verification, deliberately independent from the full
 * game runtime and from MutationObservers.
 *
 * We verify the real production source contract statically, then render the
 * real V53 + V188 CSS cascade against the canonical four-tab DOM in Chromium.
 * This catches geometry/active/badge/touch regressions without booting combat,
 * timers, audio, tutorials or legacy navigation patch observers.
 */
const files = {
  fantasy: 'bottom-nav-v53.js',
  canonical: 'bottom-nav-canonical-v188.js',
  interaction: 'bottom-nav-interaction-v188.js',
  homeLayout: 'home-layout-fix-v119.js',
};
const source = {};
for (const [key,file] of Object.entries(files)) {
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }
  source[key] = fs.readFileSync(file,'utf8');
}

let sourceFailures=0;
function sourceCheck(ok,msg){
  console.log(`${ok?'PASS':'FAIL'} source · ${msg}`);
  if(!ok)sourceFailures++;
}

sourceCheck(!/scale\(1\.07\)/.test(source.fantasy),'active icon has no 1.07 scale');
sourceCheck(!/translateY\(-2px\)\s*scale/.test(source.fantasy),'active icon has no selected-state vertical shift');
sourceCheck(!/#tabs|\.fantasyNavIcon|\.tab>\.ico/.test(source.homeLayout),'home-layout layer no longer owns bottom navigation');

const expectedOwners = {
  accueil:'accueil',
  equipement:'equipement',
  inventaire:'equipement',
  personnage:'equipement',
  heros:'equipement',
  developpement:'developpement',
  competences:'developpement',
  familiers:'developpement',
  arbre:'developpement',
  parametres:'parametres',
};
for(const [route,owner] of Object.entries(expectedOwners)){
  const escaped=route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`${escaped}\\s*:\\s*['\"]${owner}['\"]`);
  sourceCheck(re.test(source.canonical),`${route} maps to ${owner}`);
}
sourceCheck(/max-width:370px/.test(source.canonical)&&/max-height:720px/.test(source.canonical),'compact mobile breakpoint exists');
sourceCheck(/env\(safe-area-inset-bottom\)/.test(source.canonical),'safe-area bottom contract exists');
sourceCheck(/pointer-events:none!important/.test(source.interaction),'decorative children cannot intercept taps');
sourceCheck(/touch-action:manipulation!important/.test(source.interaction),'tab touch-action is manipulation');
sourceCheck(/data-act['"],['"]go['"]|setAttr\(tab,['"]data-act['"],['"]go['"]\)/.test(source.interaction),'interaction contract repairs data-act=go');
sourceCheck(/data-nav-target/.test(source.interaction),'interaction contract exposes canonical nav target');

function extractCss(src){
  const chunks=[];
  const re=/[A-Za-z_$][\w$]*\.textContent\s*=\s*`([\s\S]*?)`\s*;/g;
  let m;
  while((m=re.exec(src)))chunks.push(m[1]);
  return chunks.join('\n');
}
const fantasyCss=extractCss(source.fantasy);
const canonicalCss=extractCss(source.canonical);
const interactionCss=extractCss(source.interaction);
sourceCheck(fantasyCss.includes('.fantasyNavIcon'),'V53 fantasy navigation CSS extracted');
sourceCheck(canonicalCss.includes('srHomeFullArena')&&canonicalCss.includes('#tabs'),'V188 canonical geometry CSS extracted');
sourceCheck(interactionCss.includes('pointer-events:none'),'V188 interaction CSS extracted');

const profiles=[
  {name:'compact-height',width:375,height:667},
  {name:'compact-width',width:360,height:780},
  {name:'standard',width:390,height:844},
  {name:'large',width:430,height:932},
];

function markup(active='accueil'){
  const tabs=[
    ['accueil','Accueil'],
    ['equipement','Équipement'],
    ['developpement','Développement'],
    ['parametres','Réglages'],
  ];
  return tabs.map(([id,label])=>`<div class="tab${id===active?' on':''}" data-act="go" data-arg="${id}" data-nav-key="${id}" data-nav-target="${id}"${id===active?' aria-current="page" aria-selected="true"':''}>
    <span class="ico"><span class="fantasyNavIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle></svg></span></span>
    <span class="navLabel">${label}</span>
    ${(id==='equipement'||id==='developpement')?'<span class="dot"></span>':''}
  </div>`).join('');
}

const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>
html,body{margin:0;width:100%;height:100%;background:#07101e}
#app{width:100%;height:100%;display:flex;flex-direction:column}
#screen{flex:1 1 auto;min-height:0}
#tabs{position:relative}
.tab{box-sizing:border-box}
.fantasyNavIcon svg{display:block;width:100%;height:100%}
.dot{position:absolute;width:7px;height:7px;border-radius:50%}
${fantasyCss}
${canonicalCss}
${interactionCss}
</style></head><body><div id="app" class="srHomeFullArena"><div id="screen"></div><div id="tabs">${markup()}</div></div></body></html>`;

const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
let browserFailures=0;
try{
  for(const profile of profiles){
    const page=await browser.newPage();
    await page.setViewport({width:profile.width,height:profile.height,deviceScaleFactor:1,isMobile:true,hasTouch:true});
    await page.setContent(html,{waitUntil:'domcontentloaded',timeout:10000});

    const result=await page.evaluate(async()=>{
      const details=[];let pass=0,fail=0;
      const record=(ok,msg)=>{details.push({ok:!!ok,msg});ok?pass++:fail++;};
      const near=(a,b,t=.9)=>Math.abs(Number(a)-Number(b))<=t;
      const target=t=>t.getAttribute('data-nav-target')||t.getAttribute('data-arg')||'';
      const relBox=(el,parent)=>{const a=el.getBoundingClientRect(),b=parent.getBoundingClientRect();return{x:a.left-b.left,y:a.top-b.top,w:a.width,h:a.height,cx:(a.left+a.right)/2-b.left};};
      const snapshot=()=>Array.from(document.querySelectorAll('#tabs>.tab')).map(tab=>({
        target:target(tab),
        tab:relBox(tab,document.getElementById('tabs')),
        icon:relBox(tab.querySelector('.fantasyNavIcon'),tab),
        label:relBox(tab.querySelector('.navLabel'),tab),
      }));
      const same=(a,b)=>near(a.icon.x,b.icon.x,.7)&&near(a.icon.y,b.icon.y,.7)&&near(a.icon.w,b.icon.w,.5)&&near(a.icon.h,b.icon.h,.5)&&near(a.label.x,b.label.x,.7)&&near(a.label.y,b.label.y,.7)&&near(a.label.w,b.label.w,.7)&&near(a.label.h,b.label.h,.7)&&near(a.tab.h,b.tab.h,.5);
      const compact=matchMedia('(max-width:370px),(max-height:720px)').matches;
      const expectedIcon=compact?31:34,expectedTab=compact?54:58,expectedTop=compact?2:3,expectedLabel=compact?36:40;

      const baseline=snapshot();
      record(baseline.length===4,'exactly four primary tabs');
      record(baseline.every(v=>near(v.tab.h,expectedTab,.8)),`all tab heights are ${expectedTab}px`);
      record(baseline.every(v=>near(v.icon.w,expectedIcon,.8)&&near(v.icon.h,expectedIcon,.8)),`all icon boxes are ${expectedIcon}px`);
      record(baseline.every(v=>near(v.icon.cx,v.tab.w/2,.9)&&near(v.icon.y,expectedTop,.9)),'all icons are centered at the same vertical anchor');
      record(baseline.every(v=>near(v.label.y,expectedLabel,1)),'all labels share the same vertical anchor');
      record(baseline.every(v=>v.icon.y+v.icon.h<=v.label.y+.5),'no icon overlaps its label');

      const ownerStates={};
      for(const id of ['accueil','equipement','developpement','parametres']){
        const tabs=Array.from(document.querySelectorAll('#tabs>.tab'));
        tabs.forEach(tab=>{
          const on=target(tab)===id;
          tab.classList.toggle('on',on);
          if(on){tab.setAttribute('aria-current','page');tab.setAttribute('aria-selected','true');}
          else{tab.removeAttribute('aria-current');tab.setAttribute('aria-selected','false');}
        });
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        const active=tabs.filter(tab=>tab.classList.contains('on')||tab.getAttribute('aria-current')==='page');
        record(active.length===1&&target(active[0])===id,`${id} produces one active tab`);
        const current=snapshot();
        record(current.every((v,i)=>same(v,baseline[i])),`${id} active state does not move or resize geometry`);
        ownerStates[id]=current;
      }

      let badgeOk=true;
      for(const tab of Array.from(document.querySelectorAll('#tabs>.tab'))){
        const before=snapshot().find(v=>v.target===target(tab));
        let dot=tab.querySelector(':scope>.dot');let added=false;
        if(!dot){dot=document.createElement('span');dot.className='dot';tab.appendChild(dot);added=true;}
        const after=snapshot().find(v=>v.target===target(tab));
        if(!same(before,after)||getComputedStyle(dot).pointerEvents!=='none')badgeOk=false;
        if(added)dot.remove();
      }
      record(badgeOk,'notification dots neither move the tab contents nor intercept taps');

      const touchOk=Array.from(document.querySelectorAll('#tabs>.tab')).every(tab=>{
        const icon=tab.querySelector('.fantasyNavIcon'),label=tab.querySelector('.navLabel');
        return tab.getBoundingClientRect().height>=44&&getComputedStyle(icon).pointerEvents==='none'&&getComputedStyle(label).pointerEvents==='none'&&getComputedStyle(tab).touchAction==='manipulation';
      });
      record(touchOk,'all four full tab cells are valid >=44px touch targets');

      const widths=baseline.map(v=>v.tab.w);
      record(Math.max(...widths)-Math.min(...widths)<=1,'all four tabs have equal width');
      return{pass,fail,details,compact};
    });

    console.log(`\n=== ${profile.name} ${profile.width}x${profile.height} ===`);
    for(const d of result.details)console.log(`${d.ok?'PASS':'FAIL'} browser · ${d.msg}`);
    console.log(`Result: ${result.pass} passed / ${result.fail} failed`);
    browserFailures+=result.fail;
    await page.close();
  }
}finally{
  await browser.close();
}

const totalFailures=sourceFailures+browserFailures;
if(totalFailures){
  console.error(`\nV188 Step 7 failed with ${totalFailures} assertion(s).`);
  process.exit(1);
}
console.log('\nV188 Step 7 passed: source contract + CSS geometry are green across all four mobile viewport profiles.');
