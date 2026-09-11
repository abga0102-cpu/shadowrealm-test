const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const retired = [
  'secondary-hud-context-v274.js',
  'secondary-hud-context-v276.js',
  'secondary-hud-selective-v277.js',
  'secondary-hud-selective-v278.js',
];

for (const file of retired) {
  if (fs.existsSync(path.join(root, file))) {
    throw new Error(`${file} must remain retired from source`);
  }
  if (index.includes(file)) {
    throw new Error(`${file} must remain absent from production loading`);
  }
}

const owner = 'secondary-hud-selective-v279.js';
if (!fs.existsSync(path.join(root, owner))) {
  throw new Error(`${owner} must remain the Secondary HUD source owner`);
}
if (!index.includes(owner)) {
  throw new Error(`${owner} must remain loaded in production`);
}

console.log('Secondary HUD source retirement contract passed');
