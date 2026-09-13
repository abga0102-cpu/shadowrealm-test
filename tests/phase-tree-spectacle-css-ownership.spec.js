const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = file => fs.readFileSync(path.join(root, file), 'utf8');

test.describe('Tree spectacle CSS ownership', () => {
  test('V116 owns the preserved spectacle presentation and V247 is unloaded', async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'source ownership is engine-independent');

    const index = src('index.html');
    const dedicated = src('tree-dedicated-v116.js');
    const spectacle = src('personal-tree-spectacle-v247.js');

    expect(index.match(/tree-dedicated-v116\.js/g) || []).toHaveLength(1);
    expect(index).not.toContain('personal-tree-spectacle-v247.js');

    // Preserve V247/V250's exact visual identity and reduced-motion contract in the
    // canonical renderer while the historical source remains staged for L5 proof.
    for (const token of [
      'srPersonalTreeSpectacleV250Style',
      'html:has(.srDedicatedTree) #screen',
      '@keyframes sr250Sweep',
      '@keyframes sr250Busy',
      '@keyframes sr250Key',
      '@keyframes sr250Core',
      '@keyframes sr250Spin',
      '@media(prefers-reduced-motion:reduce)'
    ]) expect(dedicated).toContain(token);

    expect(dedicated).toContain('window.__srPersonalTreeSpectacleV250=true');
    expect(dedicated).toContain("document.head.appendChild(spectacle)");

    // The staged source remains presentation-only: no hidden lifecycle, state,
    // persistence, renderer, save, or gameplay responsibility is being dropped.
    expect(spectacle).not.toMatch(/\bsetInterval\s*\(/);
    expect(spectacle).not.toMatch(/\bsetTimeout\s*\(/);
    expect(spectacle).not.toMatch(/\brequestAnimationFrame\s*\(/);
    expect(spectacle).not.toMatch(/\bMutationObserver\b/);
    expect(spectacle).not.toMatch(/\baddEventListener\s*\(/);
    expect(spectacle).not.toMatch(/\blocalStorage\b|\bsessionStorage\b/);
    expect(spectacle).not.toMatch(/\btreeGraph\s*=/);
    expect(spectacle).not.toMatch(/\bTREE_NODES\b|\btreeReqOk\b|\btreeLv\b/);
  });
});