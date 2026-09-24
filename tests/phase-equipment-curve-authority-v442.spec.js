const fs=require('fs');
const assert=require('assert');
const src=fs.readFileSync('progression-overhaul-v283.js','utf8');
const expected={COMMUN:500,PEU_COMMUN:1000,RARE:2000,EPIQUE:8000,HEROIQUE:16000,MYTHIQUE:32000,ARTEFACT:128000,LEGENDAIRE:512000,INFERNAL:2048000,IMMORTEL:8192000,DIVIN:32768000,ANCESTRAL:2048000};
for(const [rarity,value] of Object.entries(expected)) assert(src.includes(rarity+':'+value),rarity+' equipment base changed');
assert(src.includes('makeItem.__srV283=true'),'V372 equipment authority no longer owns makeItem');
assert(src.includes('version:372,equipmentBase:EQUIP_BASE'),'equipment curve authority marker missing');
console.log('V442 equipment curve authority OK');
