const fs = require('fs');
const assert = require('assert');

const src = fs.readFileSync('game-5.js', 'utf8');

assert(src.includes('let scrollPointerActiveV435 = false;'), 'V435 touch interaction guard must exist');
assert(src.includes('scrollPointerActiveV435 || (now - scrollLastMoveV47 < 150)'), 'render guard must include active touch interaction');
assert(src.includes('sc.addEventListener("pointerup", releasePointer'), 'touch guard must release on pointerup');
assert(src.includes('sc.addEventListener("pointercancel", releasePointer'), 'touch guard must release on pointercancel');

const renderStart = src.indexOf('function render() {');
const renderEnd = src.indexOf('\nfunction attachArena()', renderStart);
assert(renderStart >= 0 && renderEnd > renderStart, 'base render function must be found');
const renderBody = src.slice(renderStart, renderEnd);
assert(!renderBody.includes('const keep = sc.scrollTop'), 'base render must not independently own scroll restoration');
assert(!renderBody.includes('sc.scrollTop = keep'), 'base render must not independently restore scroll');

const stabilityStart = src.indexOf('// SCROLL_STABILITY_V47');
const stability = src.slice(stabilityStart);
assert(stability.includes('const beforeTop = screen ? screen.scrollTop : 0;'), 'scroll stability owner must capture scroll once');
assert(stability.includes('sc.scrollTop = Math.min(beforeTop, max);'), 'scroll stability owner must restore the bounded position once');

console.log('V435 screen stability source contract OK');

const index = fs.readFileSync('index.html', 'utf8');
[
  'rebirth-upgrades-cleanup-v223.js',
  'rebirth-floor-skip-balance-v225.js',
  'rebirth-removal-ui-v279.js',
  'rebirth-spectacle-v222.js',
  'rebirth-scroll-natural-v221.js',
  'rebirth-ui-cleanup-v224.js'
].forEach(file => assert(!index.includes(file), file + ' must stay retired from runtime'));
assert(index.includes('rebirth-removal-authority-v281.js'), 'final Rebirth retirement authority must remain loaded');
