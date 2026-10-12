/* envelope → Ganesha → wedding, and the scratch-to-reveal date */
let opened = 0;
const env = $('#env');
const envelope = $('#envelope');
const bless = $('#bless');

const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
let blessed = 0, blessTimer = 0;

// Music lives in the page that wraps this card (js/music.js). Calling it from inside the guest's tap
// is what lets the browser allow sound. Opened on its own (no wrapper), this simply does nothing.
const startMusic = () => {
  try { if (window.parent !== window && window.parent.weddingMusic) window.parent.weddingMusic.begin(); } catch (_) {}
};

// Let the guest into the site (what used to happen on its own 5 seconds after Ganesha appeared).
const enterSite = () => {
  if (bless) {
    bless.classList.add('dismissed');
    bless.style.pointerEvents = 'none';
  }
  // Welcome shower: the moment the guest is let into the site, petals rain down once and stop.
  // Two short waves (a full one, then a lighter one) so it feels like a welcome, not a loop.
  // Each petal removes itself after its fall (see rain() in core.js), so nothing keeps running.
  if (!calm && typeof rain === 'function') {
    rain('petal.webp', 34, 26, 4);
    setTimeout(() => rain('petal.webp', 18, 20, 4), 1200);
  }
  // Intro layer is invisible now; drop it so it stops costing a full-screen
  // composited layer + a running pulse animation for the rest of the visit.
  setTimeout(() => { if (env) env.style.display = 'none'; }, 1800);
};

// The blessing: showers akshintalu and petals over Ganesha, then opens the site. It starts on its own once he has faded in;
// a tap anywhere on the shrine just hurries it along.
const receiveBlessing = () => {
  if (blessed || !bless || !bless.classList.contains('on')) return;
  blessed = 1;
  clearTimeout(blessTimer);
  startMusic();                       // music normally began at the cover gate; this only matters if it was blocked
  bless.classList.add('blessed');
  if (!calm && typeof rain === 'function') {
    // z-index 1000 so they fall in FRONT of the shrine (the shrine layer sits at 998/999)
    rain('akshintalu-particle.webp', 46, 17, 2.6, 1000);
    rain('petal.webp', 26, 30, 3.4, 1000);
    setTimeout(() => {
      rain('akshintalu-particle.webp', 30, 15, 2.6, 1000);
      rain('petal.webp', 14, 26, 3.4, 1000);
    }, 1200);
    setTimeout(() => {
      rain('akshintalu-particle.webp', 22, 14, 2.6, 1000);
      rain('petal.webp', 10, 24, 3.4, 1000);
    }, 2800);
  }
  // How long Ganesha stays after the tap (ms). Raise this to keep him on screen longer.
  setTimeout(enterSite, calm ? 1500 : 6000);
};
if (bless) bless.addEventListener('click', receiveBlessing);

envelope.onclick = () => {
  if (opened) return;
  opened = 1;
  envelope.classList.add('open');

  // Step 1: Open envelope, bring Ganesha shrine into view
  setTimeout(() => {
    if (bless) bless.classList.add('on');
  }, 900);

  // Step 2: Fade envelope out and kill its hit-testing
  setTimeout(() => {
    if (env) {
      env.classList.add('gone');
      env.style.pointerEvents = 'none';
    }
  }, 1800);

  // Step 3: no button any more. Once Ganesha has fully faded in, the blessing begins on its own.
  blessTimer = setTimeout(receiveBlessing, calm ? 2400 : 2800);
};

// Scratch to reveal card
const WEDDING = new Date((EVENTS.find(e => e.sevenBefore) || EVENTS[0]).when);

(() => {
  const c = $('#sc');
  if (!c) return;
  // desynchronized = lower input latency where supported
  const x = c.getContext('2d', { desynchronized: true });
  const BRUSH = 26;                 // brush radius in CSS px
  const GX = 20, GY = 30;           // coverage grid (no pixel readback needed)
  const cover = new Uint8Array(GX * GY);
  let W = 0, H = 0, S = 1, rect = null;
  let done = 0, down = 0, hit = 0, lx = 0, ly = 0, raf = 0, queue = [];

  const draw = () => {
    const r = c.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    S = Math.min(window.devicePixelRatio || 1, 1.5);   // cap resolution for speed
    W = c.width = Math.round(r.width * S);
    H = c.height = Math.round(r.height * S);
    rect = r;
    cover.fill(0); hit = 0;
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#6b8050');
    g.addColorStop(1, '#3b4b2c');
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(255,255,255,.13)';
    x.lineWidth = 1.5 * S;
    x.beginPath();
    for (let i = -H; i < W; i += 20 * S) { x.moveTo(i, 0); x.lineTo(i + H, H); }
    x.stroke();
    x.fillStyle = '#F4EAD5';
    x.font = `italic ${26 * S}px "Cormorant Garamond", serif`;
    x.textAlign = 'center';
    x.fillText('scratch here', W / 2, H / 2 + 7 * S);
    x.globalCompositeOperation = 'destination-out';
    x.lineCap = x.lineJoin = 'round';
    x.lineWidth = BRUSH * 2 * S;
  };

  // mark coverage cells touched by the brush (cheap, no getImageData)
  const mark = (px, py) => {
    const cw = rect.width / GX, ch = rect.height / GY;
    const x0 = Math.max(0, Math.floor((px - BRUSH * .7) / cw));
    const x1 = Math.min(GX - 1, Math.floor((px + BRUSH * .7) / cw));
    const y0 = Math.max(0, Math.floor((py - BRUSH * .7) / ch));
    const y1 = Math.min(GY - 1, Math.floor((py + BRUSH * .7) / ch));
    for (let j = y0; j <= y1; j++)
      for (let i = x0; i <= x1; i++) {
        const k = j * GX + i;
        if (!cover[k]) { cover[k] = 1; hit++; }
      }
  };

  // one batched paint per frame, interpolated with a round-capped line
  const flush = () => {
    raf = 0;
    if (done || !queue.length) { queue.length = 0; return; }
    x.beginPath();
    x.moveTo(lx * S, ly * S);
    for (const [px, py] of queue) {
      x.lineTo(px * S, py * S);
      mark(px, py);
      lx = px; ly = py;
    }
    x.stroke();
    queue.length = 0;
    if (hit / cover.length > 0.4) win();
  };

  const push = e => {
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e]))
      queue.push([ev.clientX - rect.left, ev.clientY - rect.top]);
    if (!raf) raf = requestAnimationFrame(flush);
  };

  const tick = () => {
    const [a, b, m] = left(WEDDING);
    $('#d').textContent = a;
    $('#h').textContent = pad(b);
    $('#m').textContent = pad(m);
  };

  const win = () => {
    if (done) return;
    done = 1;
    c.style.opacity = '0';
    c.style.pointerEvents = 'none';
    setTimeout(() => c.remove(), 1300);
    $('#reveal').classList.add('won');
    lit($('#reveal'));
    rain('petal.webp', 14, 26, 4);
    $('#cd').style.opacity = '1';
    tick();
    setInterval(tick, 1000);
  };

  c.onpointerdown = e => {
    if (done) return;
    rect = c.getBoundingClientRect();     // refresh once per stroke (scroll-safe)
    down = 1;
    c.setPointerCapture(e.pointerId);
    lx = e.clientX - rect.left;
    ly = e.clientY - rect.top;
    push(e);
  };
  c.onpointermove = e => { if (down && !done) push(e); };
  c.onpointerup = c.onpointercancel = () => { down = 0; };

  // init when visible; redraw on resize only if untouched
  new IntersectionObserver((e, o) => {
    if (e[0].isIntersecting) { draw(); o.disconnect(); }
  }, { threshold: 0.05 }).observe(c);

  let rt;
  window.addEventListener('resize', () => {
    if (done || down) return;
    clearTimeout(rt);
    rt = setTimeout(draw, 150);
  });
})();