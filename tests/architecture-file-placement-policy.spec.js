const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');

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

  expect(workflow).toContain('- name: Enforce architecture-first file placement');
  expect(workflow).toContain('node tests/architecture-file-placement-guard.js .phase1-base .');
  expect(guard).toContain('ARCHITECTURE.md must register the new canonical owner');
  expect(guard).toContain('New production JavaScript files must be introduced through a PR');
  expect(guard).toContain('Versioned filename exception: yes — <reason>');
});
