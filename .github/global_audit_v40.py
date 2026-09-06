from pathlib import Path
import re, os, collections

files={p:Path(p).read_text() for p in ['game-1.js','game-2.js','game-3.js','game-4.js','game-5.js','audio-v26.js','style.css','index.html']}
alljs='\n'.join(files[p] for p in ['game-1.js','game-2.js','game-3.js','game-4.js','game-5.js','audio-v26.js'])

print('=== SHADOWREACH GLOBAL AUDIT V40 ===')

# 1) Syntax-adjacent suspicious output fragments
sus=[]
for name,text in files.items():
    for pat,label in [(r'\\/>"', 'SVG self-close followed by stray quote'), (r'nav\(["\']familier["\']\)', 'singular familiers route')]:
        for m in re.finditer(pat,text):
            sus.append((name,label,text.count('\n',0,m.start())+1,m.group(0)))
print('Suspicious fragments:', len(sus))
for x in sus: print(' ',x)

# 2) Screen routes and literal nav()/go targets
m=re.search(r'const\s+SCREENS\s*=\s*\{(.*?)\n\};', files['game-5.js'], re.S)
screens=set()
if m:
    body=m.group(1)
    screens.update(re.findall(r'(?m)^\s*([A-Za-zÀ-ÿ_][\wÀ-ÿ]*)\s*:', body))
print('Screens:', sorted(screens))
nav_targets=set(re.findall(r'\bnav\(\s*["\']([^"\']+)["\']\s*\)', alljs))
go_targets=set(re.findall(r'\bgo\s*:\s*["\']([^"\']+)["\']', alljs))
unknown=sorted((nav_targets|go_targets)-screens)
print('Literal route targets:', sorted(nav_targets|go_targets))
print('Unknown literal routes:', unknown)

# 3) data-act literals versus ACT handlers
actm=re.search(r'const\s+ACT\s*=\s*\{(.*?)(?:\n\};)', files['game-5.js'], re.S)
handlers=set()
if actm:
    handlers.update(re.findall(r'(?m)^\s*([A-Za-z_$][\w$]*)\s*:', actm.group(1)))
refs=set(re.findall(r'data-act=\\?["\']([A-Za-z_$][\w$]*)', alljs))
missing=sorted(refs-handlers)
print('ACT handlers:', len(handlers), 'literal refs:', len(refs), 'missing handlers:', missing)

# 4) Asset declarations -> existing files
am=re.search(r'const\s+ASSETS\s*=\s*\{(.*?)\n\};', files['game-1.js'], re.S)
asset_missing=[]; asset_dupes=[]
if am:
    pairs=re.findall(r'(?m)^\s*([A-Za-z0-9_]+)\s*:\s*["\']([^"\']+)["\']', am.group(1))
    counts=collections.Counter(k for k,_ in pairs)
    asset_dupes=sorted(k for k,v in counts.items() if v>1)
    for k,p in pairs:
        if not Path(p).exists(): asset_missing.append((k,p))
print('Duplicate asset keys:', asset_dupes)
print('Missing asset files:', len(asset_missing))
for x in asset_missing[:50]: print(' ',x)

# 5) Duplicate top-level function declarations can overwrite previous logic.
funcs=re.findall(r'(?m)^function\s+([A-Za-z_$][\w$]*)\s*\(', alljs)
fd=collections.Counter(funcs)
dup_funcs=sorted((k,v) for k,v in fd.items() if v>1)
print('Duplicate function declarations:', dup_funcs)

# 6) Build consistency
builds={}
for p in ['index.html','game-2.js']:
    builds[p]=sorted(set(re.findall(r'2026\.09\.06\.\d+', files[p])))
print('Build refs:',builds)

# 7) Current design invariants
checks={
 '3 active skill slots': 'SKILL_SLOTS_BASE: 3' in files['game-1.js'],
 'arena stability v36': 'ARENA_STABILITY_V36' in files['game-3.js'],
 'sanctuary drag merge': 'SANCTUARY_DRAG_MERGE_V34' in files['game-5.js'],
 'sanctuary refund v35': 'SANCTUARY_GOLD_REBASE_V35' in files['game-1.js'],
 'campaign world navigation': 'CAMPAIGN_WORLD_NAV_V37' in files['game-4.js'],
 'rebirth in world': 'worldRebirth' in files['game-4.js'],
}
print('Invariants:',checks)

print('=== END AUDIT ===')
