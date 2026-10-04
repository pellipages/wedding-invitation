/* =========================================================
   CAPTURED BY YOU — Guest Memory Contribution Engine
   Handles event options, thumbnail previews, submission,
   and dynamic pinning to #wall while preserving all IDs.
   ========================================================= */
(() => {
  const fileIn = $('#ph');
  const nameIn = $('#pn');
  const catSel = $('#pc');
  const capIn = $('#pcap');
  const addBtn = $('#padd');
  const fileTxt = $('#pfiletxt');
  const prevBox = $('#p-prev-box');

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));

  // 1. Populate celebration dropdown from EVENTS in data.js
  if (catSel && typeof EVENTS !== 'undefined') {
    catSel.innerHTML = '<option value="">All celebrations</option>' +
      EVENTS.map(e => `<option value="${esc(e.n)}">${esc(e.t)} · ${esc(e.n)}</option>`).join('');
  }

  // 2. Real-time file picker thumbnail & label preview
  if (fileIn) {
    fileIn.addEventListener('change', () => {
      const file = fileIn.files && fileIn.files[0];
      if (!file) {
        if (fileTxt) fileTxt.textContent = 'Attach a photograph or video';
        if (prevBox) prevBox.innerHTML = '<span class="cby-plus-icon">✦</span>';
        return;
      }

      if (fileTxt) fileTxt.textContent = file.name;

      if (file.type.startsWith('image/') && prevBox) {
        const tempReader = new FileReader();
        tempReader.onload = ev => {
          prevBox.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
        };
        tempReader.readAsDataURL(file);
      } else if (prevBox) {
        prevBox.innerHTML = '<span class="cby-plus-icon">✓</span>';
      }
    });
  }

  // 3. Contribution Submission Handler
  if (addBtn && fileIn) {
    addBtn.addEventListener('click', () => {
      const file = fileIn.files && fileIn.files[0];
      const cap = (capIn ? capIn.value.trim() : '');
      const by = (nameIn ? nameIn.value.trim() : '');
      const event = (catSel ? catSel.value : '');

      if (!file) {
        if (fileTxt) {
          const original = fileTxt.textContent;
          fileTxt.textContent = 'Please choose a memory first!';
          setTimeout(() => { fileTxt.textContent = original; }, 2200);
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

        // Save to central store
        if (typeof store !== 'undefined') {
          store.photos = store.photos || [];
          store.photos.push(newPhoto);
          if (typeof save === 'function') save();
        }

        // Re-render the memory wall
        if (typeof window.renderWall === 'function') {
          window.renderWall();
        } else {
          // Dispatch a custom event in case moments.js listens for updates
          window.dispatchEvent(new CustomEvent('momentAdded'));
        }

        // Reset slip form fields
        fileIn.value = '';
        if (nameIn) nameIn.value = '';
        if (capIn) capIn.value = '';
        if (fileTxt) fileTxt.textContent = 'Attach a photograph or video';
        if (prevBox) prevBox.innerHTML = '<span class="cby-plus-icon">✦</span>';

        // Festive shower effect
        if (typeof rain === 'function') {
          rain('petal.png', 14, 24, 4);
        }

        // Smoothly bring the newly pinned memory into focus
        const wall = $('#wall');
        if (wall) {
          const allItems = wall.querySelectorAll('.mw-item');
          const newest = allItems[allItems.length - 1];
          if (newest) {
            newest.classList.add('mw-revealed', 'mw-newly-pinned');
            newest.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      };

      reader.readAsDataURL(file);
    });
  }
})();