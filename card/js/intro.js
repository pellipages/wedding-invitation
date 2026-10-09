/* envelope → Ganesha → wedding, and the scratch-to-reveal date */
let opened = 0;
const env = $('#env');
const envelope = $('#envelope');
const bless = $('#bless');

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

  // Step 3: Transition past Ganesha to reveal the main wedding site
  setTimeout(() => {
    if (bless) {
      bless.classList.add('dismissed');
      bless.style.pointerEvents = 'none';
    }
    // Intro layer is invisible now; drop it so it stops costing a full-screen
    // composited layer + a running pulse animation for the rest of the visit.
    setTimeout(() => { if (env) env.style.display = 'none'; }, 1800);
  }, 5000);
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