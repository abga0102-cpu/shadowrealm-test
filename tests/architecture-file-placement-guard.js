const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(process.argv[2] || '.phase1-base');
const currentDir = path.resolve(process.argv[3] || '.');

const ignoredTopLevel = new Set([
  '.git',
  '.github',
  '.phase1-base',
  'node_modules',
  'tests',
  'playwright-report',
  'test-results',
]);

function listFiles(root, rel = '') {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!rel && ignoredTopLevel.has(entry.name)) continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listFiles(root, childRel));
    else out.push(childRel.replace(/\\/g, '/'));
  }
  return out;
}

function isProductionJavaScript(file) {
  return file.endsWith('.js') &&
    !file.startsWith('tests/') &&
    !file.startsWith('.github/');
}

function read(root, file) {
  const target = path.join(root, file);
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
}

function field(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body.match(new RegExp(`^\\s*-?\\s*${escaped}\\s*(.+)$`, 'mi'));
  return match ? match[1].trim() : '';
}

function meaningful(value) {
  return Boolean(value) && !/^(?:n\/?a|none|no|not applicable)\b/i.test(value);
}

function resolveBody() {
  const bodyFile = process.env.PR_BODY_FILE || '';
  if (bodyFile) {
    const resolved = path.resolve(bodyFile);
    if (fs.existsSync(resolved)) return fs.readFileSync(resolved, 'utf8');
  }
  return process.env.PR_BODY || '';
}

const baseFiles = new Set(listFiles(baseDir).filter(isProductionJavaScript));
const currentFiles = new Set(listFiles(currentDir).filter(isProductionJavaScript));
const added = [...currentFiles].filter((file) => !baseFiles.has(file)).sort();

if (!added.length) {
  console.log('Architecture file-placement guard: no new production JavaScript files.');
  process.exit(0);
}

const errors = [];
const architecture = read(currentDir, 'ARCHITECTURE.md');
const baseArchitecture = read(baseDir, 'ARCHITECTURE.md');
const body = resolveBody();
const changeEvent = process.env.CHANGE_EVENT || '';
const mergedViaPr = process.env.ARCH_MERGED_VIA_PR === '1';

if (architecture === baseArchitecture) {
  errors.push('ARCHITECTURE.md must be updated when a new production JavaScript file is introduced.');
}

for (const file of added) {
  if (!architecture.includes(`\`${file}\``)) {
    errors.push(`ARCHITECTURE.md must register the new canonical owner \`${file}\`.`);
  }
}

if (!body.trim()) {
  if (changeEvent === 'push' && !mergedViaPr) {
    errors.push('Direct pushes that introduce production JavaScript are forbidden; create a PR and complete the architecture/file-placement justification.');
  } else if (changeEvent === 'push') {
    errors.push('The merged PR associated with this push must contain the architecture/file-placement justification.');
  } else {
    errors.push('New production JavaScript files must be introduced through a PR with the architecture/file-placement justification completed.');
  }
} else {
  const considered = field(body, 'Existing canonical owner considered:');
  const declaredFiles = field(body, 'New production `.js` files:');
  const rationale = field(body, 'Why existing owner cannot safely contain this code:');
  const architectureEntry = field(body, '`ARCHITECTURE.md` owner entry added/updated:');

  if (!meaningful(considered)) {
    errors.push('PR body must name the existing canonical owner(s) considered before creating a new file.');
  }
  if (!meaningful(rationale)) {
    errors.push('PR body must explain why the existing canonical owner cannot safely contain the new responsibility.');
  }
  if (!/^yes\b/i.test(architectureEntry)) {
    errors.push('PR body must confirm that ARCHITECTURE.md was updated for the new owner.');
  }
  for (const file of added) {
    if (!declaredFiles.includes(file)) {
      errors.push(`PR body must list new production file \`${file}\` in the file-placement section.`);
    }
  }

  const versioned = added.filter((file) => /-v\d+\.js$/i.test(file));
  if (versioned.length) {
    const exception = field(body, 'Versioned filename exception:');
    if (!/^yes\s*[-—:]\s*\S+/i.test(exception)) {
      errors.push(`New version-suffixed production files (${versioned.join(', ')}) require an explicit \`Versioned filename exception: yes — <reason>\` justification.`);
    }
  }
}

if (errors.length) {
  console.error('Architecture file-placement guard failed.');
  console.error(`New production JavaScript: ${added.join(', ')}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Architecture file-placement guard passed for: ${added.join(', ')}`);
