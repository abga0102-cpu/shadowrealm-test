const fs = require('fs');
const path = 'index.html';
const from = 'raid-minerai-active-balance-v282.js?v=2026.09.10.282';
const to = 'raid-minerai-active-balance-v282.js?v=2026.09.15.323';
let html = fs.readFileSync(path, 'utf8');
if (!html.includes(to)) {
  if (!html.includes(from)) throw new Error('Minerai cache-key anchor not found');
  html = html.replace(from, to);
  fs.writeFileSync(path, html);
}
