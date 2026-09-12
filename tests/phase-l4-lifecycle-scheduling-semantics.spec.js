const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('L4: Home and campaign compact keep coalesced one-frame scheduling', () => {
  const home = source('home-layout-authority-v219.js');
  expect(home).toContain('var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync();});}');
  expect(home).toContain("window.addEventListener('sr:bottomnavrendered',schedule);");
  expect(home).toContain("window.addEventListener('resize',schedule,{passive:true});");
  expect(home).toContain("window.addEventListener('orientationchange',schedule,{passive:true});sync();");

  const modal = source('ui-stability-v83.js');
  expect(modal).toContain('let campaignCompactQueued=false;');
  expect(modal).toContain('if(campaignCompactQueued)return;');
  expect(modal).toContain('campaignCompactQueued=true;');
  expect(modal).toContain('requestAnimationFrame(function(){campaignCompactQueued=false;syncCampaignCompact();});');
  expect(modal).toContain("window.addEventListener('sr:bottomnavrendered',scheduleCampaignCompact);");
  expect(modal).toContain('syncCampaignCompact();');
});

test('L4: Weekly Mega keeps a non-coalesced one-frame post-render injection', () => {
  const weekly = source('weekly-mega-v71.js');
  expect(weekly).toContain('function queueInject(){requestAnimationFrame(inject);}');
  expect(weekly).toContain("window.addEventListener('sr:bottomnavrendered',queueInject);");
  expect(weekly).not.toContain('queueInjectQueued');
});

test('L4: Social keeps trigger-specific scheduling semantics', () => {
  const social = source('social-v1.js');
  expect(social).toContain('function syncSocialLayout(){requestAnimationFrame(()=>{mountButton();dockSocialUI();});}');
  expect(social).toContain('window.addEventListener("resize",dockSocialUI,{passive:true});');
  expect(social).toContain('window.addEventListener("orientationchange",()=>setTimeout(dockSocialUI,120),{passive:true});');
  expect(social).toContain('window.addEventListener("sr:bottomnavrendered",syncSocialLayout);');
});
