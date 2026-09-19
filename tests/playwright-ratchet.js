const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const [baselineArg, currentArg] = process.argv.slice(2);
if (!baselineArg || !currentArg) {
  console.error('Usage: node tests/playwright-ratchet.js <baseline-root> <current-root>');
  process.exit(2);
}

const currentRoot = path.resolve(currentArg);
const cli = path.join(currentRoot, 'node_modules', '.bin', 'playwright');

function collectFailures(report) {
  const failed = new Set();
  function walk(suites, parents) {
    for (const suite of suites || []) {
      const next = suite.title ? parents.concat(suite.title) : parents;
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const bad = test.status === 'unexpected' ||
            (test.results || []).some(r => ['failed','timedOut','interrupted'].includes(r.status));
          if (!bad) continue;
          const file = String(spec.file || suite.file || '')
            .replace(/\\/g, '/')
            .replace(/^.*\/tests\//, 'tests/');
          const title = next.concat(spec.title || '').filter(Boolean).join(' › ');
          failed.add(file + ' :: ' + String(test.projectName || '') + ' :: ' + title);
        }
      }
      walk(suite.suites || [], next);
    }
  }
  walk(report.suites || [], []);
  return failed;
}

function runSuite(rootArg, label) {
  const root = path.resolve(rootArg);
  const reportPath = path.join(root, '.phase1-playwright-ratchet.json');
  try { fs.rmSync(reportPath, { force: true }); } catch (_) {}

  const run = spawnSync(cli, ['test', '-c', 'tests/playwright.config.js', '--reporter=json'], {
    cwd: root,
    env: { ...process.env, CI: '1', PLAYWRIGHT_JSON_OUTPUT_NAME: reportPath },
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024
  });

  if (!fs.existsSync(reportPath)) {
    console.error(run.stdout || '');
    console.error(run.stderr || '');
    throw new Error(label + ' Playwright run produced no JSON report (exit ' + run.status + ')');
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  try { fs.rmSync(reportPath, { force: true }); } catch (_) {}
  const failures = collectFailures(report);
  console.log(label + ' Playwright failures: ' + failures.size);
  return failures;
}

const baseline = runSuite(baselineArg, 'Baseline');
const current = runSuite(currentArg, 'Current');

const added = [...current].filter(id => !baseline.has(id)).sort();
const fixed = [...baseline].filter(id => !current.has(id)).sort();

if (fixed.length) {
  console.log('Resolved baseline failures (' + fixed.length + '):');
  fixed.forEach(id => console.log('- ' + id));
}

if (added.length) {
  console.error('New Playwright regressions (' + added.length + '):');
  added.forEach(id => console.error('- ' + id));
  process.exit(1);
}

console.log('Playwright ratchet passed: ' + baseline.size + ' -> ' + current.size + ' failures, no new regression.');
