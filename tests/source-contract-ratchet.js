/* Run Node-only historical source contracts in both revisions.
   Do not silently drop them when separating them from Playwright discovery. */
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { classify } = require('./spec-kind');

const [baseArg, currentArg] = process.argv.slice(2);
if (!baseArg || !currentArg) {
  console.error('Usage: node tests/source-contract-ratchet.js <baseline-root> <current-root>');
  process.exit(2);
}

function check(rootArg, label) {
  const root = path.resolve(rootArg);
  const files = classify(root).sourceContracts;
  if (!files.length) throw new Error(label + ': no Node-only source contracts discovered');
  const failures = new Map();
  for (const name of files) {
    const result = spawnSync(process.execPath, [path.join('tests', name)], {
      cwd: root, encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024
    });
    if (result.error || result.status !== 0) {
      const output = String(result.stderr || '') + '\n' + String(result.stdout || '');
      const first = output.match(/(?:AssertionError[^\n]*|Error: [^\n]*|SyntaxError: [^\n]*)/);
      const reason = result.error ? String(result.error.message) :
        first ? first[0].trim() : 'exit ' + result.status;
      failures.set(name, reason);
    }
  }
  console.log(label + ': ' + files.length + ' source contracts, ' + failures.size + ' pre-existing/current failures');
  for (const [name, reason] of failures) console.log('- ' + name + ': ' + reason);
  return { files: new Set(files), failures };
}

const base = check(baseArg, 'Baseline');
const current = check(currentArg, 'Current');
const regressions = [];
for (const name of base.files) {
  if (!current.files.has(name)) regressions.push('Removed source contract: ' + name);
}
for (const [name, reason] of current.failures) {
  if (!base.failures.has(name)) regressions.push('New source-contract failure: ' + name + ' (' + reason + ')');
  else if (base.failures.get(name) !== reason) {
    regressions.push('Changed source-contract failure: ' + name +
      ' (baseline: ' + base.failures.get(name) + '; current: ' + reason + ')');
  }
}
if (regressions.length) {
  regressions.forEach(message => console.error(message));
  process.exit(1);
}
console.log('Source-contract ratchet passed: no new or changed failures.');
