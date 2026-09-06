from pathlib import Path
import re

BUILD_NEW='2026.09.06.50'
p=Path('social-v1.js')
s=p.read_text()

# Compact translucent combat chat. Keep the current social logic intact.
s=s.replace('// CHAT_ARENA_OVERLAY_V48','// CHAT_ARENA_OVERLAY_V48\n// CHAT_COMPACT_OVERLAY_V50',1)
s=s.replace('background:rgba(7,11,19,.66);border:1px solid rgba(74,100,148,.72);border-radius:14px;box-shadow:0 10px 30px #0007;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);overflow:hidden',
            'background:rgba(7,11,19,.36);border:1px solid rgba(111,151,210,.58);border-radius:13px;box-shadow:0 8px 22px #0005;overflow:hidden',1)
s=s.replace('background:rgba(16,26,44,.62);display:flex', 'background:rgba(16,26,44,.40);display:flex',1)
s=s.replace('background:rgba(11,17,31,.54);border-bottom', 'background:rgba(11,17,31,.32);border-bottom',1)
s=s.replace('background:rgba(23,36,59,.78);color:#FBDD8C', 'background:rgba(23,36,59,.48);color:#FBDD8C',1)
s=s.replace('background:rgba(8,13,24,.24);border-radius:7px', 'background:rgba(8,13,24,.12);border-radius:7px',1)
s=s.replace('background:rgba(16,26,44,.68);border-top', 'background:rgba(16,26,44,.42);border-top',1)
s=s.replace('background:#080D18;color:white', 'background:rgba(8,13,24,.58);color:white',1)

old='''      if(ar){\n        const left=Math.max(6,Math.min(app.clientWidth-b.offsetWidth-6,ar.right-ap.left-b.offsetWidth+4));\n        const top=Math.max(8,ar.top-ap.top+12);\n        b.style.left=left+"px";b.style.top=top+"px";b.style.right="auto";b.style.bottom="auto";\n      }else{b.style.left="auto";b.style.top="66px";b.style.right="10px";b.style.bottom="auto";}\n'''
new='''      if(ar){\n        // Sit on the arena's outer edge instead of floating over Forge/content.\n        const desired=ar.right-ap.left-b.offsetWidth*.46;\n        const left=Math.max(6,Math.min(app.clientWidth-b.offsetWidth-4,desired));\n        const top=Math.max(8,ar.top-ap.top+14);\n        b.style.left=left+"px";b.style.top=top+"px";b.style.right="auto";b.style.bottom="auto";\n      }else{b.style.left="auto";b.style.top="66px";b.style.right="10px";b.style.bottom="auto";}\n'''
if old not in s: raise SystemExit('button docking block missing')
s=s.replace(old,new,1)

old='''      if(ar){\n        const margin=7, left=Math.max(margin,ar.left-ap.left+margin), top=Math.max(margin,ar.top-ap.top+margin);\n        const width=Math.max(240,Math.min(app.clientWidth-left-margin,ar.width-margin*2));\n        const height=Math.max(210,Math.min(286,ar.height-margin*2));\n        root.style.left=left+"px";root.style.top=top+"px";root.style.right="auto";root.style.bottom="auto";root.style.width=width+"px";root.style.height=height+"px";\n      }else{\n        root.style.left="10px";root.style.right="10px";root.style.top="72px";root.style.bottom="72px";root.style.width="auto";root.style.height="auto";\n      }\n'''
new='''      if(ar){\n        const margin=7, top=Math.max(margin,ar.top-ap.top+margin);\n        // About 72% of the arena width, anchored to its right edge.\n        const width=Math.max(220,Math.min(310,ar.width*.72));\n        const desiredLeft=ar.right-ap.left-width-margin;\n        const left=Math.max(margin,Math.min(app.clientWidth-width-margin,desiredLeft));\n        const height=Math.max(205,Math.min(268,ar.height-margin*2));\n        root.style.left=left+"px";root.style.top=top+"px";root.style.right="auto";root.style.bottom="auto";root.style.width=width+"px";root.style.height=height+"px";\n      }else{\n        // Outside campaign, stay compact rather than becoming a near-full-screen sheet.\n        const width=Math.max(220,Math.min(310,app.clientWidth-20));\n        root.style.left="auto";root.style.right="10px";root.style.top="72px";root.style.bottom="auto";root.style.width=width+"px";root.style.height=Math.min(360,Math.max(240,app.clientHeight-160))+"px";\n      }\n'''
if old not in s: raise SystemExit('panel docking block missing')
s=s.replace(old,new,1)
p.write_text(s)

# Normalize visible/cache build without touching save version.
for name in ['game-2.js','index.html']:
    q=Path(name); t=q.read_text()
    t=re.sub(r'2026\\.09\\.06\\.\\d+',BUILD_NEW,t)
    q.write_text(t)

print('chat compact overlay v50 applied')
