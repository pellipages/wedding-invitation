/* Section nav (css/nav.css): the guest's map of the invitation.
   - appears once the envelope has been opened (html.site-entered, set in intro.js), after the petal welcome
   - highlights the section on screen; a bead marks sections the guest hasn't reached yet
   - tap = smooth scroll to that section
   - hides while an event page is open (#world.on) and, on touch screens, while a field is being typed in */
(() => {
  const nav = $('#secNav');
  if (!nav) return;
  const root = document.documentElement;
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links = $$('#secNav a[data-s]');
  const secs = links.map(a => $('#' + a.dataset.s)).filter(Boolean);
  const seen = new Set();

  // ---- show after the welcome ----
  const reveal = () => setTimeout(() => root.classList.add('sn-on'), 2400);
  if (root.classList.contains('site-entered')) reveal();
  else new MutationObserver((_, o) => {
    if (root.classList.contains('site-entered')) { o.disconnect(); reveal(); }
  }).observe(root, { attributes: true, attributeFilter: ['class'] });

  // ---- which section is on screen ----
  let queued = false;
  const sync = () => {
    queued = false;
    const y = innerHeight * 0.4;                         // a line 40% down the screen
    let cur = null;
    secs.forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = s.id; });
    if (cur) seen.add(cur);
    links.forEach(a => {
      const on = a.dataset.s === cur;
      a.classList.toggle('is-cur', on);
      a.classList.toggle('is-new', !seen.has(a.dataset.s));
      on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(sync); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  sync();

  // ---- tap to jump ----
  links.forEach(a => a.addEventListener('click', e => {
    const t = $('#' + a.dataset.s);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }));

  // ---- step aside for event pages ----
  const world = $('#world');
  if (world) new MutationObserver(() => root.classList.toggle('sn-hide', world.classList.contains('on')))
    .observe(world, { attributes: true, attributeFilter: ['class'] });

  // ---- and for the on-screen keyboard (touch screens only) ----
  if (window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches) {
    const typing = el => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && el.type !== 'checkbox' && el.type !== 'radio';
    addEventListener('focusin', e => { if (typing(e.target)) root.classList.add('sn-kb'); });
    addEventListener('focusout', () => setTimeout(() => { if (!typing(document.activeElement)) root.classList.remove('sn-kb'); }, 120));
  }
})();
