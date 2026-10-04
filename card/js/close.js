/* =========================================================
   CLOSING — Atmosphere Controller
   Quiet presence. Zero UI forms, buttons, or tasks.
   ========================================================= */
(() => {
  const closeSection = document.getElementById('close');
  if (!closeSection) return;

  // Gentle, sparse drift of petals upon arriving at the back cover
  if ('IntersectionObserver' in window) {
    let triggered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          if (typeof rain === 'function') {
            rain('petal.png', 8, 22, 7);
          }
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });

    observer.observe(closeSection);
  }
})();