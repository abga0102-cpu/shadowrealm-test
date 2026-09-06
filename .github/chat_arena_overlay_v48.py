from pathlib import Path

BUILD_OLD='2026.09.06.47'
BUILD_NEW='2026.09.06.48'

p=Path('social-v1.js')
s=p.read_text()

s=s.replace('#srChatBtn{position:absolute;right:12px;bottom:74px;z-index:70;width:52px;height:52px;border-radius:50%;border:2px solid #0A1020;background:linear-gradient(#5FB4F5,#1E72C8);color:white;font-weight:900;box-shadow:0 4px 0 #0A1020,0 8px 18px #0008;cursor:pointer}',
'''#srChatBtn{position:absolute;z-index:95;width:44px;height:44px;border-radius:50%;border:2px solid #0A1020;background:linear-gradient(#5FB4F5,#1E72C8);color:white;font-weight:900;box-shadow:0 3px 0 #0A1020,0 6px 14px #0007;cursor:pointer;transition:left .16s ease,top .16s ease}''')

s=s.replace('#srSocial{position:absolute;inset:0;z-index:120;background:#070B13f5;display:flex;flex-direction:column;color:#EDF1FA;font-family:var(--fu,system-ui)}',
'''#srSocial{position:absolute;z-index:120;display:flex;flex-direction:column;color:#EDF1FA;font-family:var(--fu,system-ui);background:rgba(7,11,19,.66);border:1px solid rgba(74,100,148,.72);border-radius:14px;box-shadow:0 10px 30px #0007;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);overflow:hidden}''')

s=s.replace('#srSocial .head{padding:10px 12px 8px;border-bottom:1px solid #2E4269;background:#101A2C;display:flex;align-items:center;gap:8px}',
'''#srSocial .head{padding:8px 10px 6px;border-bottom:1px solid rgba(46,66,105,.72);background:rgba(16,26,44,.62);display:flex;align-items:center;gap:8px}''')
s=s.replace('.srTabs{display:flex;background:#0B111F;border-bottom:1px solid #2E4269;padding:6px 7px 0;gap:4px}',
'''.srTabs{display:flex;background:rgba(11,17,31,.54);border-bottom:1px solid rgba(46,66,105,.68);padding:4px 6px 0;gap:4px}''')
s=s.replace('.srTab.on{background:#17243B;color:#FBDD8C;border-color:#2E4269}',
'''.srTab.on{background:rgba(23,36,59,.78);color:#FBDD8C;border-color:#2E4269}''')
s=s.replace('.srMessages{flex:1;overflow:auto;padding:8px 10px 84px}',
'''.srMessages{flex:1;overflow:auto;padding:6px 8px 58px;overscroll-behavior:contain}''')
s=s.replace('.srMsg{padding:7px 8px;margin:0 0 5px;border-bottom:1px solid #1E2C49}',
'''.srMsg{padding:6px 7px;margin:0 0 4px;border-bottom:1px solid rgba(30,44,73,.65);background:rgba(8,13,24,.24);border-radius:7px}''')
s=s.replace('.srCompose{position:absolute;left:0;right:0;bottom:0;padding:8px;background:#101A2C;border-top:1px solid #2E4269;display:flex;gap:6px}',
'''.srCompose{position:absolute;left:0;right:0;bottom:0;padding:6px;background:rgba(16,26,44,.68);border-top:1px solid rgba(46,66,105,.72);display:flex;gap:5px}''')

anchor='''  function paintButton(){const b=document.getElementById("srChatBtn");if(!b)return;b.innerHTML="💬"+(unread?"<b>"+Math.min(99,unread)+"</b>":"");}\n'''
insert='''  function dockSocialUI(){\n    const app=document.getElementById("app"), arena=document.querySelector(".campaignWorld");\n    const b=document.getElementById("srChatBtn"), root=document.getElementById("srSocial");\n    if(!app)return;\n    const ar=arena?arena.getBoundingClientRect():null, ap=app.getBoundingClientRect();\n    if(b){\n      if(ar){\n        const left=Math.max(6,Math.min(app.clientWidth-b.offsetWidth-6,ar.right-ap.left-b.offsetWidth+4));\n        const top=Math.max(8,ar.top-ap.top+12);\n        b.style.left=left+"px";b.style.top=top+"px";b.style.right="auto";b.style.bottom="auto";\n      }else{b.style.left="auto";b.style.top="66px";b.style.right="10px";b.style.bottom="auto";}\n    }\n    if(root){\n      if(ar){\n        const margin=7, left=Math.max(margin,ar.left-ap.left+margin), top=Math.max(margin,ar.top-ap.top+margin);\n        const width=Math.max(240,Math.min(app.clientWidth-left-margin,ar.width-margin*2));\n        const height=Math.max(210,Math.min(286,ar.height-margin*2));\n        root.style.left=left+"px";root.style.top=top+"px";root.style.right="auto";root.style.bottom="auto";root.style.width=width+"px";root.style.height=height+"px";\n      }else{\n        root.style.left="10px";root.style.right="10px";root.style.top="72px";root.style.bottom="72px";root.style.width="auto";root.style.height="auto";\n      }\n    }\n  }\n'''
if anchor not in s: raise SystemExit('paintButton anchor missing')
s=s.replace(anchor,anchor+insert,1)

old='''    const b=document.createElement("button");b.id="srChatBtn";b.type="button";b.setAttribute("aria-label","Ouvrir le chat");b.onclick=()=>{open=true;unread=0;paintButton();render();};document.getElementById("app").appendChild(b);paintButton();\n'''
new='''    const b=document.createElement("button");b.id="srChatBtn";b.type="button";b.setAttribute("aria-label","Ouvrir le chat");b.onclick=()=>{open=true;unread=0;paintButton();render();};document.getElementById("app").appendChild(b);paintButton();dockSocialUI();\n'''
if old not in s: raise SystemExit('mount button anchor missing')
s=s.replace(old,new,1)

old2='''    const list=root.querySelector('.srMessages');if(list)list.scrollTop=list.scrollHeight;\n  }\n'''
new2='''    const list=root.querySelector('.srMessages');if(list)list.scrollTop=list.scrollHeight;\n    dockSocialUI();\n  }\n'''
if old2 not in s: raise SystemExit('render tail missing')
s=s.replace(old2,new2,1)

# Keep the chat docked beside the arena after home re-renders / orientation changes.
needle='''  seed();injectStyle();mountButton();remotePull();\n})();\n'''
repl='''  seed();injectStyle();mountButton();remotePull();\n  window.addEventListener("resize",dockSocialUI,{passive:true});\n  window.addEventListener("orientationchange",()=>setTimeout(dockSocialUI,120),{passive:true});\n  const dockObserver=new MutationObserver(()=>requestAnimationFrame(()=>{mountButton();dockSocialUI();}));\n  const dockTarget=document.getElementById("screen")||document.getElementById("app");\n  if(dockTarget)dockObserver.observe(dockTarget,{childList:true,subtree:false});\n})();\n'''
if needle not in s: raise SystemExit('boot tail missing')
s=s.replace(needle,repl,1)
s='// CHAT_ARENA_OVERLAY_V48\n'+s
p.write_text(s)

for name in ['game-2.js','index.html']:
    q=Path(name); t=q.read_text()
    # index may have newer social-only build while game2 fallback lags. Normalize both to v48.
    import re
    t=re.sub(r'2026\.09\.06\.\d+',BUILD_NEW,t)
    q.write_text(t)

print('chat arena overlay v48 applied')
