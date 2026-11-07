'use strict';
// Development-only exporter. Does not alter the game or Figma automatically.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const declaration = source.match(/:root\s*\{([\s\S]*?)\}/);
if (!declaration) throw new Error('Cannot find the initial CSS :root block.');
const colors = {};
for (const match of declaration[1].matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  colors[match[1]] = match[2].toUpperCase();
}
if (!Object.keys(colors).length) throw new Error('No base CSS colors found.');
const contents = JSON.stringify({
  "$description": "Shadowreach: couleurs de la première règle :root de style.css. Ne représente pas tous les overrides CSS/JS chargés en jeu.",
  "colors": Object.fromEntries(Object.entries(colors).map(([name, hex]) =>
    [name, { "$type": "color", "$value": hex,
      "$extensions": { "com.shadowreach.cssVariable": "--" + name } }]
  ))
}, null, 2) + '\n';
const file = path.join(root, 'design', 'shadowreach-tokens.json');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== contents) {
    console.error('Design tokens are out of sync with style.css. Run: node scripts/export-design-tokens.js');
    process.exitCode = 1;
  } else {
    console.log('Design tokens match style.css (' + Object.keys(colors).length + ' base colors).');
  }
} else {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  console.log('Exported ' + Object.keys(colors).length + ' base colors to design/shadowreach-tokens.json');
}
