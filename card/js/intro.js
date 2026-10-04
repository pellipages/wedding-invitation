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
  }, 5000);
};

// Scratch to reveal card
const WEDDING = new Date((EVENTS.find(e => e.sevenBefore) || EVENTS[0]).when);

(() => {
  const c = $('#sc');
  if (!c) return;
  const x = c.getContext('2d');
  let W, H, done = 0, down = 0;

  const draw = () => {
    const r = c.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return; // avoid zero size bug
    W = c.width = r.width * 2;
    H = c.height = r.height * 2;
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#6b8050');
    g.addColorStop(1, '#3b4b2c');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    x.strokeStyle = '#ffffff22';
    x.lineWidth = 2;
    for (let i = -H; i < W; i += 26) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i + H, H);
      x.stroke();
    }
    x.fillStyle = '#F4EAD5';
    x.font = 'italic 52px "Cormorant Garamond", serif';
    x.textAlign = 'center';
    x.fillText('scratch here', W / 2, H / 2 + 14);
  };

  const sc = e => {
    if (!down || done) return;
    const r = c.getBoundingClientRect();
    x.globalCompositeOperation = 'destination-out';
    x.beginPath();
    x.arc((e.clientX - r.left) * 2, (e.clientY - r.top) * 2, 50, 0, Math.PI * 2);
    x.fill();
    x.globalCompositeOperation = 'source-over';
    check();
  };

  const check = () => {
    const d = x.getImageData(0, 0, W, H).data;
    let k = 0, n = 0;
    for (let i = 3; i < d.length; i += 200) {
      n++;
      if (!d[i]) k++;
    }
    if (k / n > 0.4) win();
  };

  const tick = () => {
    const [a, b, m] = left(WEDDING);
    $('#d').textContent = a;
    $('#h').textContent = pad(b);
    $('#m').textContent = pad(m);
  };

  const win = () => {
    done = 1;
    c.style.opacity = '0';
    setTimeout(() => c.remove(), 1300);
    $('#reveal').classList.add('won');
    lit($('#reveal'));
    rain('petal.png', 14, 26, 4);
    $('#cd').style.opacity = '1';
    tick();
    setInterval(tick, 1000);
  };

  c.onpointerdown = e => {
    down = 1;
    c.setPointerCapture(e.pointerId);
    sc(e);
  };
  c.onpointermove = sc;
  c.onpointerup = () => (down = 0);
  c.onpointercancel = () => (down = 0);

  // Use threshold: 0.05 and window resize so scratch card is never uninitialized
  new IntersectionObserver((e, o) => {
    if (e[0].isIntersecting) {
      draw();
      o.disconnect();
    }
  }, { threshold: 0.05 }).observe(c);

  window.addEventListener('resize', () => {
    if (!done) draw();
  });
})();