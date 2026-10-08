/* =========================================================
   RSVP — Personal Invitation Threshold Controller
   - Auto petal shower upon scrolling into the section
   - Interactive petal showers on slip selection & confirm
   - Diya brightening & akshintalu particles
   - Preserves store.rsvp, save(), #share, and legacy targets
   - Sends RSVP securely to the server before showing success
   ========================================================= */
(() => {
  const rsvpSection = document.getElementById('rsvp');
  const choiceYes = document.getElementById('rsChoiceYes');
  const choiceSpirit = document.getElementById('rsChoiceSpirit');
  const choicesStage = document.getElementById('rsChoices');
  const formPanel = document.getElementById('rsFormPanel');
  const nameInput = document.getElementById('rn');
  const guestsInput = document.getElementById('rg');
  const notesInput = document.getElementById('rnotes');
  const confirmBtn = document.getElementById('rsConfirmBtn');
  const confirmedMsg = document.getElementById('rsConfirmedMessage');
  const spiritMsg = document.getElementById('rsSpiritMessage');
  const diya = document.getElementById('rsDiya');
  const shareBtn = document.getElementById('share');
  const legacyRt = document.getElementById('rt');
  const honeypot = document.getElementById('rweb');
  const errorMsg = document.getElementById('rsError');

  // One idempotency key per invitation visit.
  // If a request succeeds but the response is lost, retrying won't create
  // a duplicate RSVP in the database.
  const submissionKey =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );

  async function postRsvp(payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({
          key: submissionKey,
          ...payload
        })
      });

      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      if (!response.ok || !data || data.ok !== true) {
        if (response.status === 429) {
          throw new Error('Too many RSVP attempts right now. Please try again in a few minutes.');
        }

        throw new Error('We could not save your RSVP. Please try again.');
      }

      return true;
    } finally {
      clearTimeout(timeout);
    }
  }

  function showError(message) {
    if (!errorMsg) return;
    errorMsg.textContent = message;
    errorMsg.hidden = false;
  }

  function clearError() {
    if (!errorMsg) return;
    errorMsg.hidden = true;
    errorMsg.textContent = '';
  }

  // 1. PETALS ON SCROLL: Shower petals the moment the guest enters RSVP
  if ('IntersectionObserver' in window && rsvpSection) {
    let hasShowered = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasShowered) {
          hasShowered = true;

          if (typeof rain === 'function') {
            rain('petal.png', 22, 24, 4.5);
          }

          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });

    observer.observe(rsvpSection);
  }

  // Helper to light the sacred diya and rain ceremonial rice
  function invokeCeremonyPresence() {
    if (diya) diya.classList.add('lit-warmth');

    if (typeof rain === 'function') {
      rain('akshintalu-particle.png', 40, 12, 3.5);
    }

    if (rsvpSection && typeof lit === 'function') {
      lit(rsvpSection);
    }
  }

  // 2. CHOICE 1: "Yes, I'll be there"
  if (choiceYes) {
    choiceYes.addEventListener('click', () => {
      clearError();
      invokeCeremonyPresence();

      if (typeof rain === 'function') {
        rain('petal.png', 16, 22, 4);
      }

      if (choicesStage) {
        choicesStage.style.opacity = '0';

        setTimeout(() => {
          choicesStage.style.display = 'none';

          if (formPanel) {
            formPanel.style.display = 'block';

            if (nameInput) {
              nameInput.focus();
            }
          }
        }, 500);
      }
    });
  }

  // 3. CONFIRM RSVP SUBMISSION
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      clearError();

      const name = nameInput ? nameInput.value.trim() : '';
      const guestsRaw = guestsInput ? guestsInput.value.trim() || '1' : '1';
      const guests = Number(guestsRaw);
      const notes = notesInput ? notesInput.value.trim() : '';

      if (!name || name.length > 100) {
        showError('Please enter your name.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
        showError('Please enter a valid number of guests (1–10).');
        if (guestsInput) guestsInput.focus();
        return;
      }

      confirmBtn.disabled = true;

      try {
        await postRsvp({
          status: 'attending',
          name,
          guests,
          note: notes,
          website: honeypot ? honeypot.value : ''
        });

        // Keep the existing local state for the invitation's legacy behavior,
        // but only after the server has accepted the RSVP.
        if (typeof store !== 'undefined') {
          store.rsvp = {
            name,
            guests: String(guests),
            notes,
            r: 'joyfully attending',
            time: Date.now()
          };

          if (typeof save === 'function') {
            save();
          }
        }

        // Grand celebration shower of petals and akshintalu
        if (typeof rain === 'function') {
          rain('petal.png', 28, 26, 4.5);
          setTimeout(() => {
            rain('akshintalu-particle.png', 50, 12, 3.5);
          }, 300);
        }

        if (formPanel) {
          formPanel.style.opacity = '0';

          setTimeout(() => {
            formPanel.style.display = 'none';

            if (confirmedMsg) {
              confirmedMsg.style.display = 'block';
            }

            if (legacyRt) {
              legacyRt.textContent =
                `Thank you${name ? ', ' + name : ''} — noted as joyfully attending.`;
            }
          }, 500);
        }
      } catch (error) {
        console.error('RSVP submission failed:', error);
        showError(
          error.name === 'AbortError'
            ? 'The RSVP is taking too long to respond. Please try again.'
            : error.message || 'We could not save your RSVP. Please try again.'
        );
      } finally {
        confirmBtn.disabled = false;
      }
    });
  }

  // 4. CHOICE 2: "I'll be with you in spirit"
  if (choiceSpirit) {
    choiceSpirit.addEventListener('click', async () => {
      clearError();
      invokeCeremonyPresence();

      if (typeof rain === 'function') {
        rain('petal.png', 14, 20, 4);
      }

      if (choiceSpirit) {
        choiceSpirit.disabled = true;
      }

      try {
        await postRsvp({
          status: 'in_spirit',
          website: honeypot ? honeypot.value : ''
        });

        if (typeof store !== 'undefined') {
          store.rsvp = {
            name: 'In spirit',
            guests: '0',
            r: 'in spirit',
            time: Date.now()
          };

          if (typeof save === 'function') {
            save();
          }
        }

        if (choicesStage) {
          choicesStage.style.opacity = '0';

          setTimeout(() => {
            choicesStage.style.display = 'none';

            if (spiritMsg) {
              spiritMsg.style.display = 'block';
            }

            if (legacyRt) {
              legacyRt.textContent = 'Sending love from afar.';
            }
          }, 500);
        }
      } catch (error) {
        console.error('In-spirit RSVP submission failed:', error);

        showError(
          error.name === 'AbortError'
            ? 'The RSVP is taking too long to respond. Please try again.'
            : error.message || 'We could not save your response. Please try again.'
        );

        if (choiceSpirit) {
          choiceSpirit.disabled = false;
        }
      }
    });
  }

  // 5. SHARE INVITATION
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const shareData = {
        title: 'Harika & Prem — Wedding',
        text: 'Our celebration is incomplete without you. Will you join us?',
        url: window.top.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.top.location.href).then(() => {
          shareBtn.textContent = 'Link copied to clipboard ✓';

          setTimeout(() => {
            shareBtn.innerHTML =
              '<span>Share the invitation</span> <span aria-hidden="true">↗</span>';
          }, 3000);
        });
      }
    });
  }
})();
