from pathlib import Path

hud=Path('game-3.js'); s=hud.read_text()
old='    \'<div class="pbox" data-act="go" data-arg="personnage">\' +'
new='    \'<div class="pbox" data-act="go" data-arg="heros" title="Héros · Points de statistiques">\' +'
if old not in s: raise SystemExit('hero HUD anchor missing')
s=s.replace(old,new,1)
old='''        '<div class="row gap6"><span class="pname flex1">' + esc(S.playerName) + "</span>" +
          '<span class="power">' + ic("swords", 11) + fmt(S.power) + "</span>" + "</div>" +'''
new='''        '<div class="row gap6"><span class="pname flex1">' + esc(S.playerName) + "</span>" +
          '<span class="power">' + ic("swords", 11) + fmt(S.power) + "</span>" +
          (S.statPoints > 0 ? '<span class="dot" style="position:static;flex:0 0 auto" title="Points de statistiques disponibles"></span>' : "") + "</div>" +'''
if old not in s: raise SystemExit('hero row anchor missing')
s=s.replace(old,new,1)
old='''        '<div class="curr" data-act="resInfo" data-arg="pa" title="Points de Statistique" style="cursor:pointer;border-color:' + (S.statPoints > 0 ? '#FFD65E88' : 'var(--line)') + ';color:' + (S.statPoints > 0 ? '#FFD65E' : 'var(--textDim)') + '">' + ic("pa", 15) + "<b>" + fmt(S.statPoints) + "</b>" +
          '<span class="plus" data-act="go" data-arg="heros">' + ic("plus", 10) + "</span></div>" +
'''
if old not in s: raise SystemExit('stat points chip anchor missing')
s=s.replace(old,'',1)
hud.write_text(s)

home=Path('game-4.js'); h=home.read_text()
old='    { label: "Équipement", icon: "swords", color: "#5A7099", go: "equipement", badge: S.statPoints > 0 || S.inventory.length > 0 },'
new='    { label: "Équipement", icon: "swords", color: "#5A7099", go: "equipement", badge: S.inventory.length > 0 },'
if old not in h: raise SystemExit('equipment badge anchor missing')
home.write_text(h.replace(old,new,1))

eng=Path('game-2.js'); e=eng.read_text()
if '|| "2026.09.06.25";' not in e: raise SystemExit('APP_BUILD fallback anchor missing')
eng.write_text(e.replace('|| "2026.09.06.25";','|| "2026.09.06.27";',1))

idx=Path('index.html'); i=idx.read_text()
if i.count('2026.09.06.26') != 8: raise SystemExit('Unexpected index .26 reference count')
idx.write_text(i.replace('2026.09.06.26','2026.09.06.27'))
