/* Scroll cue on the Harika & Prem slide: "Scroll down" (mouse) / "Swipe up" (touch).
   CSS shows it once <html> has .site-entered (set in intro.js when Ganesha hands over to the site).
   Here: hide it the moment the guest starts scrolling, bring it back if they return to the top,
   and let a tap/click carry them to the next slide. */
(() => {
  const cue = $('#invCue');
  if (!cue) return;

  const AWAY_PX = 40;                       // scrolled further than this = they've got the message
  const sync = () => cue.classList.toggle('is-away', (window.scrollY || document.documentElement.scrollTop) > AWAY_PX);
  window.addEventListener('scroll', sync, { passive: true });
  sync();

  // First fade-in done: from now on it reappears (after a scroll back to the top) without the entrance delay.
  cue.addEventListener('transitionend', e => {
    if (e.propertyName === 'opacity' && !cue.classList.contains('is-away')) cue.classList.add('is-settled');
  });

  cue.addEventListener('click', () => {
    const next = $('#reveal');
    if (!next) return;
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    next.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  });
})();
