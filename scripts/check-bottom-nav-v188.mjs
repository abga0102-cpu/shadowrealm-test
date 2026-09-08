import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const chrome = process.env.CHROME || process.env.PUPPETEER_EXECUTABLE_PATH;
if (!chrome) {
  console.error('CHROME or PUPPETEER_EXECUTABLE_PATH is required');
  process.exit(1);
}

/* Step 7 intentionally tests the NEW navigation contract in isolation instead
   of booting the whole game or executing the legacy V183/V186/V187 patch stack.
   Step 8 will retire those legacy owners from the production load chain. */
const browserScripts = [
  'bottom-nav-v53.js',
  'bottom-nav-canonical-v188.js',
  'bottom-nav-interaction-v188.js',
];
const sourceFiles = [
  ...browserScripts,
  'home-layout-fix-v119.js',
];
for (const file of sourceFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }
}

function sourceCheck(ok, message) {
  console.log(`${ok ? 'PASS' : 'FAIL'} source · ${message}`);
  if (!ok) sourceFailures++;
}
let sourceFailures = 0;
const fantasySource = fs.readFileSync('bottom-nav-v53.js', 'utf8');
const canonicalSource = fs.readFileSync('bottom-nav-canonical-v188.js', 'utf8');
const interactionSource = fs.readFileSync('bottom-nav-interaction-v188.js', 'utf8');
const homeLayoutSource = fs.readFileSync('home-layout-fix-v119.js', 'utf8');

sourceCheck(!/scale\(1\.07\)/.test(fantasySource), 'active fantasy icon no longer scales to 1.07');
sourceCheck(!/translateY\(-2px\)\s*scale/.test(fantasySource), 'active fantasy icon no longer shifts vertically');
sourceCheck(!/#tabs|\.fantasyNavIcon|\.tab>\.ico/.test(homeLayoutSource), 'home-layout compatibility layer no longer owns bottom navigation');
sourceCheck(/inventaire\s*:\s*['"]equipement['"]/.test(canonicalSource), 'inventory maps to Equipment');
sourceCheck(/competences\s*:\s*['"]developpement['"]/.test(canonicalSource), 'competences maps to Development');
sourceCheck(/familiers\s*:\s*['"]developpement['"]/.test(canonicalSource), 'familiers maps to Development');
sourceCheck(/arbre\s*:\s*['"]developpement['"]/.test(canonicalSource), 'arbre maps to Development');
sourceCheck(/parametres\s*:\s*['"]parametres['"]/.test(canonicalSource), 'Settings maps to Settings');
sourceCheck(/max-width:370px/.test(canonicalSource) && /max-height:720px/.test(canonicalSource), 'compact mobile breakpoint is present');
sourceCheck(/env\(safe-area-inset-bottom\)/.test(canonicalSource), 'safe-area bottom contract is present');
sourceCheck(/pointer-events:none!important/.test(interactionSource), 'decorative nav children cannot intercept taps');
sourceCheck(/touch-action:manipulation!important/.test(interactionSource), 'primary tabs use touch-action manipulation');

const profiles = [
  { name: 'compact-height', width: 375, height: 667 },
  { name: 'compact-width', width: 360, height: 780 },
  { name: 'standard', width: 390, height: 844 },
  { name: 'large', width: 430, height: 932 },
];

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>
html,body{margin:0;width:100%;height:100%;background:#07101e}
#app{width:100%;height:100%;display:flex;flex-direction:column}
#screen{flex:1 1 auto;min-height:0}
#tabs{position:relative}
.tab{box-sizing:border-box}
.ico svg{display:block;width:100%;height:100%}
.dot{position:absolute;width:7px;height:7px;border-radius:50%;background:#f44}
</style>
</head>
<body>
<div id="app" class="srHomeFullArena"><div id="screen"></div><div id="tabs"></div></div>
<script>
var route='accueil';
var FIXTURE_TABS=[
  {id:'accueil',label:'Accueil'},
  {id:'equipement',label:'Équipement'},
  {id:'developpement',label:'Développement'},
  {id:'parametres',label:'Réglages'}
];
function rawIcon(){return '<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg></span>'}
function renderTabs(){
  var root=document.getElementById('tabs');
  var exact=FIXTURE_TABS.some(function(t){return t.id===route})?route:null;
  root.innerHTML=FIXTURE_TABS.map(function(t){
    var badge=t.id==='equipement'||t.id==='developpement';
    return '<div class="tab'+(exact===t.id?' on':'')+'" data-act="go" data-arg="'+t.id+'">'+rawIcon()+'<span>'+t.label+'</span>'+(badge?'<div class="dot"></div>':'')+'</div>';
  }).join('');
}
function nav(to){route=String(to||'accueil');renderTabs()}
document.addEventListener('click',function(e){
  var el=e.target.closest&&e.target.closest('[data-act="go"]');
  if(el)nav(el.getAttribute('data-arg'));
});
renderTabs();
</script>
</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],
});

let browserFailures = 0;
try {
  for (const profile of profiles) {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    await page.setViewport({
      width: profile.width,
      height: profile.height,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
    for (const file of browserScripts) {
      await page.addScriptTag({ content: fs.readFileSync(file, 'utf8') });
    }
    await new Promise(resolve => setTimeout(resolve, 120));

    const result = await page.evaluate(async () => {
      const details=[];
      let pass=0,fail=0;
      const record=(ok,msg)=>{details.push({ok:!!ok,msg});ok?pass++:fail++;};
      const near=(a,b,t=0.9)=>Math.abs(Number(a)-Number(b))<=t;
      const settle=()=>new Promise(resolve=>setTimeout(resolve,80));
      const target=tab=>tab.getAttribute('data-nav-target')||tab.getAttribute('data-arg')||'';
      const box=(el,parent)=>{const a=el.getBoundingClientRect(),b=parent.getBoundingClientRect();return{x:a.left-b.left,y:a.top-b.top,w:a.width,h:a.height,cx:(a.left+a.right)/2-b.left};};
      const snap=()=>Array.from(document.querySelectorAll('#tabs>.tab')).map(tab=>{
        const icon=tab.querySelector('.fantasyNavIcon');
        const label=tab.querySelector(':scope>.navLabel')||tab.querySelector(':scope>span:not(.ico):not(.fantasyNavIcon)');
        return {target:target(tab),tab:box(tab,document.getElementById('tabs')),icon:icon?box(icon,tab):null,label:label?box(label,tab):null};
      });
      const same=(a,b)=>near(a.icon.x,b.icon.x,.7)&&near(a.icon.y,b.icon.y,.7)&&near(a.icon.w,b.icon.w,.5)&&near(a.icon.h,b.icon.h,.5)&&near(a.label.x,b.label.x,.7)&&near(a.label.y,b.label.y,.7)&&near(a.label.w,b.label.w,.7)&&near(a.label.h,b.label.h,.7);

      await settle();
      const compact=matchMedia('(max-width:370px),(max-height:720px)').matches;
      const expectedIcon=compact?31:34;
      const expectedTab=compact?54:58;
      const expectedTop=compact?2:3;
      const expectedLabel=compact?36:40;

      const audit=window.__srBottomNavV188Audit&&window.__srBottomNavV188Audit();
      record(!!audit&&audit.ok,'canonical four destinations');

      const routes=[
        ['accueil','accueil'],['equipement','equipement'],['inventaire','equipement'],['personnage','equipement'],['heros','equipement'],
        ['developpement','developpement'],['competences','developpement'],['familiers','developpement'],['arbre','developpement'],['parametres','parametres']
      ];
      const baseline={};
      for(const [routeName,owner] of routes){
        nav(routeName);await settle();
        const tabs=Array.from(document.querySelectorAll('#tabs>.tab'));
        const active=tabs.filter(t=>t.classList.contains('on')||t.getAttribute('aria-current')==='page');
        record(active.length===1&&target(active[0])===owner,`${routeName} has exactly one owner: ${owner}`);
        let ok=tabs.length===4,why='';
        for(const v of snap()){
          if(!v.icon||!v.label){ok=false;why=`${v.target} missing canonical child`;break;}
          if(!near(v.tab.h,expectedTab,.8)){ok=false;why=`${v.target} tab height ${v.tab.h}`;break;}
          if(!near(v.icon.w,expectedIcon,.8)||!near(v.icon.h,expectedIcon,.8)){ok=false;why=`${v.target} icon ${v.icon.w}x${v.icon.h}`;break;}
          if(!near(v.icon.cx,v.tab.w/2,.9)){ok=false;why=`${v.target} icon not centered`;break;}
          if(!near(v.icon.y,expectedTop,.9)){ok=false;why=`${v.target} icon top ${v.icon.y}`;break;}
          if(!near(v.label.y,expectedLabel,1)){ok=false;why=`${v.target} label top ${v.label.y}`;break;}
          if(v.icon.y+v.icon.h>v.label.y+.5){ok=false;why=`${v.target} overlaps label`;break;}
          if(!baseline[v.target])baseline[v.target]=v;
          else if(!same(baseline[v.target],v)){ok=false;why=`${v.target} changes geometry when active`;break;}
        }
        record(ok,`${routeName} geometry stable${why?' — '+why:''}`);
      }

      nav('accueil');await settle();
      let badgeOk=true,badgeWhy='';
      for(const tab of Array.from(document.querySelectorAll('#tabs>.tab'))){
        const before=snap().find(x=>x.target===target(tab));
        let dot=tab.querySelector(':scope>.dot'),added=false;
        if(!dot){dot=document.createElement('div');dot.className='dot';tab.appendChild(dot);added=true;}
        await settle();
        const after=snap().find(x=>x.target===target(tab));
        if(!same(before,after)){badgeOk=false;badgeWhy=`${target(tab)} moved with badge`;}
        else if(getComputedStyle(dot).pointerEvents!=='none'){badgeOk=false;badgeWhy=`${target(tab)} badge intercepts taps`;}
        if(added)dot.remove();
        if(!badgeOk)break;
      }
      record(badgeOk,`badges preserve geometry and taps${badgeWhy?' — '+badgeWhy:''}`);

      let touchOk=true,touchWhy='';
      for(const tab of Array.from(document.querySelectorAll('#tabs>.tab'))){
        const icon=tab.querySelector('.fantasyNavIcon'),label=tab.querySelector('.navLabel'),b=tab.getBoundingClientRect();
        if(!icon||!label){touchOk=false;touchWhy=`${target(tab)} missing child`;break;}
        if(getComputedStyle(icon).pointerEvents!=='none'||getComputedStyle(label).pointerEvents!=='none'){touchOk=false;touchWhy=`${target(tab)} child intercepts taps`;break;}
        if(b.height<44){touchOk=false;touchWhy=`${target(tab)} target ${b.height}px`;break;}
      }
      record(touchOk,`all tab cells are >=44px touch targets${touchWhy?' — '+touchWhy:''}`);

      let clickOk=true;
      for(const id of ['accueil','equipement','developpement','parametres']){
        const tab=Array.from(document.querySelectorAll('#tabs>.tab')).find(t=>target(t)===id);
        if(!tab){clickOk=false;break;}
        tab.click();await settle();
        if(route!==id){clickOk=false;break;}
      }
      record(clickOk,'Accueil → Équipement → Développement → Réglages click sequence routes correctly');

      return {pass,fail,details,compact};
    });

    console.log(`\n=== ${profile.name} ${profile.width}x${profile.height} ===`);
    for (const detail of result.details) console.log(`${detail.ok ? 'PASS' : 'FAIL'} browser · ${detail.msg}`);
    console.log(`Result: ${result.pass} passed / ${result.fail} failed`);
    browserFailures += result.fail;
    await page.close();
  }
} finally {
  await browser.close();
}

const totalFailures = sourceFailures + browserFailures;
if (totalFailures) {
  console.error(`\nV188 Step 7 failed with ${totalFailures} assertion(s).`);
  process.exit(1);
}
console.log('\nV188 Step 7 passed: source ownership + isolated canonical browser contract are green on all four mobile viewport profiles.');
