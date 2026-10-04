/* =========================================================
   RSVP — Personal Invitation Threshold Controller
   - Auto petal shower upon scrolling into the section
   - Interactive petal showers on slip selection & confirm
   - Diya brightening & akshintalu particles
   - Preserves store.rsvp, save(), #share, and legacy targets
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

  // 1. PETALS ON SCROLL: Shower petals the moment the guest enters RSVP
  if ('IntersectionObserver' in window && rsvpSection) {
    let hasShowered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasShowered) {
          hasShowered = true;
          if (typeof rain === 'function') {
            // Petal shower: asset, count, size, duration
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
      invokeCeremonyPresence();

      // Shower a few petals when choosing to attend
      if (typeof rain === 'function') {
        rain('petal.png', 16, 22, 4);
      }

      if (choicesStage) {
        choicesStage.style.opacity = '0';
        setTimeout(() => {
          choicesStage.style.display = 'none';
          if (formPanel) {
            formPanel.style.display = 'block';
            if (nameInput) nameInput.focus();
          }
        }, 500);
      }
    });
  }

  // 3. CONFIRM RSVP SUBMISSION
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const name = nameInput ? nameInput.value.trim() : '';
      const guests = guestsInput ? guestsInput.value.trim() || '1' : '1';
      const notes = notesInput ? notesInput.value.trim() : '';

      if (typeof store !== 'undefined') {
        store.rsvp = {
          name: name,
          guests: guests,
          notes: notes,
          r: 'joyfully attending',
          time: Date.now()
        };
        if (typeof save === 'function') save();
      }

      // Grand celebration shower of petals and akshintalu
      if (typeof rain === 'function') {
        rain('petal.png', 28, 26, 4.5);
        setTimeout(() => rain('akshintalu-particle.png', 50, 12, 3.5), 300);
      }

      if (formPanel) {
        formPanel.style.opacity = '0';
        setTimeout(() => {
          formPanel.style.display = 'none';
          if (confirmedMsg) confirmedMsg.style.display = 'block';
          if (legacyRt) {
            legacyRt.textContent = `Thank you${name ? ', ' + name : ''} — noted as joyfully attending.`;
          }
        }, 500);
      }
    });
  }

  // 4. CHOICE 2: "I'll be with you in spirit"
  if (choiceSpirit) {
    choiceSpirit.addEventListener('click', () => {
      invokeCeremonyPresence();

      if (typeof rain === 'function') {
        rain('petal.png', 14, 20, 4);
      }

      if (typeof store !== 'undefined') {
        store.rsvp = {
          name: 'In spirit',
          guests: '0',
          r: 'in spirit',
          time: Date.now()
        };
        if (typeof save === 'function') save();
      }

      if (choicesStage) {
        choicesStage.style.opacity = '0';
        setTimeout(() => {
          choicesStage.style.display = 'none';
          if (spiritMsg) spiritMsg.style.display = 'block';
          if (legacyRt) {
            legacyRt.textContent = 'Sending love from afar.';
          }
        }, 500);
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
            shareBtn.innerHTML = '<span>Share the invitation</span> <span aria-hidden="true">↗</span>';
          }, 3000);
        });
      }
    });
  }
})();