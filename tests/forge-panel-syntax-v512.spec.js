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
assert.ok(html.includes('PAUSED_SANCTUARY'), 'Sanctuary pause must remain in place');
console.log('V512 Forge panel: JavaScript syntax, script version and Sanctuary pause verified.');
