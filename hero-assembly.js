(() => {
  const visual = document.querySelector('.hero-visual');
  const trigger = visual?.querySelector('.hero-core');
  const network = trigger?.closest('.hero-network');
  if (!network || !Element.prototype.animate) return;

  const nodes = [...visual.querySelectorAll('.floating-node')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let run;

  function clear() {
    if (!run) return;
    const previous = run;
    run = undefined;
    clearTimeout(previous.timer);
    previous.animations.forEach(animation => animation.cancel());
    visual.classList.remove('is-assembling', 'is-assembled');
    trigger.style.removeProperty('--hero-core-scale');
  }

  async function restore(current) {
    if (run !== current || current.restoring) return;
    current.restoring = true;
    clearTimeout(current.timer);
    visual.classList.remove('is-assembled');
    trigger.style.removeProperty('--hero-core-scale');
    for (const animation of current.animations) {
      animation.updatePlaybackRate(-1.45);
      animation.play();
    }
    await Promise.allSettled(current.animations.map(animation => animation.finished));
    if (run === current) clear();
  }

  function planRestore(current) {
    clearTimeout(current.timer);
    if (current.done && !current.hovered) {
      current.timer = setTimeout(() => restore(current), current.hold);
    }
  }

  async function assemble(hovered) {
    const current = { hovered, hold: hovered ? 1600 : 4500, animations: [] };
    run = current;
    visual.classList.add('is-assembling');
    const hub = trigger.getBoundingClientRect();
    const centerX = hub.left + hub.width / 2;
    const centerY = hub.top + hub.height / 2;
    const finalScale = Math.min(2.15, (network.clientWidth - 20) / hub.width, (network.clientHeight - 90) / hub.height);

    try {
      for (const [index, node] of nodes.entries()) {
        const box = node.getBoundingClientRect();
        const dx = centerX - box.left - box.width / 2;
        const dy = centerY - box.top - box.height / 2;
        const original = getComputedStyle(node).transform;
        const animation = node.animate([
          { transform: original, opacity: 1 },
          { offset: .25, transform: `translate(${-dx * .06}px, ${-dy * .06}px) ${original === 'none' ? '' : original}`, opacity: 1 },
          { offset: .8, transform: `translate(${dx * .82}px, ${dy * .82}px) scale(.43)`, opacity: .88 },
          { transform: `translate(${dx}px, ${dy}px) scale(.07)`, opacity: 0 }
        ], { duration: 280, easing: 'cubic-bezier(.42, 0, .62, 1)', fill: 'forwards' });
        current.animations.push(animation);
        await animation.finished;
        if (run !== current) return;
        const scale = index === nodes.length - 1 ? finalScale : 1 + (index + 1) * .15;
        trigger.style.setProperty('--hero-core-scale', scale.toFixed(3));
      }
      visual.classList.add('is-assembled');
      current.done = true;
      planRestore(current);
    } catch {
      // Cancelling a Web Animation rejects its completion promise.
      if (run === current) clear();
    }
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    if (!run) assemble(true);
    else {
      run.hovered = true;
      planRestore(run);
    }
  });
  trigger.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || !run) return;
    run.hovered = false;
    planRestore(run);
  });
  trigger.addEventListener('click', () => {
    if (!run) assemble(false);
    else if (run.done) restore(run);
  });
  visual.addEventListener('focusin', event => { if (event.target !== trigger) clear(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') clear(); });
  window.addEventListener('resize', clear);

  function syncMotionPreference() {
    clear();
    trigger.disabled = reduceMotion.matches;
  }
  reduceMotion.addEventListener('change', syncMotionPreference);
  syncMotionPreference();
})();
