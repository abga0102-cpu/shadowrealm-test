from pathlib import Path
import re

p=Path('game-1.js')
s=p.read_text(encoding='utf-8')

combat50=[10,20,32,46,64,86,112,142,178,220,270,328,396,474,564,668,788,926,1084,1266,1474,1708,1970,2260,2580,2930,3312,3726,4174,4656,5174,5728,6320,6950,7620,8330,9082,9876,10714,11596,12524,13498,14520,15590,16710,17880,19102,20376,21704,23086]
combat100=combat50[:]
d1=combat100[-1]-combat100[-2]; d2=56; rep=0
while len(combat100)<100:
    d1+=d2; combat100.append(combat100[-1]+d1); rep+=1
    if rep==2: d2+=2; rep=0

exp10=[10,20,30,50,75,110,160,230,320,450]
exp100=exp10[:]; inc=130
while len(exp100)<100:
    inc+=30; exp100.append(exp100[-1]+inc)

gold50=[25,40,50,65,80,90,105,130,145,155,180,205,220,245,270,300,325,350,375,415,440,465,505,545,570,610,650,685,725,765,805,845,895,935,970,1025,1075,1115,1165,1220,1270,1320,1375,1425,1490,1545,1595,1660,1725,1815]
gold100=gold50[:]
recent=[gold50[i]-gold50[i-1] for i in range(40,50)]; inc=round(sum(recent)/len(recent)); extra=0
while len(gold100)<100:
    if extra and extra%5==0: inc+=5
    gold100.append(gold100[-1]+inc); extra+=1

floor25=[100,258,417,575,733,892,1050,1208,1367,1525,1683,1842,2000,2158,2317,2475,2633,2792,2950,3108,3267,3425,3583,3742,3900]
floor50=floor25[:]; slope=(floor25[-1]-floor25[0])/(len(floor25)-1)
while len(floor50)<50:
    i=len(floor50); floor50.append(round(floor25[0]+slope*i))

boss20=list(range(100,4000,200))
pr25=[round(50+(1950-50)*i/24) for i in range(25)]
assert sum(boss20)==40000
assert sum(pr25)==25000

def arr(a): return '['+','.join(map(str,a))+']'
new=f'''const REBIRTH_UPGRADES = [
  {{ key: "damage", label: "Dégâts", icon: "flame", max: 100, perLvl: 8, unit: "%", costs: {arr(combat100)} }},
  {{ key: "life", label: "Vie", icon: "heart", max: 100, perLvl: 8, unit: "%", costs: {arr(combat100)} }},
  {{ key: "atkspeed", label: "Vit. Attaque", icon: "bolt", max: 5, perLvl: 3, unit: "%", costs: [10,20,30,50,75] }},
  {{ key: "critdmg", label: "Dégâts Crit.", icon: "sparkle", max: 5, perLvl: 8, unit: "%", costs: [10,20,30,50,75] }},
  {{ key: "dmgred", label: "Réduc. Dégâts", icon: "shield", max: 50, perLvl: 6, unit: "%", costs: {arr(combat50)} }},
  {{ key: "regen", label: "Régénération", icon: "potion", max: 5, perLvl: 0.6, unit: "%/s", costs: [10,20,30,50,75] }},
  {{ key: "lifesteal", label: "Vol de Vie", icon: "droplet", max: 5, perLvl: 1, unit: "%", costs: [10,20,32,46,64] }},
  {{ key: "bossdmg", label: "Dégâts Boss", icon: "skull", max: 20, perLvl: 8, unit: "%", costDiv: 1, costs: {arr(boss20)} }},
  {{ key: "exp", label: "EXP", icon: "cap", max: 100, perLvl: 2, unit: "%", costs: {arr(exp100)} }},
  {{ key: "gold", label: "Or", icon: "gold", max: 100, perLvl: 6, unit: "%", costDiv: 1, costs: {arr(gold100)} }},
  {{ key: "apples", label: "Gain Pommes", icon: "paw", max: 20, perLvl: 5, unit: "%", costDiv: 1, costs: [200,300,400,500,650,800,950,1100,1300,1500,1700,1900,2100,2300,2500,2800,3100,3400,3700,3800] }},
  {{ key: "prgain", label: "Gain PR", icon: "chart", max: 25, perLvl: 8, unit: "%", costDiv: 1, costs: {arr(pr25)} }},
  {{ key: "keep", label: "Conservation", icon: "cycle", max: 5, perLvl: 2, unit: "%", costs: [100,200,350,550,800] }},
  {{ key: "floorSkip", label: "Saut d'étage", icon: "forward", max: 50, perLvl: 0.8, unit: "%", costDiv: 1, costs: {arr(floor50)} }},
];'''
pat=re.compile(r'const REBIRTH_UPGRADES = \[.*?\n\];\nfunction rebirthKeepPct',re.S)
if not pat.search(s): raise SystemExit('REBIRTH block not found')
s=pat.sub(new+'\nfunction rebirthKeepPct',s,count=1)

old='''function rb(s, key) {\n  const def = REBIRTH_UPGRADES.find((u) => u.key === key);\n  if (!def) return 0;\n  return (s.rebirth.upgrades[key] || 0) * def.perLvl;\n}'''
newrb='''function rb(s, key) {\n  const def = REBIRTH_UPGRADES.find((u) => u.key === key);\n  if (!def) return 0;\n  const lvl = Math.max(0, Math.min(def.max, Number((s.rebirth.upgrades || {})[key]) || 0));\n  return lvl * def.perLvl;\n}'''
if old in s: s=s.replace(old,newrb,1)

marker='  // GOLD_ECONOMY_REBASE_V32\n'
if 'REBIRTH_CAPS_V171' not in s:
    mig='''  // REBIRTH_CAPS_V171\n  if (!Object.prototype.hasOwnProperty.call(s, "rebirthCapsV171")) {\n    const oldCosts=[50,77,103,130,156,183,209,236,262,289,315,342,368,395,421,448,474,501,528,554,581,607,634,660,687,713,740,766,793,819,846,872,899,926,952,979,1005,1032,1058,1085,1111,1138,1164,1191,1217,1244,1270,1297,1323,1350];\n    const ups=merged.rebirth.upgrades || (merged.rebirth.upgrades={});\n    const oldLv=Math.max(0,Math.min(50,Math.floor(Number(ups.prgain)||0)));\n    let refundPR=0;\n    if(oldLv>25){ refundPR=oldCosts.slice(25,oldLv).reduce((a,b)=>a+b,0); merged.rebirth.pr=Math.max(0,Number(merged.rebirth.pr)||0)+refundPR; ups.prgain=25; }\n    merged.rebirthCapsV171=true;\n    if(refundPR>0) merged.rebirthCapsV171Notice={oldLevel:oldLv,newLevel:25,refundPR};\n  }\n\n'''
    if marker not in s: raise SystemExit('migration marker not found')
    s=s.replace(marker,mig+marker,1)

p.write_text(s,encoding='utf-8')

idx=Path('index.html'); h=idx.read_text(encoding='utf-8')
h=re.sub(r'<!-- .*?build 2026\.09\.08\.\d+ -->','<!-- Rebirth caps V171 · build 2026.09.08.171 -->',h,count=1)
h=re.sub(r'<meta name="shadowreach-build" content="[^"]+">','<meta name="shadowreach-build" content="2026.09.08.171">',h,count=1)
h=re.sub(r'game-1\.js\?v=[^"<]+','game-1.js?v=2026.09.08.171',h,count=1)
idx.write_text(h,encoding='utf-8')
