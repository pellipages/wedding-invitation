/* =========================================================
   SEND YOUR BLESSINGS — Physical Stationery & Memory Pinning
   - Folds letter gently in 3D
   - Showers akshintalu particles and petals
   - Seamlessly converts blessing into a physical wall card
   - Preserves store.blessings and store.photos data loops
   ========================================================= */
(() => {
  const sendBtn = document.getElementById('bsend');
  const msgInput = document.getElementById('bm');
  const nameInput = document.getElementById('bn');
  const anonCheck = document.getElementById('anon');
  const paper = document.getElementById('blPaper');
  const quillDock = document.getElementById('blQuillDock');
  const actionArea = document.getElementById('blActionArea');
  const doneMsg = document.getElementById('blDone');

  if (!sendBtn || !msgInput) return;

  // Clicking the feather quill auto-focuses the writing area
  if (quillDock) {
    quillDock.addEventListener('click', () => {
      msgInput.focus();
    });
  }

  // Generate SVG parchment for pinned wall memory
  function createLetterCardDataUrl(message, author) {
    const cleanMsg = message.length > 85 ? message.substring(0, 82) + '…' : message;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="480" viewBox="0 0 600 480">
        <defs>
          <radialGradient id="paperGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fffef9"/>
            <stop offset="100%" stop-color="#f5ecda"/>
          </radialGradient>
        </defs>
        <rect width="600" height="480" fill="url(#paperGlow)" stroke="#cbb28d" stroke-width="2"/>
        <text x="300" y="70" font-family="'Noto Serif Telugu', serif" font-size="20" fill="#B45A3C" text-anchor="middle">ఆశీర్వాదం</text>
        <text x="300" y="110" font-family="'Pinyon Script', cursive" font-size="44" fill="#6A1E2B" text-anchor="middle">A Blessing</text>
        <line x1="160" y1="130" x2="440" y2="130" stroke="#e2a72e" stroke-width="1.5" stroke-dasharray="6,4"/>
        <text x="300" y="220" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-size="25" fill="#3b2a20" text-anchor="middle">“${cleanMsg}”</text>
        <text x="460" y="380" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-size="22" fill="#B45A3C" text-anchor="end">— ${author}</text>
        <circle cx="90" cy="380" r="24" fill="#6a1e2b22"/>
        <text x="90" y="387" font-family="serif" font-size="20" fill="#6A1E2B" text-anchor="middle">✦</text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  sendBtn.addEventListener('click', () => {
    const message = msgInput.value.trim();
    if (!message) {
      msgInput.focus();
      return;
    }

    const author = (anonCheck && anonCheck.checked) || !nameInput.value.trim() 
      ? 'A Well-Wisher' 
      : nameInput.value.trim();

    // 1. Save blessing record in local store
    if (typeof store !== 'undefined') {
      store.blessings = store.blessings || [];
      store.blessings.push({ who: author, m: message, at: Date.now() });

      // 2. Turn this blessing into a physical parchment memory on #wall
      store.photos = store.photos || [];
      store.photos.push({
        type: 'note',
        text: message,
        by: author,
        cap: `Blessing from ${author}`,
        time: Date.now()
      });

      if (typeof save === 'function') save();
    }

    // 3. Gentle folding animation
    if (paper) {
      paper.classList.add('is-folding');
    }
    if (quillDock) {
      quillDock.style.opacity = '0';
      quillDock.style.pointerEvents = 'none';
    }
    if (actionArea) {
      actionArea.style.opacity = '0';
      actionArea.style.pointerEvents = 'none';
    }

    // 4. Sacred Akshantalu & petal rain ritual
    if (typeof rain === 'function') {
      rain('akshintalu-particle.webp', 90, 14, 4);
      setTimeout(() => rain('petal.webp', 16, 24, 5), 500);
    }

    const section = document.getElementById('blessings');
    if (section && typeof lit === 'function') {
      lit(section);
    }

    // 5. Reveal the emotional payoff and re-render the wall
    setTimeout(() => {
      if (paper) paper.style.display = 'none';
      if (actionArea) actionArea.style.display = 'none';
      if (doneMsg) doneMsg.style.display = 'block';

      // Keep legacy #bt populated for existing listeners
      const bt = document.getElementById('bt');
      if (bt) bt.textContent = `Received — ${author}`;

      // Refresh memory wall so the note appears pinned
      if (typeof renderWall === 'function') {
        renderWall();
      }
    }, 1100);
  });
})();