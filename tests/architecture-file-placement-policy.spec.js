const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const guardPath = path.join(root, 'tests', 'architecture-file-placement-guard.js');

function makeFixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'shadowreach-arch-'));
  const base = path.join(temp, 'base');
  const current = path.join(temp, 'current');
  fs.mkdirSync(base);
  fs.mkdirSync(current);
  fs.writeFileSync(path.join(base, 'existing-owner.js'), '// canonical owner\n');
  fs.writeFileSync(path.join(current, 'existing-owner.js'), '// canonical owner updated\n');
  fs.writeFileSync(path.join(base, 'ARCHITECTURE.md'), 'Owners: `existing-owner.js`\n');
  fs.writeFileSync(path.join(current, 'ARCHITECTURE.md'), 'Owners: `existing-owner.js`\n');
  return { temp, base, current };
}

function runGuard(base, current, options = {}) {
  const {
    body = '',
    event = 'pull_request',
    mergedViaPr = false,
    bodyFile = '',
  } = options;
  return spawnSync(process.execPath, [guardPath, base, current], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PR_BODY: body,
      PR_BODY_FILE: bodyFile,
      CHANGE_EVENT: event,
      ARCH_MERGED_VIA_PR: mergedViaPr ? '1' : '0',
    },
  });
}

function approvedBody(file, versionedException = 'n/a') {
  return [
    '- Existing canonical owner considered: `existing-owner.js` — adjacent responsibility reviewed',
    `- New production \`.js\` files: \`${file}\``,
    '- Why existing owner cannot safely contain this code: The new module owns a durable independent lifecycle and would make the existing owner incoherent.',
    '- `ARCHITECTURE.md` owner entry added/updated: yes',
    `- Versioned filename exception: ${versionedException}`,
  ].join('\n');
}

test('architecture-first production file placement remains mandatory and CI-enforced', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Repository policy is engine-independent.');

  const agents = source('AGENTS.md');
  const architecture = source('ARCHITECTURE.md');
  const template = source('.github/pull_request_template.md');
  const workflow = source('.github/workflows/phase-1-ci.yml');
  const guard = source('tests/architecture-file-placement-guard.js');

  expect(agents).toContain('## Architecture-first code placement — mandatory');
  expect(agents).toContain('Do not create a new production JavaScript file merely because it is convenient.');
  expect(agents).toContain('New version-suffixed patch files such as `*-v123.js` are prohibited by default.');

  expect(architecture).toContain('## Architecture-first file placement');
  expect(architecture).toContain('Existing owners are extended before new production modules are introduced.');
  expect(architecture).toContain('A new production module is therefore an **architecture exception**');

  expect(template).toContain('## Architecture / file placement');
  expect(template).toContain('- Existing canonical owner considered:');
  expect(template).toContain('- New production `.js` files: none');
  expect(template).toContain('- Why existing owner cannot safely contain this code: n/a');
  expect(template).toContain('- `ARCHITECTURE.md` owner entry added/updated: n/a');
  expect(template).toContain('- Versioned filename exception: n/a');

  expect(workflow).toContain('pull-requests: read');
  expect(workflow).toContain('- name: Resolve merged PR architecture context');
  expect(workflow).toContain('commits/${GITHUB_SHA}/pulls');
  expect(workflow).toContain('PR_BODY_FILE:');
  expect(workflow).toContain('- name: Enforce architecture-first file placement');
  expect(workflow).toContain('node tests/architecture-file-placement-guard.js .phase1-base .');
  expect(guard).toContain('ARCHITECTURE.md must register the new canonical owner');
  expect(guard).toContain('Direct pushes that introduce production JavaScript are forbidden');
  expect(guard).toContain('Versioned filename exception: yes — <reason>');
});

test('file-placement guard permits normal edits without creating a production module', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Repository policy is engine-independent.');
  const fixture = makeFixture();
  try {
    const result = runGuard(fixture.base, fixture.current);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('no new production JavaScript files');
  } finally {
    fs.rmSync(fixture.temp, { recursive: true, force: true });
  }
});

test('file-placement guard admits a justified durable owner and rejects an unjustified versioned patch', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Repository policy is engine-independent.');

  const approved = makeFixture();
  try {
    fs.writeFileSync(path.join(approved.current, 'durable-owner.js'), '// new durable owner\n');
    fs.appendFileSync(path.join(approved.current, 'ARCHITECTURE.md'), 'New area: `durable-owner.js`\n');
    const result = runGuard(approved.base, approved.current, { body: approvedBody('durable-owner.js') });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('passed for: durable-owner.js');
  } finally {
    fs.rmSync(approved.temp, { recursive: true, force: true });
  }

  const versioned = makeFixture();
  try {
    fs.writeFileSync(path.join(versioned.current, 'quick-fix-v999.js'), '// ad hoc patch\n');
    fs.appendFileSync(path.join(versioned.current, 'ARCHITECTURE.md'), 'Claimed area: `quick-fix-v999.js`\n');
    const result = runGuard(versioned.base, versioned.current, { body: approvedBody('quick-fix-v999.js') });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Versioned filename exception: yes — <reason>');
  } finally {
    fs.rmSync(versioned.temp, { recursive: true, force: true });
  }
});

test('file-placement guard revalidates merged PR context and blocks direct production pushes', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Repository policy is engine-independent.');

  const fixture = makeFixture();
  try {
    fs.writeFileSync(path.join(fixture.current, 'durable-owner.js'), '// new durable owner\n');
    fs.appendFileSync(path.join(fixture.current, 'ARCHITECTURE.md'), 'New area: `durable-owner.js`\n');
    const bodyFile = path.join(fixture.temp, 'merged-pr-body.md');
    fs.writeFileSync(bodyFile, approvedBody('durable-owner.js'));

    const merged = runGuard(fixture.base, fixture.current, {
      event: 'push',
      mergedViaPr: true,
      bodyFile,
    });
    expect(merged.status, merged.stderr).toBe(0);
    expect(merged.stdout).toContain('passed for: durable-owner.js');

    const missingMergedBody = runGuard(fixture.base, fixture.current, {
      event: 'push',
      mergedViaPr: true,
    });
    expect(missingMergedBody.status).toBe(1);
    expect(missingMergedBody.stderr).toContain('merged PR associated with this push must contain');

    const direct = runGuard(fixture.base, fixture.current, { event: 'push' });
    expect(direct.status).toBe(1);
    expect(direct.stderr).toContain('Direct pushes that introduce production JavaScript are forbidden');
  } finally {
    fs.rmSync(fixture.temp, { recursive: true, force: true });
  }
});
