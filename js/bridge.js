/* bridge.js — connects the locked intro (#opening) to the embedded wedding card (/card).
   It never edits intro code: it only WATCHES #opening for the 'opening-exit' class that
   js/opening.js already adds when the video ends or Skip is pressed. */
(function () {
    'use strict';

    // 0 = card starts fading in under the dissolving video.
    // ~2000 = let the hero invitation image show first, then go to the card.
    var CARD_DELAY_MS = 0;

    var opening = document.getElementById('opening');
    var frame   = document.getElementById('cardFrame');
    var website = document.getElementById('website');
    var video   = document.getElementById('introVideo');

    if (!opening || !frame) { return; }

    /* Injected into the card page only. The card's own envelope screen is replaced by the
       intro video, so hide it; keep <main> hidden until the Ganesha screen has dismissed. */
    var CARD_CSS = [
        '#env{background:none!important}',
        '.envelope,.tap{display:none!important}',
        'main{visibility:hidden}',
        'html.bridge-reveal main{visibility:visible}'
        // If Ganesha vanishes after ~2s instead of staying until ~5s, add this line
        // (the card nests #bless inside #env, and '#env.gone' fades the whole subtree):
        , '#env.gone{opacity:1!important}'
    ].join('');

    var frameReady = false;
    var introDone  = false;
    var started    = false;
    var exitAt     = 0;

    function loadCard() {
        if (!frame.getAttribute('src')) {
            frame.setAttribute('src', frame.getAttribute('data-src'));
        }
    }

    // Start fetching the card once the video is buffered, so it is ready when the intro ends.
    if (video && video.readyState >= 4) {
        loadCard();
    } else {
        if (video) { video.addEventListener('canplaythrough', loadCard, { once: true }); }
        setTimeout(loadCard, 6000);
    }

    frame.addEventListener('load', function () {
        if (!frame.getAttribute('src')) { return; }

        var doc = frame.contentDocument;
        var style = doc.createElement('style');
        style.textContent = CARD_CSS;
        doc.head.appendChild(style);

        frameReady = true;
        tryStart();
    });

    function onIntroExit() {
        if (introDone) { return; }
        introDone = true;
        exitAt = Date.now();
        loadCard();
        tryStart();
    }

    if (opening.classList.contains('opening-exit')) {
        onIntroExit();
    } else {
        new MutationObserver(function (_, obs) {
            if (opening.classList.contains('opening-exit')) {
                obs.disconnect();
                onIntroExit();
            }
        }).observe(opening, { attributes: true, attributeFilter: ['class'] });
    }

    function tryStart() {
        if (started || !frameReady || !introDone) { return; }
        started = true;
        setTimeout(showCard, Math.max(0, CARD_DELAY_MS - (Date.now() - exitAt)));
    }

    function showCard() {
        var doc      = frame.contentDocument;
        var envelope = doc.getElementById('envelope');
        var bless    = doc.getElementById('bless');

        // The card scrolls inside its own frame; stop the page behind it from scrolling.
        if (website) { website.hidden = true; }
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        frame.removeAttribute('aria-hidden');
        frame.classList.add('is-visible');

        if (!envelope || !bless) {
            doc.documentElement.classList.add('bridge-reveal');
            return;
        }

        // Reveal the card's pages when its own script dismisses the Ganesha screen.
        new MutationObserver(function (_, obs) {
            if (bless.classList.contains('dismissed')) {
                doc.documentElement.classList.add('bridge-reveal');
                obs.disconnect();
            }
        }).observe(bless, { attributes: true, attributeFilter: ['class'] });

        // Runs the card's original sequence: Ganesha in -> hold -> dismissed -> pages.
        envelope.click();
    }
}());
