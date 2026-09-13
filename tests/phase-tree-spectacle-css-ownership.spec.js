const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');
const stripComments = source => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter(line => !line.trimStart().startsWith('//'))
  .join('\n');

test.describe('Tree spectacle CSS ownership', () => {
  test('V247 is a presentation-only layer with no lifecycle, state or gameplay authority', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    const index = src('index.html');
    const dedicated = src('tree-dedicated-v116.js');
    const spectacle = src('personal-tree-spectacle-v247.js');
    const code = stripComments(spectacle);

    // Keep the current load relationship explicit until the visual rules are folded
    // into the canonical dedicated Tree owner in a later, non-intersecting batch.
    expect(index.match(/tree-dedicated-v116\.js/g) || []).toHaveLength(1);
    expect(index.match(/personal-tree-spectacle-v247\.js/g) || []).toHaveLength(1);
    expect(dedicated).toContain('.srDedicatedTree');

    // V247 owns only CSS presentation attached to the existing dedicated Tree DOM.
    expect(code).toContain("document.createElement('style')");
    expect(code).toContain("s.id='srPersonalTreeSpectacleV250Style'");
    expect(code).toContain('s.textContent=`');
    expect(code).toContain('html:has(.srDedicatedTree) #screen');
    expect(code).toContain('@keyframes sr250Sweep');
    expect(code).toContain('@media(prefers-reduced-motion:reduce)');
    expect(code).toContain('document.head.appendChild(s)');

    // Contract-lock the absence of hidden scheduling, lifecycle, persistence or
    // gameplay ownership before a future CSS consolidation removes the script load.
    expect(code).not.toMatch(/\bsetInterval\s*\(/);
    expect(code).not.toMatch(/\bsetTimeout\s*\(/);
    expect(code).not.toMatch(/\brequestAnimationFrame\s*\(/);
    expect(code).not.toMatch(/\bMutationObserver\b/);
    expect(code).not.toMatch(/\baddEventListener\s*\(/);
    expect(code).not.toMatch(/\blocalStorage\b|\bsessionStorage\b/);
    expect(code).not.toMatch(/\btreeGraph\s*=/);
    expect(code).not.toMatch(/\bTREE_NODES\b|\btreeReqOk\b|\btreeLv\b/);
  });
});
