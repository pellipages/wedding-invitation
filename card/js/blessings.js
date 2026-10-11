/* =========================================================
   SEND YOUR BLESSINGS — Physical Stationery
   - Folds letter gently in 3D
   - Showers akshintalu particles and petals
   - Sends the blessing to /api/blessing (private; read in /admin/blessings)
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

  const errEl = document.getElementById('blErr');
  const showError = msg => { if (errEl) { errEl.textContent = msg; errEl.hidden = false; } };
  const clearError = () => { if (errEl) { errEl.hidden = true; errEl.textContent = ''; } };

  // One idempotency key per blessing. If a request succeeds but the response is lost, retrying
  // the same blessing won't create a duplicate row. It is rotated after each successful send,
  // so a second, different blessing from the same guest gets its own key.
  const newKey = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  let submissionKey = newKey();

  // Sends the blessing to the server (api/blessing.js). `name` is '' when anonymous.
  async function postBlessing(name, message) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('/api/blessing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({ key: submissionKey, name, message })
      });
      let data = null;
      try { data = await response.json(); } catch (_) { data = null; }
      if (!response.ok || !data || data.ok !== true) {
        if (response.status === 429) {
          throw new Error('Too many blessings from this connection right now. Please try again in a few minutes.');
        }
        throw new Error('We could not send your blessing. Please try again.');
      }
      return true;
    } catch (err) {
      if (err && err.name === 'AbortError') {
        throw new Error('That took too long. Please check your connection and try again.');
      }
      if (err instanceof TypeError) { // network failure
        throw new Error('We could not reach the server. Please check your connection and try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  let sending = false;

  sendBtn.addEventListener('click', async () => {
    if (sending) return;
    const message = msgInput.value.trim();
    if (!message) {
      msgInput.focus();
      return;
    }

    const isAnon = (anonCheck && anonCheck.checked) || !nameInput.value.trim();
    const author = isAnon ? 'A Well-Wisher' : nameInput.value.trim();

    // 0. Send to the server FIRST. Nothing is shown as "received" unless it really was.
    //    On failure the guest's words stay in the box so nothing is lost.
    clearError();
    sending = true;
    sendBtn.disabled = true;
    try {
      await postBlessing(isAnon ? '' : nameInput.value.trim(), message);
    } catch (err) {
      showError(err.message || 'We could not send your blessing. Please try again.');
      sending = false;
      sendBtn.disabled = false;
      return;
    }
    submissionKey = newKey();
    sending = false;

    // 1. The blessing now lives only on the server (visible in /admin/blessings).
    //    It is deliberately NOT pinned to the guest-facing memory wall.

    // 2. Gentle folding animation
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

    // 3. Sacred Akshantalu & petal rain ritual
    if (typeof rain === 'function') {
      rain('akshintalu-particle.webp', 90, 14, 4);
      setTimeout(() => rain('petal.webp', 16, 24, 5), 500);
    }

    const section = document.getElementById('blessings');
    if (section && typeof lit === 'function') {
      lit(section);
    }

    // 4. Reveal the emotional payoff
    setTimeout(() => {
      if (paper) paper.style.display = 'none';
      if (actionArea) actionArea.style.display = 'none';
      if (doneMsg) doneMsg.style.display = 'block';

      // Keep legacy #bt populated for existing listeners
      const bt = document.getElementById('bt');
      if (bt) bt.textContent = `Received — ${author}`;
    }, 1100);
  });
})();