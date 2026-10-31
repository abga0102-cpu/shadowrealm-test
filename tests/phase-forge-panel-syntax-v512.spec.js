/* V512: Forge panel must parse and be loaded after the syntax repair. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'forge-panel-authority-v266.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.doesNotMatch(source, /\}catch\(_\)\{\}\\ntry\{/,
  'literal escaped newlines between statements break JavaScript parsing');
assert.doesNotThrow(() => new vm.Script(source, {filename:'forge-panel-authority-v266.js'}));
assert.equal((html.match(/<script[^>]+forge-panel-authority-v266\.js/g)||[]).length, 1,
  'load Forge panel authority exactly once');
assert.match(html, /forge-panel-authority-v266\.js\?v=2026\.10\.30\.512-forge-syntax/);
assert.match(html, /window\.__SHADOWREACH_SANCTUARY_PAUSED=true/);
assert.ok(source.includes('aria-label="Informations sur les raretés"'),
  'Forge rarity info accessible label must survive Home rerenders');
assert.ok(html.includes('PAUSED_SANCTUARY'), 'Sanctuary pause must remain in place');

// Exercise the actual Forge module with a synthetic UI, without touching player saves.
const insertedStyles = [];
let renderCalls = 0;
const nativeAccueil = () => '<main id="homeForge">Forge</main>';
const fakeScreen = {accueil:nativeAccueil};
const fakeHead = {appendChild(node){node.parentNode=this;insertedStyles.push(node);return node;}};
const fakeDocument = {
  head:fakeHead,
  body:{},
  createElement(tag){return {tagName:tag, parentNode:null, textContent:'', id:''};},
  getElementById(){return null;},
  addEventListener(){},
};
const runtime = {
  window:{},
  S:{forge:{}},
  SCREENS:fakeScreen,
  document:fakeDocument,
  sessionStorage:{getItem(){return null;},setItem(){}},
  render(){renderCalls++;},
};
assert.doesNotThrow(() => vm.runInNewContext(source,runtime,{filename:'forge-panel-authority-v266.js',timeout:3000}),
  'Forge module should initialize when S.forge and SCREENS.accueil are present');
assert.equal(runtime.window.__srForgePanelAuthorityV266.version,266);
assert.notEqual(fakeScreen.accueil,nativeAccueil,'Forge must wrap the home renderer');
assert.ok(insertedStyles.length>0,'Forge styles must be installed');
assert.equal(renderCalls,1,'Forge should request one initial render');
const firstWrapper=fakeScreen.accueil;
const firstStyles=insertedStyles.length;
vm.runInNewContext(source,runtime,{filename:'forge-panel-authority-v266.js',timeout:3000});
assert.equal(fakeScreen.accueil,firstWrapper,'reloading must not double-wrap the renderer');
assert.equal(insertedStyles.length,firstStyles,'reloading must not duplicate styles');

console.log('V512 Forge panel: JavaScript syntax, script version and Sanctuary pause verified.');
