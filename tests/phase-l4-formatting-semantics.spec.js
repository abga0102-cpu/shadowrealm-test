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

test('L4: base fmt golden semantics remain explicit', () => {
  const fmt = loadFunction('game-1.js', 'fmt');
  expect(fmt(undefined)).toBe('0');
  expect(fmt(null)).toBe('0');
  expect(fmt(NaN)).toBe('0');
  expect(fmt('oops')).toBe('0');
  expect(fmt(999.9)).toBe('999');
  expect(fmt(1000)).toBe('1.00K');
  expect(fmt(1234)).toBe('1.23K');
  expect(fmt(10000)).toBe('10.0K');
  expect(fmt(1000000)).toBe('1.00M');
  expect(fmt(1000000000)).toBe('1.00b');
  expect(fmt(-1000000000)).toBe('-1.00b');
});

test('L4: Forge fmt2 golden semantics remain explicit', () => {
  const fmt2 = loadFunction('forge-ux-v273.js', 'fmt2');
  expect(fmt2(undefined)).toBe('0');
  expect(fmt2(null)).toBe('0');
  expect(fmt2(NaN)).toBe('0');
  expect(fmt2('oops')).toBe('oops');
  expect(fmt2(999.9)).toBe(Math.round(999.9).toLocaleString('fr-FR'));
  expect(fmt2(1000)).toBe('1.0K');
  expect(fmt2(1234)).toBe('1.2K');
  expect(fmt2(10000)).toBe('10K');
  expect(fmt2(1000000)).toBe('1.0M');
  expect(fmt2(1000000000)).toBe('1000M');
  // fmt2 intentionally chooses precision using signed n rather than abs(n).
  expect(fmt2(-1000000000)).toBe('-1000.0M');
});

test('L4: formatters are intentionally non-interchangeable', () => {
  const fmt = loadFunction('game-1.js', 'fmt');
  const fmt2 = loadFunction('forge-ux-v273.js', 'fmt2');
  [999.9, 1000, 1234, 10000, 1000000, 1000000000, -1000000000, 'oops'].forEach((value) => {
    expect(fmt(value)).not.toBe(fmt2(value));
  });
});
