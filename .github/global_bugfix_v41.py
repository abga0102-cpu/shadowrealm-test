from pathlib import Path

BUILD_OLD='2026.09.06.40'
BUILD_NEW='2026.09.06.41'

paths={p:Path(p) for p in ['game-2.js','game-4.js','game-5.js','social-v1.js','index.html']}
texts={p:paths[p].read_text() for p in paths}

# 1) Egg notification route: singular route did not exist in SCREENS.
g5=texts['game-5.js']
old='eggFinished: (a) => { nav("familier"); setTimeout(() => showEggFinished(a), 30); },'
new='eggFinished: (a) => { nav("familiers"); setTimeout(() => showEggFinished(a), 30); },'
if old in g5:
    g5=g5.replace(old,new,1)
elif 'nav("familier")' in g5:
    g5=g5.replace('nav("familier")','nav("familiers")')
texts['game-5.js']=g5

# 2) The Event button had a permanent badge, so the world menu always looked urgent.
# Only show it when a mission is actually ready and not yet claimed.
g4=texts['game-4.js']
old='{ label: "Événement", icon: "gift", color: "#C22127", go: "evenement", badge: true },'
new='{ label: "Événement", icon: "gift", color: "#C22127", go: "evenement", badge: (typeof eventDone === "function" && typeof EVENT_MISSIONS !== "undefined" && EVENT_MISSIONS.some((m) => eventDone(m.id) && !S.eventClaims[m.id])) },'
if old in g4:
    g4=g4.replace(old,new,1)
texts['game-4.js']=g4

# 3) Social transport: received messages must never be POSTed back to the server.
# Also keep test-bot chatter local/cross-tab, not remote, and respect the level-3 chat unlock.
s=texts['social-v1.js']
s=s.replace('function push(msg,broadcast=true){','function push(msg,broadcast=true,relay=broadcast){',1)
s=s.replace('    remoteSend(msg);\n  }','    if(relay)remoteSend(msg);\n  }',1)
s=s.replace('if(Array.isArray(a))a.forEach(m=>push(m,false));','if(Array.isArray(a))a.forEach(m=>push(m,true,false));',1)
s=s.replace('push({id:"b"+now()+Math.random().toString(36).slice(2,7),type:"text",ts:now(),author:b.name,profile:b,text,bot:true});','push({id:"b"+now()+Math.random().toString(36).slice(2,7),type:"text",ts:now(),author:b.name,profile:b,text,bot:true},true,false);',1)
s=s.replace('},false));}','},false,false));}',1)
s=s.replace('if(channel)channel.onmessage=e=>{if(e&&e.data)push(e.data,false)};','if(channel)channel.onmessage=e=>{if(e&&e.data)push(e.data,false,false)};',1)
old_mount='''  function mountButton(){\n    if(document.getElementById("srChatBtn"))return;\n    const b=document.createElement("button");b.id="srChatBtn";b.type="button";b.setAttribute("aria-label","Ouvrir le chat");b.onclick=()=>{open=true;unread=0;paintButton();render();};document.getElementById("app").appendChild(b);paintButton();\n  }'''
new_mount='''  function mountButton(){\n    const existing=document.getElementById("srChatBtn");\n    let unlocked=true;\n    try{unlocked=typeof RULES==="undefined"||typeof S==="undefined"||Number(S.level||1)>=Number(RULES.CHAT_UNLOCK_LEVEL||3)}catch(_){unlocked=true}\n    if(!unlocked){if(existing)existing.remove();return;}\n    if(existing){paintButton();return;}\n    const b=document.createElement("button");b.id="srChatBtn";b.type="button";b.setAttribute("aria-label","Ouvrir le chat");b.onclick=()=>{open=true;unread=0;paintButton();render();};document.getElementById("app").appendChild(b);paintButton();\n  }'''
if old_mount in s:
    s=s.replace(old_mount,new_mount,1)
# Ensure a level-up can reveal the button without reloading.
s=s.replace('  setInterval(()=>{remotePull();if(now()-lastBotAt>45000+Math.random()*90000&&Math.random()<.35)botSpeak();},15000);',
'''  setInterval(()=>{mountButton();},1000);\n  setInterval(()=>{remotePull();if(now()-lastBotAt>45000+Math.random()*90000&&Math.random()<.35)botSpeak();},15000);''',1)
texts['social-v1.js']=s

# 4) Build/cache consistency. The social build had index at .40 while the engine fallback was still .39.
for p in ['game-2.js','index.html']:
    t=texts[p]
    # Upgrade any immediately previous build references to one coherent build.
    t=t.replace('2026.09.06.39',BUILD_NEW).replace(BUILD_OLD,BUILD_NEW)
    texts[p]=t

# Cache-bust every loaded JS/CSS in index consistently, including social-v1.
idx=texts['index.html']
for old in ['2026.09.06.39','2026.09.06.40']:
    idx=idx.replace(old,BUILD_NEW)
idx=idx.replace('<!-- Chat social · build '+BUILD_NEW+' -->','<!-- Correctifs globaux · build '+BUILD_NEW+' -->')
texts['index.html']=idx

# Marker for future regression audits.
texts['game-5.js']='// GLOBAL_BUGFIX_V41\n'+texts['game-5.js'] if 'GLOBAL_BUGFIX_V41' not in texts['game-5.js'] else texts['game-5.js']

# Assertions: do not silently publish a partial fix.
assert 'nav("familier")' not in texts['game-5.js']
assert 'nav("familiers")' in texts['game-5.js']
assert 'badge: true },' not in texts['game-4.js'][texts['game-4.js'].find('const sysBtns'):texts['game-4.js'].find('const tile')]
assert 'function push(msg,broadcast=true,relay=broadcast)' in texts['social-v1.js']
assert 'if(relay)remoteSend(msg);' in texts['social-v1.js']
assert 'push(m,true,false)' in texts['social-v1.js']
assert 'CHAT_UNLOCK_LEVEL' in texts['social-v1.js']
assert BUILD_NEW in texts['game-2.js'] and BUILD_NEW in texts['index.html']
assert BUILD_OLD not in texts['index.html']

for p,t in texts.items():
    paths[p].write_text(t)
print('Global bugfix v41 applied')
