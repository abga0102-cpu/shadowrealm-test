const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const boot = fs.readFileSync(path.join(root, 'boot-stability-v115.js'), 'utf8');

function makePill(text = 'Vague 1/3') {
  const node = { nodeType: 3, nodeValue: text };
  return {
    textContent: text,
    childNodes: [node],
    node,
  };
}

function makeHarness({ combat, campaignWaveCount, rules } = {}) {
  const pill = makePill();
  const animationFrames = [];
  const observerState = { callback: null, target: null, options: null };

  class MutationObserver {
    constructor(callback) {
      observerState.callback = callback;
    }
    observe(target, options) {
      observerState.target = target;
      observerState.options = options;
    }
  }

  const sandbox = {
    combat: combat || { ctx: 'campaign', floor: 4, step: 2, boss: false, elite: false },
    RULES: rules || { STEPS_PER_FLOOR: 3 },
    document: {
      body: {},
      getElementById(id) {
        if (id !== 'aSub') return null;
        return {
          querySelectorAll(selector) {
            return selector === '.fPill' ? [pill] : [];
          },
        };
      },
    },
    MutationObserver,
    requestAnimationFrame(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
    console,
  };
  if (campaignWaveCount !== undefined) sandbox.campaignWaveCount = campaignWaveCount;
  sandbox.window = sandbox;

  vm.runInNewContext(boot, sandbox, { filename: 'boot-stability-v115.js' });

  return {
    sandbox,
    pill,
    animationFrames,
    observerState,
    signalMutation() {
      if (typeof observerState.callback !== 'function') throw new Error('V115 observer callback was not registered');
      observerState.callback([]);
    },
    flushFrame() {
      const frame = animationFrames.shift();
      if (frame) frame();
    },
  };
}

test.describe('Boot V115 wave-display observation contract', () => {
  test.skip(({ project }) => project.name !== 'chromium-desktop', 'Boot wave contract is engine-independent');

  test('startup sync corrects the campaign wave text using the canonical wave-count helper', () => {
    const h = makeHarness({ campaignWaveCount: floor => floor === 4 ? 5 : 0 });

    expect(h.pill.node.nodeValue).toBe('Vague 2/5');
    expect(h.observerState.target).toBe(h.sandbox.document.body);
    expect(h.observerState.options).toEqual({ childList: true, subtree: true });
  });

  test('observer work is frame-coalesced and applies the latest campaign step', () => {
    const h = makeHarness({ campaignWaveCount: () => 3 });
    expect(h.pill.node.nodeValue).toBe('Vague 2/3');

    h.pill.textContent = 'Vague 2/3';
    h.pill.node.nodeValue = 'Vague 2/3';
    h.sandbox.combat.step = 3;

    h.signalMutation();
    h.signalMutation();
    expect(h.animationFrames).toHaveLength(1);
    expect(h.pill.node.nodeValue).toBe('Vague 2/3');

    h.flushFrame();
    expect(h.pill.node.nodeValue).toBe('Vague 3/3');
  });

  test('fallback totals preserve boss, elite and normal campaign semantics', () => {
    const boss = makeHarness({ combat: { ctx: 'campaign', floor: 10, step: 3, boss: true, elite: false } });
    expect(boss.pill.node.nodeValue).toBe('Vague 1/1');

    const elite = makeHarness({ combat: { ctx: 'campaign', floor: 11, step: 2, boss: false, elite: true } });
    expect(elite.pill.node.nodeValue).toBe('Vague 2/2');

    const normal = makeHarness({
      combat: { ctx: 'campaign', floor: 12, step: 4, boss: false, elite: false },
      rules: { STEPS_PER_FLOOR: 4 },
    });
    expect(normal.pill.node.nodeValue).toBe('Vague 4/4');
  });

  test('non-campaign state remains passive', () => {
    const h = makeHarness({ combat: { ctx: 'raid', floor: 4, step: 2, boss: false, elite: false } });
    expect(h.pill.node.nodeValue).toBe('Vague 1/3');

    h.signalMutation();
    h.flushFrame();
    expect(h.pill.node.nodeValue).toBe('Vague 1/3');
  });
});
