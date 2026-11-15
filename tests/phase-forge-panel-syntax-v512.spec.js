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


// The scroll observer must only restore a newly inserted Home Forge panel.
// This isolates DOM behavior with synthetic state, without writing a player save.
let onMutation;
let onScroll;
const queuedFrames = [];
const parentScroller = { scrollTop: 77 };
let currentForge = { id: 'homeForge', scrollTop: 44, closest(){return parentScroller;} };
const observerDocument = {
  head: { appendChild(node){return node;} },
  body: {},
  createElement(tag){return {tagName:tag, textContent:'', id:''};},
  getElementById(id){return id === 'screen' ? {} : id === 'homeForge' ? currentForge : null;},
  addEventListener(type, listener){if(type === 'scroll')onScroll=listener;},
};
const observerRuntime = {
  window: {},
  S: {forge:{}},
  SCREENS: {accueil:nativeAccueil},
  document:observerDocument,
  route:'accueil',
  sessionStorage:{getItem(){return null;},setItem(){}},
  MutationObserver: class {
    constructor(callback){onMutation=callback;}
    observe(){}
  },
  requestAnimationFrame(callback){queuedFrames.push(callback);},
  render(){},
};
vm.runInNewContext(source,observerRuntime,{filename:'forge-panel-authority-v266.js',timeout:3000});
assert.equal(typeof onMutation,'function');
assert.equal(typeof onScroll,'function');
onScroll({target:currentForge});
onScroll({target:{scrollTop:77,matches(selector){return selector === '#screen.fixed>.pad.mt4';}}});
observerRuntime.route='equipement';
currentForge=null;
onScroll({target:{scrollTop:999,matches(){return true;}}});
onMutation([{addedNodes:[{querySelector(){return null;}}]}]);
assert.equal(queuedFrames.length,0,'other routes must not schedule Forge restoration');
observerRuntime.route='accueil';
currentForge={id:'homeForge',scrollTop:0,closest(){return parentScroller;}};
parentScroller.scrollTop=0;
onMutation([{addedNodes:[{querySelector(){return null;}}]}]);
assert.equal(queuedFrames.length,0,'unrelated Home mutations must not restore Forge scroll');
onMutation([{addedNodes:[{querySelector(selector){return selector === '#homeForge' ? currentForge : null;}}]}]);
assert.equal(queuedFrames.length,1,'new Home Forge insertion should schedule restoration once');
onMutation([{addedNodes:[{id:'homeForge'}]}]);
assert.equal(queuedFrames.length,1,'multiple insertions in one frame must be coalesced');
queuedFrames.shift()();
assert.equal(currentForge.scrollTop,44,'Forge panel should regain its previous scroll');
assert.equal(parentScroller.scrollTop,77,'Home parent should regain its previous scroll');
currentForge.scrollTop=0;
onMutation([{addedNodes:[{id:'homeForge'}]}]);
observerRuntime.route='parametres';
queuedFrames.shift()();
assert.equal(currentForge.scrollTop,0,'pending restoration must not run after navigation away');
console.log('V512 Forge scroll observer: Home-only insertion and scroll preservation verified.');
