from pathlib import Path
import re

NEW_BUILD = '2026.09.06.47'

g5 = Path('game-5.js').read_text()
start = g5.find('// SCROLL_PRESERVE_V24')
end = g5.find('/* ---------------- go ---------------- */', start)
if start < 0 or end < 0:
    raise SystemExit('scroll preservation block not found')

new_block = r'''// SCROLL_STABILITY_V47
// Un rafraîchissement du DOM pendant un geste de scroll iOS peut casser l'inertie
// et ramener visuellement la page en arrière. On ne reconstruit donc plus l'écran
// pendant que #screen est réellement en mouvement. Le dernier rendu demandé est
// rejoué juste après la fin du scroll. Quand un rendu a lieu, une seule restauration
// synchrone de scrollTop est faite : plus de second restore en requestAnimationFrame
// et plus de "collage" automatique au bas de page qui entraient en conflit avec le doigt.
const renderBaseV47 = render;
let scrollRenderTimerV47 = 0;
let scrollLastMoveV47 = -1e9;
let scrollDeferredV47 = false;
let scrollBypassV47 = false;

(function initScrollStabilityV47(){
  const sc = document.getElementById("screen");
  if (!sc) return;
  const mark = function(){
    scrollLastMoveV47 = (typeof performance !== "undefined" ? performance.now() : Date.now());
    if (scrollDeferredV47) {
      clearTimeout(scrollRenderTimerV47);
      scrollRenderTimerV47 = setTimeout(function(){
        scrollRenderTimerV47 = 0;
        if (!scrollDeferredV47) return;
        scrollDeferredV47 = false;
        scrollBypassV47 = true;
        try { render(); } finally { scrollBypassV47 = false; }
      }, 180);
    }
  };
  sc.addEventListener("scroll", mark, {passive:true});
  sc.addEventListener("touchmove", mark, {passive:true});
  sc.addEventListener("wheel", mark, {passive:true});
})();

render = function(){
  const screen = document.getElementById("screen");
  const beforeRoute = typeof route !== "undefined" ? route : null;
  const now = (typeof performance !== "undefined" ? performance.now() : Date.now());
  const activelyScrolling = !scrollBypassV47 && screen && (now - scrollLastMoveV47 < 150);

  // Important: ne jamais remplacer les enfants du conteneur pendant l'inertie.
  if (activelyScrolling) {
    scrollDeferredV47 = true;
    clearTimeout(scrollRenderTimerV47);
    scrollRenderTimerV47 = setTimeout(function(){
      scrollRenderTimerV47 = 0;
      if (!scrollDeferredV47) return;
      scrollDeferredV47 = false;
      scrollBypassV47 = true;
      try { render(); } finally { scrollBypassV47 = false; }
    }, 180);
    return;
  }

  const beforeTop = screen ? screen.scrollTop : 0;
  const out = renderBaseV47.apply(this, arguments);
  const sc = document.getElementById("screen");
  if (sc && beforeRoute === (typeof route !== "undefined" ? route : null)) {
    const max = Math.max(0, sc.scrollHeight - sc.clientHeight);
    sc.scrollTop = Math.min(beforeTop, max);
  }
  return out;
};

'''

g5 = g5[:start] + new_block + g5[end:]
Path('game-5.js').write_text(g5)

# Synchronise le cache/build sans dépendre du numéro intermédiaire posé par d'autres patches.
idx = Path('index.html').read_text()
idx = re.sub(r'2026\.09\.06\.\d+', NEW_BUILD, idx)
Path('index.html').write_text(idx)

g2 = Path('game-2.js').read_text()
g2, n = re.subn(r'(APP_BUILD\s*=\s*document\.querySelector\([^\n]+?\|\|\s*")2026\.09\.06\.\d+(";)', r'\g<1>'+NEW_BUILD+r'\2', g2, count=1)
if n != 1:
    raise SystemExit('APP_BUILD fallback not found')
Path('game-2.js').write_text(g2)

print('scroll stability v47 applied')
