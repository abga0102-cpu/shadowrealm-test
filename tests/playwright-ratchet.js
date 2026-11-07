const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

async function runSuite(rootArg, label) {
  const root = path.resolve(rootArg);
  const reportPath = path.join(root, '.phase1-playwright-ratchet.json');
  try { fs.rmSync(reportPath, { force: true }); } catch (_) {}

  // Stream child output rather than blocking the CI log for the entire suite.
  // This preserves the full baseline/current comparison and makes slow runs diagnosable.
  console.log(label + ' Playwright suite starting at ' + new Date().toISOString());
  const run = await new Promise((resolve, reject) => {
    const child = spawn(cli, ['test', '-c', 'tests/playwright.config.js', '--reporter=json'], {
      cwd: root,
      env: { ...process.env, CI: '1', PLAYWRIGHT_JSON_OUTPUT_NAME: reportPath },
      stdio: 'inherit'
    });
    child.once('error', reject);
    child.once('close', (status, signal) => resolve({ status, signal }));
  });
  console.log(label + ' Playwright suite finished at ' + new Date().toISOString() +
    ' (exit ' + run.status + (run.signal ? ', signal ' + run.signal : '') + ')');

  if (!fs.existsSync(reportPath)) {
    console.error(run.stdout || '');
    console.error(run.stderr || '');
    throw new Error(label + ' Playwright run produced no JSON report (exit ' + run.status + ')');
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  try { fs.rmSync(reportPath, { force: true }); } catch (_) {}
  const failures = collectFailures(report);
  /* A JSON report can exist even when test discovery fails. Do not report
     zero regressions if no browser tests actually ran. */
  const stats = report.stats || {};
  const executed = Number(stats.expected || 0) + Number(stats.unexpected || 0) +
    Number(stats.flaky || 0);
  if (!executed || (Array.isArray(report.errors) && report.errors.length)) {
    const errors = (report.errors || []).map(e => String(e.message || e.value || e)).slice(0, 3);
    throw new Error(label + ' Playwright suite did not execute cleanly (' +
      executed + ' tests, exit ' + run.status + '): ' + errors.join(' | '));
  }
  if (run.status !== 0 && failures.size === 0) {
    throw new Error(label + ' Playwright exited ' + run.status +
      ' but no individual failures were captured');
  }
  console.log(label + ' Playwright tests executed: ' + executed);
  console.log(label + ' Playwright failures: ' + failures.size);
  return failures;
}

async function main() {
const baseline = await runSuite(baselineArg, 'Baseline');
const current = await runSuite(currentArg, 'Current');

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

}
main().catch(error => { console.error(error); process.exitCode = 1; });
