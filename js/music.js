/* music.js — background music for the invitation.
   - Starts when the guest taps the cover (js/cover.js calls window.weddingMusic.begin() from inside
     that tap) and then plays straight through the intro, Ganesha and the site. begin() is safe to
     call again (the Ganesha tap still does), it never restarts the song.
   - Loops quietly, fades in, and never touches any existing element: the only thing it adds is one
     small fixed mute/unmute button (top-right) that sits above everything and takes no layout space.
   - Light on purpose: the file is not downloaded until the guest enters (preload "none"), it is
     streamed by the browser's own audio element (no decoding in JavaScript), and there are no timers
     running except a ~2 second fade-in.
   - Browsers refuse to play sound before the guest has touched the page. If that happens we wait,
     and the very next tap/click/keypress (on the page OR inside the card) starts the music. */
(function () {
    'use strict';

    var SRC = 'assets/rama_chakkani_seetha.mp3';   // put the converted file here
    var VOLUME = 0.55;                              // 0 to 1
    var FADE_MS = 2200;

    var frame   = document.getElementById('cardFrame');

    var audio = null;
    var entered = false;     // guest is past the intro
    var playing = false;     // sound is actually coming out
    var pending = false;     // a play() request is in flight
    var userMuted = false;   // guest switched it off with the button
    var resumeOnShow = false;
    var fadeTimer = 0;
    var GESTURES = ['pointerup', 'mousedown', 'touchend', 'keydown', 'click'];
    var armedDocs = [];

    /* ---------- the one small button ---------- */

    var style = document.createElement('style');
    style.textContent =
        '.music-btn{position:fixed;z-index:9500;top:calc(env(safe-area-inset-top,0px) + 12px);' +
        'right:calc(env(safe-area-inset-right,0px) + 12px);width:40px;height:40px;padding:0;margin:0;' +
        'border-radius:50%;border:1px solid rgba(106,30,43,.28);background:rgba(246,240,227,.88);' +
        'color:#6A1E2B;display:flex;align-items:center;justify-content:center;cursor:pointer;' +
        'box-shadow:0 2px 8px rgba(0,0,0,.18);opacity:0;visibility:hidden;transition:opacity .6s ease;' +
        '-webkit-tap-highlight-color:transparent}' +
        '.music-btn.is-on{opacity:.9;visibility:visible}' +
        '.music-btn:hover{opacity:1}' +
        '.music-btn:focus-visible{outline:2px solid #6A1E2B;outline-offset:3px}' +
        '.music-btn svg{width:20px;height:20px;display:block}' +
        '.music-btn .m-off{display:none}' +
        '.music-btn.is-muted .m-on{display:none}.music-btn.is-muted .m-off{display:block}' +
        /* a soft ring while the browser is waiting for the first tap (transform/opacity only: no repaint) */
        '.music-btn:after{content:"";position:absolute;inset:-1px;border-radius:50%;' +
        'border:1px solid rgba(106,30,43,.5);opacity:0;pointer-events:none}' +
        '.music-btn.is-waiting:after{animation:musicRing 2.4s ease-out infinite}' +
        '@keyframes musicRing{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.7);opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.music-btn.is-waiting:after{animation:none;opacity:.6}}';
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'music-btn is-muted';
    btn.setAttribute('aria-label', 'Play music');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML =
        '<svg class="m-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/>' +
        '<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>' +
        '<svg class="m-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
    document.body.appendChild(btn);

    function paintButton() {
        var on = playing;
        btn.classList.toggle('is-muted', !on);
        btn.classList.toggle('is-waiting', entered && !on && !userMuted);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.setAttribute('aria-label', on ? 'Mute music' : 'Play music');
    }

    /* ---------- audio ---------- */

    function ensureAudio() {
        if (audio) { return audio; }
        audio = new Audio();
        audio.preload = 'none';      // nothing is fetched until we really start
        audio.loop = true;
        audio.volume = 0;
        audio.src = SRC;
        audio.addEventListener('error', function () {
            playing = false; pending = false; paintButton();
        });
        return audio;
    }

    function fadeIn() {
        clearInterval(fadeTimer);
        var steps = 22, i = 0;
        fadeTimer = setInterval(function () {
            i++;
            try { audio.volume = Math.min(VOLUME, VOLUME * (i / steps)); } catch (e) {}
            if (i >= steps) { clearInterval(fadeTimer); }
        }, FADE_MS / steps);
    }

    function start() {
        if (!entered || userMuted || playing || pending) { return; }
        var a = ensureAudio();
        var p;
        try { p = a.play(); } catch (e) { p = null; }
        if (!p || typeof p.then !== 'function') { return; }
        pending = true;
        p.then(function () {
            pending = false; playing = true;
            disarm();
            fadeIn();
            paintButton();
        }, function () {
            pending = false; playing = false;   // blocked until the guest touches something
            arm();
            paintButton();
        });
    }

    function stop() {
        clearInterval(fadeTimer);
        if (audio) { audio.pause(); }
        playing = false; pending = false;
        paintButton();
    }

    /* ---------- waiting for the first tap (works on the page and inside the card) ---------- */

    function onGesture(e) {
        // a tap on our own button is handled by the button itself (so it can't start and then mute in one tap)
        if (e && e.target && btn.contains(e.target)) { return; }
        start();
    }

    function armDoc(doc) {
        if (!doc || armedDocs.indexOf(doc) !== -1) { return; }
        armedDocs.push(doc);
        GESTURES.forEach(function (t) { doc.addEventListener(t, onGesture, true); });
    }

    function arm() {
        armDoc(document);
        try { if (frame && frame.contentDocument && frame.getAttribute('src')) { armDoc(frame.contentDocument); } } catch (e) {}
    }

    function disarm() {
        armedDocs.forEach(function (doc) {
            try { GESTURES.forEach(function (t) { doc.removeEventListener(t, onGesture, true); }); } catch (e) {}
        });
        armedDocs = [];
    }

    // The card loads later inside the frame; if we are still waiting, listen there too.
    if (frame) {
        frame.addEventListener('load', function () {
            if (entered && !playing && !userMuted) { arm(); }
        });
    }

    /* ---------- when does it begin? ---------- */

    // The music begins on the guest's tap on the cover gate (js/cover.js). card/js/intro.js also calls
    // weddingMusic.begin() when the blessing starts, which is a no-op if music is already going.
    // If a browser still refuses sound, start() arms the tap-anywhere fallback.
    function enter() {
        if (entered) { return; }
        entered = true;
        btn.classList.add('is-on');
        paintButton();
        start();
    }

    window.weddingMusic = { begin: enter };

    /* ---------- the button ---------- */    /* ---------- the button ---------- */

    btn.addEventListener('click', function () {
        if (playing) {
            userMuted = true;
            stop();
        } else {
            userMuted = false;
            entered = true;
            start();
            paintButton();
        }
    });

    /* ---------- be polite: pause when the guest leaves the tab or locks the phone ---------- */

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (playing) { resumeOnShow = true; audio.pause(); playing = false; paintButton(); }
        } else if (resumeOnShow) {
            resumeOnShow = false;
            if (!userMuted) { start(); }
        }
    });
}());
