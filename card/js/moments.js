/* =========================================================
   MOMENTS — Living Telugu Wedding Memory Wall Engine
   - Deterministic asymmetric layout
   - Dynamic, content-driven note cards for guest blessings
   - Smooth pointer drag interaction for mouse & touch
   - Preserves all public IDs and form bindings
   ========================================================= */
(() => {
  const wall = $('#wall');
  const fileIn = $('#ph');
  const nameIn = $('#pn');
  const catSel = $('#pc');
  const capIn = $('#pcap');
  const addBtn = $('#padd');
  const fileTxt = $('#pfiletxt');

  if (!wall) return;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));

  // Populate events selector from EVENTS in data.js
  if (catSel && typeof EVENTS !== 'undefined') {
    catSel.innerHTML = '<option value="">All celebrations</option>' +
      EVENTS.map(e => `<option value="${esc(e.n)}">${esc(e.t)} · ${esc(e.n)}</option>`).join('');
  }

  // File picker label feedback
  if (fileIn && fileTxt) {
    fileIn.addEventListener('change', () => {
      const file = fileIn.files && fileIn.files[0];
      fileTxt.textContent = file ? file.name : 'Choose a photograph or video';
    });
  }

  /* ---------------------------------------------------------
     DETERMINISTIC ASYMMETRIC COMPOSITION ENGINE
     --------------------------------------------------------- */
  const DESK_PROFILES = [
    { l: 28, topOffset: 0,   w: 36, ar: '4/5',   rot: -2,   z: 5, t: 1 },
    { l: 5,  topOffset: 8,   w: 22, ar: '1/1',   rot: 3,    z: 6, t: 2 },
    { l: 67, topOffset: 4,   w: 26, ar: '16/10', rot: -3,   z: 4, t: 0 },
    { l: 16, topOffset: 24,  w: 28, ar: '3/2',   rot: 2,    z: 3, t: 3 },
    { l: 48, topOffset: 21,  w: 38, ar: '16/11', rot: -1.5, z: 6, t: 1 },
    { l: -2, topOffset: 39,  w: 21, ar: '4/5',   rot: -4,   z: 4, t: 2 },
    { l: 36, topOffset: 38,  w: 27, ar: '1/1',   rot: 2.5,  z: 5, t: 0 },
    { l: 68, topOffset: 36,  w: 24, ar: '5/4',   rot: -3,   z: 4, t: 1 }
  ];

  const MOB_PROFILES = [
    { l: 8,  topOffset: 0,   w: 84, ar: '4/5',   rot: -1.5, z: 5, t: 1 },
    { l: 30, topOffset: 24,  w: 64, ar: '1/1',   rot: 3,    z: 6, t: 2 },
    { l: -4, topOffset: 48,  w: 68, ar: '4/3',   rot: -3,   z: 4, t: 0 },
    { l: 12, topOffset: 74,  w: 80, ar: '16/11', rot: 1.8,  z: 5, t: 1 },
    { l: 36, topOffset: 99,  w: 60, ar: '1/1',   rot: -3.5, z: 4, t: 2 },
    { l: 4,  topOffset: 124, w: 72, ar: '5/4',   rot: 2,    z: 5, t: 0 }
  ];

  function getStoredMemories() {
    let custom = [];
    if (typeof store !== 'undefined' && store.photos && Array.isArray(store.photos)) {
      custom = store.photos;
    }
    const official = (typeof PHOTOS !== 'undefined' && Array.isArray(PHOTOS)) ? PHOTOS : [];
    return [...official, ...custom];
  }

  function renderWall() {
    const list = getStoredMemories();
    const isDesktop = window.innerWidth >= 900;
    const profiles = isDesktop ? DESK_PROFILES : MOB_PROFILES;
    const pLen = profiles.length;

    if (!list.length) {
      wall.style.minHeight = 'auto';
      wall.innerHTML = `
        <div class="mw-empty-state">
          <p class="mw-empty-verse">“Some memories are still waiting to be made.”</p>
          <span class="mw-empty-sub">Be the first to leave a blessing and pin a memory below.</span>
        </div>`;
      return;
    }

    let maxBottomVW = 0;

    const html = list.map((item, i) => {
      const prof = profiles[i % pLen];
      const cycle = Math.floor(i / pLen);

      const cycleOffsetVW = cycle * (isDesktop ? 48 : 150);
      const topVW = prof.topOffset + cycleOffsetVW;
      const leftVal = prof.l;
      const widthVW = prof.w;
      const rot = prof.rot;
      const zIndex = prof.z;
      const treatment = prof.t;
      const ar = prof.ar;

      // Estimate bottom edge for dynamic wall height
      const estHeightVW = widthVW * 1.15;
      if (topVW + estHeightVW > maxBottomVW) {
        maxBottomVW = topVW + estHeightVW;
      }

      let decorHTML = '';
      let frameClass = 'mw-photo-frame';
      if (treatment === 1) decorHTML = '<div class="mw-tape-strip" aria-hidden="true"></div>';
      if (treatment === 2) frameClass += ' mw-photo-corners';

      // Distinguish handwritten text notes from photo cards
      const isTextNote = item.type === 'note' || (!item.src && item.text);

      if (isTextNote) {
        const noteBody = esc(item.text || item.cap || '');
        const noteAuthor = esc(item.by || 'A Well-Wisher');

        return `
          <button class="mw-item is-text-note"
                  data-idx="${i}"
                  style="--l:${leftVal}%; --t:${topVW}vw; --w:${widthVW}vw; --rot:${rot}deg; --z:${zIndex};"
                  aria-label="Read blessing from ${noteAuthor}">
            <div class="${frameClass}">
              ${decorHTML}
              <div class="mw-note-card">
                <p class="mw-note-kicker">ఆశీర్వాదం ✦ A Blessing</p>
                <p class="mw-note-text">“${noteBody}”</p>
                <div class="mw-note-author">— ${noteAuthor}</div>
              </div>
            </div>
          </button>
        `;
      }

      // Default: Photography Polaroid Card
      const capText = esc(item.cap || item.caption || '');
      const byText = item.by ? `— ${esc(item.by)}` : '';
      const sideCap = (treatment === 3 && isDesktop && capText) ? ' mw-caption-side' : '';

      return `
        <button class="mw-item"
                data-idx="${i}"
                style="--l:${leftVal}%; --t:${topVW}vw; --w:${widthVW}vw; --rot:${rot}deg; --z:${zIndex}; --ar:${ar};"
                aria-label="View photograph: ${capText || 'Wedding memory'}">
          <div class="${frameClass}">
            ${decorHTML}
            <img src="${esc(item.src)}" alt="${capText || 'Photograph of celebration'}" loading="lazy" style="object-position:${item.pos || '50% 50%'}">
          </div>
          ${capText ? `
            <figcaption class="mw-caption-note${sideCap}">
              <span>${capText}</span>${byText ? `<span class="mw-caption-meta">${byText}</span>` : ''}
            </figcaption>` : ''}
        </button>
      `;
    }).join('');

    wall.innerHTML = html;
    wall.style.minHeight = `calc(${maxBottomVW}vw + 6vw)`;

    setupRevealObserver();
    enableDraggableMemories();
  }

  // Reveal IntersectionObserver
  function setupRevealObserver() {
    const items = wall.querySelectorAll('.mw-item');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('mw-revealed'));
      return;
    }

    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mw-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px 60px 0px' });

    items.forEach(el => io.observe(el));
  }

  // Pointer drag controller
  function enableDraggableMemories() {
    const items = wall.querySelectorAll('.mw-item');

    items.forEach(el => {
      let startX = 0;
      let startY = 0;
      let currentDx = parseFloat(el.dataset.dx || 0);
      let currentDy = parseFloat(el.dataset.dy || 0);
      let isDown = false;
      let hasMoved = false;

      el.onpointerdown = e => {
        if (e.target.closest('a, button:not(.mw-item)')) return;

        isDown = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;

        el.setPointerCapture(e.pointerId);
      };

      el.onpointermove = e => {
        if (!isDown) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (!hasMoved && Math.hypot(deltaX, deltaY) > 4) {
          hasMoved = true;
          el.classList.add('is-dragging');
          const baseRot = parseFloat(getComputedStyle(el).getPropertyValue('--rot')) || 0;
          el.style.setProperty('--drag-rot', `${baseRot + (deltaX > 0 ? 3 : -3)}deg`);
        }

        if (hasMoved) {
          const nextX = currentDx + deltaX;
          const nextY = currentDy + deltaY;
          el.style.setProperty('--dx', `${nextX}px`);
          el.style.setProperty('--dy', `${nextY}px`);
          el.style.transform = `translate(${nextX}px, ${nextY}px) scale(1.05) rotate(var(--drag-rot))`;
        }
      };

      const handlePointerEnd = e => {
        if (!isDown) return;
        isDown = false;

        if (hasMoved) {
          el.classList.remove('is-dragging');
          currentDx += e.clientX - startX;
          currentDy += e.clientY - startY;
          el.dataset.dx = currentDx;
          el.dataset.dy = currentDy;
          el.style.transform = `translate(${currentDx}px, ${currentDy}px) rotate(var(--rot))`;
        } else {
          const idx = parseInt(el.dataset.idx, 10);
          openViewer(idx);
        }
      };

      el.onpointerup = handlePointerEnd;
      el.onpointercancel = handlePointerEnd;
    });
  }

  /* ---------------------------------------------------------
     LIGHTBOX / PHOTO VIEWER
     --------------------------------------------------------- */
  const viewer = $('#mw-viewer');
  const viewerImg = $('#mw-viewer-img');
  const viewerCap = $('#mw-viewer-cap');
  const viewerBy = $('#mw-viewer-by');
  let lastActiveEl = null;

  function openViewer(idx) {
    const list = getStoredMemories();
    const item = list[idx];
    if (!item || !viewer) return;

    // Skip lightbox for text notes so text isn't treated like a broken image
    if (item.type === 'note' || (!item.src && item.text)) return;

    lastActiveEl = document.activeElement;
    viewerImg.src = item.src;
    viewerImg.alt = item.cap || 'Wedding photograph';
    viewerCap.textContent = item.cap || '';
    viewerBy.textContent = item.by ? `Shared by ${item.by}` : (item.event ? `Celebration: ${item.event}` : '');

    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    const closeBtn = viewer.querySelector('.mw-viewer-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeViewer() {
    if (!viewer || !viewer.classList.contains('is-open')) return;
    viewer.classList.remove('is-open');
    viewer.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (viewerImg) viewerImg.src = '';
    if (lastActiveEl) lastActiveEl.focus();
  }

  if (viewer) {
    viewer.addEventListener('click', e => {
      if (e.target.matches('.mw-viewer-backdrop') || e.target.closest('.mw-viewer-close')) {
        closeViewer();
      }
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && viewer.classList.contains('is-open')) {
        closeViewer();
      }
    });
  }

  /* ---------------------------------------------------------
     GUEST CONTRIBUTION (Add to Wall)
     --------------------------------------------------------- */
  if (addBtn && fileIn) {
    addBtn.addEventListener('click', () => {
      const file = fileIn.files && fileIn.files[0];
      const cap = (capIn ? capIn.value.trim() : '');
      const by = (nameIn ? nameIn.value.trim() : '');
      const event = (catSel ? catSel.value : '');

      if (!file) {
        if (fileTxt) {
          fileTxt.textContent = 'Please choose a memory first!';
          setTimeout(() => { fileTxt.textContent = 'Choose a photograph or video'; }, 2400);
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const newPhoto = {
          src: e.target.result,
          cap: cap || (event ? `${event} moment` : 'A quiet memory'),
          by: by || 'Guest',
          event: event || '',
          pos: '50% 50%',
          time: Date.now()
        };

        if (typeof store !== 'undefined') {
          store.photos = store.photos || [];
          store.photos.push(newPhoto);
          if (typeof save === 'function') save();
        }

        renderWall();

        fileIn.value = '';
        if (nameIn) nameIn.value = '';
        if (capIn) capIn.value = '';
        if (fileTxt) fileTxt.textContent = 'Choose a photograph or video';

        if (typeof rain === 'function') {
          rain('petal.png', 12, 22, 4);
        }

        const allItems = wall.querySelectorAll('.mw-item');
        const newest = allItems[allItems.length - 1];
        if (newest) {
          newest.classList.add('mw-revealed', 'mw-newly-pinned');
          newest.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Window resize & fonts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderWall, 200);
  });

  if (document.fonts) {
    document.fonts.ready.then(renderWall);
  } else {
    window.addEventListener('load', renderWall);
  }

  // Expose renderWall globally so blessings.js can refresh the wall
  window.renderWall = renderWall;

  renderWall();
})();