(() => {
  'use strict';

  const hero = document.querySelector('[data-hero-motion]');
  if (!hero) return;

  const toggle = hero.querySelector('[data-hero-toggle]');
  const icon = toggle?.querySelector('[data-hero-toggle-icon]');
  const label = toggle?.querySelector('[data-hero-toggle-label]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let userPaused = false;
  let offscreen = false;
  let paused = true;
  let pointerFrame = 0;
  let visibilityFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function resetPointer() {
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pointerX = 0;
    pointerY = 0;
    hero.style.setProperty('--pointer-x', '0px');
    hero.style.setProperty('--pointer-y', '0px');
  }

  function updateState() {
    paused = userPaused || reducedMotion.matches || document.hidden || offscreen;
    hero.dataset.motionPaused = String(paused);
    hero.dataset.heroOffscreen = String(offscreen);
    if (paused || !finePointer.matches) resetPointer();
    if (!toggle) return;
    toggle.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    toggle.disabled = reducedMotion.matches;
    if (reducedMotion.matches) toggle.setAttribute('title', 'Animation is paused to respect your reduced motion preference.');
    else toggle.removeAttribute('title');
    if (icon) icon.textContent = paused ? '▶' : 'Ⅱ';
    if (label) label.textContent = paused ? 'Motion off' : 'Motion on';
  }

  function measureVisibility() {
    visibilityFrame = 0;
    const bounds = hero.getBoundingClientRect();
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = window.innerWidth || document.documentElement.clientWidth;
    offscreen = bounds.bottom <= 0 || bounds.top >= height || bounds.right <= 0 || bounds.left >= width;
    updateState();
  }

  function queueVisibilityCheck() {
    if (!visibilityFrame) visibilityFrame = window.requestAnimationFrame(measureVisibility);
  }

  function onMediaChange(query, callback) {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', callback);
    else if (typeof query.addListener === 'function') query.addListener(callback);
  }

  toggle?.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    userPaused = !userPaused;
    updateState();
  });

  hero.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const clamp = value => Math.max(-1, Math.min(1, value));
    pointerX = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1) * 6;
    pointerY = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1) * 5;
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = 0;
      if (paused || !finePointer.matches) { resetPointer(); return; }
      hero.style.setProperty('--pointer-x', `${pointerX.toFixed(2)}px`);
      hero.style.setProperty('--pointer-y', `${pointerY.toFixed(2)}px`);
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', resetPointer, { passive: true });
  hero.addEventListener('pointercancel', resetPointer, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) updateState();
    else measureVisibility();
  });
  onMediaChange(reducedMotion, updateState);
  onMediaChange(finePointer, () => { resetPointer(); updateState(); });

  resetPointer();
  measureVisibility();

  if (typeof window.IntersectionObserver === 'function') {
    const observer = new window.IntersectionObserver(entries => {
      const entry = entries.find(candidate => candidate.target === hero);
      if (!entry) return;
      offscreen = !entry.isIntersecting || entry.intersectionRatio === 0;
      updateState();
    }, { threshold: 0 });
    observer.observe(hero);
  } else {
    window.addEventListener('scroll', queueVisibilityCheck, { passive: true });
    window.addEventListener('resize', queueVisibilityCheck, { passive: true });
  }
})();
