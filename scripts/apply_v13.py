from pathlib import Path

# Reorder the unified Equipment screen and keep the combat comparison visible
# while the player scrolls through stored equipment.
p = Path('game-4.js')
s = p.read_text()

start_old = '''  return topbar("Équipement", '<span class="pill">'+S.inventory.length+' objets</span>') + '<div class="pad mt6">' +\n    '<div class="card frame"><div class="between"><div><div class="mute tiny b">PUISSANCE TOTALE</div><div class="bb gt" style="font-size:22px">'+fmt(S.power)+'</div></div>' +\n'''
start_new = '''  return topbar("Équipement", '<span class="pill">'+S.inventory.length+' objets</span>') + '<div class="pad mt6">' +\n    '<div class="sect" style="margin:4px 0 6px">Équipement porté</div><div class="slotGrid">'+cells+'</div>' +\n    (hasPreview ? '<div class="notice mt8"><div class="between"><span><b style="color:#78B7FF">Mode test :</b> '+previewItems.length+' pièce'+(previewItems.length>1?'s':'')+'</span><span class="row gap4">'+btn("Annuler",{small:true,cls:"ghost",act:"clearEquipPreview"})+btn("Équiper le set",{small:true,cls:"green",act:"equipPreviewSet"})+'</span></div><div class="mute tiny mt4">Tu peux tester une pièce par emplacement avant de valider tout le set.</div></div>' : '') +\n    '<div class="equipCompareSticky">' +\n    '<div class="card frame"><div class="between"><div><div class="mute tiny b">PUISSANCE TOTALE</div><div class="bb gt" style="font-size:22px">'+fmt(S.power)+'</div></div>' +\n'''
if start_old not in s:
    raise SystemExit('equipment return start not found')
s = s.replace(start_old, start_new, 1)

old_mid = '''    '<details class="equipStatsMore"'+(hasPreview && stats.slice(8).some(x=>String(x[1])!==String(x[2]))?' open':'')+'><summary>Voir toutes les statistiques</summary><div class="row" style="flex-wrap:wrap">'+stats.slice(8).map(x=>statCell(...x)).join('')+'</div></details></div>' +\n    '<div class="sect" style="margin:10px 0 6px">Équipement porté</div><div class="slotGrid">'+cells+'</div>' +\n    (hasPreview ? '<div class="notice mt8"><div class="between"><span><b style="color:#78B7FF">Mode test :</b> '+previewItems.length+' pièce'+(previewItems.length>1?'s':'')+'</span><span class="row gap4">'+btn("Annuler",{small:true,cls:"ghost",act:"clearEquipPreview"})+btn("Équiper le set",{small:true,cls:"green",act:"equipPreviewSet"})+'</span></div><div class="mute tiny mt4">Tu peux tester une pièce par emplacement avant de valider tout le set.</div></div>' : '') +\n    '<div class="sect" style="margin:16px 0 8px">Inventaire</div><div class="seg">'+filters.map((f)=>'<span class="'+(invFilter===f?'on':'')+'" data-act="invFilter" data-arg="'+f+'">'+(f==='ALL'?'Tout':SLOT_LABEL[f])+'</span>').join('')+'</div>' +\n'''
new_mid = '''    '<details class="equipStatsMore"'+(hasPreview && stats.slice(8).some(x=>String(x[1])!==String(x[2]))?' open':'')+'><summary>Voir toutes les statistiques</summary><div class="row" style="flex-wrap:wrap">'+stats.slice(8).map(x=>statCell(...x)).join('')+'</div></details></div></div>' +\n    '<div class="sect" style="margin:14px 0 8px">Équipements stockés</div><div class="seg">'+filters.map((f)=>'<span class="'+(invFilter===f?'on':'')+'" data-act="invFilter" data-arg="'+f+'">'+(f==='ALL'?'Tout':SLOT_LABEL[f])+'</span>').join('')+'</div>' +\n'''
if old_mid not in s:
    raise SystemExit('equipment middle block not found')
s = s.replace(old_mid, new_mid, 1)
p.write_text(s)

# Sticky comparison panel. It sticks inside #screen, so inventory length no longer
# determines whether the player can keep current/test stats in view.
p = Path('style.css')
css = p.read_text()
marker = '/* v13 equipment sticky comparison */'
if marker not in css:
    css += '''\n\n/* v13 equipment sticky comparison */\n.equipCompareSticky{\n  position:sticky;top:0;z-index:18;margin:8px -4px 0;padding:4px 4px 6px;\n  background:linear-gradient(180deg,#0B111Ff2 0%,#0B111Fec 82%,#0B111F00 100%);\n  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:12px;\n}\n.equipCompareSticky>.sect{margin-top:8px!important}\n@media(max-height:700px){\n  .equipCompareSticky{padding-bottom:4px}\n  .equipCompareSticky .card{padding-top:6px;padding-bottom:6px}\n}\n'''
    p.write_text(css)

# Build bump + cache busting.
p = Path('game-2.js')
t = p.read_text()
if '2026.09.06.12' not in t:
    raise SystemExit('APP_BUILD .12 missing')
p.write_text(t.replace('2026.09.06.12', '2026.09.06.13', 1))

p = Path('index.html')
t = p.read_text()
if '2026.09.06.12' not in t:
    raise SystemExit('index build .12 missing')
p.write_text(t.replace('2026.09.06.12', '2026.09.06.13'))
