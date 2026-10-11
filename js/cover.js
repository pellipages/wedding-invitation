/* cover.js — "Tap the doors to open the gates".
   One tap starts the song and the intro video together, then the cover opens onto the video.
   The song (js/music.js) keeps playing through the intro, Ganesha and the site. */
(function () {
    'use strict';

    var cover = document.getElementById('cover');
    if (!cover) { return; }

    var gate  = document.getElementById('coverGate');
    var hint  = document.getElementById('coverHint');
    var video = document.getElementById('introVideo');
    var used  = false;

    function open() {
        if (used) { return; }
        used = true;

        // Both calls must happen synchronously inside the tap, or the browser may refuse sound/playback.
        if (window.weddingMusic) { window.weddingMusic.begin(); }
        if (video) {
            try {
                var p = video.play();
                if (p && typeof p.catch === 'function') { p.catch(function () {}); }
            } catch (e) {}
        }

        cover.classList.add('is-leaving');
        cover.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cover-active');
        setTimeout(function () { cover.style.display = 'none'; }, 1500);
    }

    gate.addEventListener('click', open);
    if (hint) { hint.addEventListener('click', open); }
}());
