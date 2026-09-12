const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function extractNamedFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing function ${name}`);
  const bodyStart = source.indexOf('{', start);
  if (bodyStart < 0) throw new Error(`Missing body for ${name}`);
  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Unclosed function ${name}`);
}

function loadFunction(file, name) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const fnSource = extractNamedFunction(source, name);
  return Function(`"use strict"; return (${fnSource});`)();
}

test('L4: base escaping semantics remain explicit', () => {
  const esc = loadFunction('game-3.js', 'esc');
  expect(esc(null)).toBe('null');
  expect(esc(undefined)).toBe('undefined');
  expect(esc(0)).toBe('0');
  expect(esc('&<>"\'')).toBe('&amp;&lt;&gt;&quot;\'');
  expect(esc('a"b\'c')).toBe('a&quot;b\'c');
});

test('L4: Forge escaping semantics remain explicit', () => {
  const esc2 = loadFunction('forge-panel-authority-v266.js', 'esc2');
  expect(esc2(null)).toBe('');
  expect(esc2(undefined)).toBe('');
  expect(esc2(0)).toBe('0');
  expect(esc2('&<>"\'')).toBe('&amp;&lt;&gt;&quot;\'');
  expect(esc2('a"b\'c')).toBe('a&quot;b\'c');
});

test('L4: Tree escaping semantics remain explicit', () => {
  const esc = loadFunction('runtime-tree-stability-v216.js', 'esc');
  expect(esc(null)).toBe('');
  expect(esc(undefined)).toBe('');
  expect(esc(0)).toBe('0');
  expect(esc('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#39;');
  expect(esc('a"b\'c')).toBe('a&quot;b&#39;c');
});

test('L4: escaping helpers are intentionally non-interchangeable', () => {
  const baseEsc = loadFunction('game-3.js', 'esc');
  const forgeEsc = loadFunction('forge-panel-authority-v266.js', 'esc2');
  const treeEsc = loadFunction('runtime-tree-stability-v216.js', 'esc');

  expect(baseEsc(null)).not.toBe(forgeEsc(null));
  expect(baseEsc(null)).not.toBe(treeEsc(null));
  expect(forgeEsc("O'Reilly")).not.toBe(treeEsc("O'Reilly"));
});
