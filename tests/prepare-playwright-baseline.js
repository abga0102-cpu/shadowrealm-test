const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || '.phase1-base');
const file = path.join(root, 'tests', 'phase-true-reference-skills-v383.spec.js');
if (!fs.existsSync(file)) process.exit(0);

let source = fs.readFileSync(file, 'utf8');
const malformed = 'expect(game4).not.toContain(\'class="slot\' + (sealed ? " sealed" : "")\');';
const repaired = 'expect(game4).not.toContain(\`class="slot\' + (sealed ? " sealed" : "")\`);';

if (source.includes(malformed)) {
  source = source.replace(malformed, repaired);
  fs.writeFileSync(file, source);
  console.log('Prepared baseline: repaired historical V383 test syntax only.');
} else {
  console.log('Prepared baseline: no historical syntax repair needed.');
}
