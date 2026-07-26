/* ===========================================================
   Prototype-X v2
   File: ui.js
   Purpose: Global UI System, DOM Helpers & Interactive FX

   Responsibility:
   - Pure DOM selection, sanitization, and timing utilities.
   - HTML5 Audio Context warming for seamless Web Audio / TTS playback.
   - Theme switching system (dark/light theme with local persistence).
   - Time-aware dynamic greeting engine.
   - Proximity-based chat bubble hover physics.
   - Interactive Robot Eye Physics engine (damped motion, dynamic blinking).

   Author: Refactored Architecture
   =========================================================== */

import { setTheme as setGlobalTheme, THEME, getValidVoice } from './state.js';

/* ===========================================================
   DOM & Math Helpers
   =========================================================== */

export function $(sel) {
  return document.querySelector(sel);
}

export function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function escapeHtml(str) {
  return (str || '').replace(/[&<>"'`]/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;'
    })[m];
  });
}

export function keep(arr, n) {
  return arr.slice(Math.max(0, arr.length - n));
}


/* ===========================================================
   Audio Context Warming System
   =========================================================== */

export function initWarmAudio() {
  let audioWarmed = false;

  function warmAudio() {
    if (audioWarmed) return;
    const el = document.getElementById('ttsPlayer');
    const Ctx = window.AudioContext || window.webkitAudioContext;

    if (Ctx) {
      try {
        const ctx = new Ctx();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        ctx.resume();
        src.start(0);
      } catch (_) {}
    }

    if (el) {
      try {
        el.muted = true;
        el.play()
          .then(() => {
            el.pause();
            el.currentTime = 0;
            el.muted = false;
          })
          .catch(() => {});
      } catch (_) {}
    }

    audioWarmed = true;
  }

  ['click', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, warmAudio, { once: true, passive: true })
  );
}


/* ===========================================================
   Theme System
   =========================================================== */

export function initTheme(themeToggle) {
  const root = document.documentElement;

  function applyTheme(t) {
    if (t === 'light') {
      root.setAttribute('data-theme', 'light');
      if (themeToggle) themeToggle.textContent = '☀';
      setGlobalTheme(THEME.LIGHT);
    } else {
      root.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.textContent = '☾';
      setGlobalTheme(THEME.DARK);
    }
  }

  const saved = localStorage.getItem('px-theme');
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      themeToggle.classList.add('spin');
      const current = root.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'light' ? 'dark' : 'light';
      
      applyTheme(nextTheme);
      localStorage.setItem('px-theme', nextTheme);
      
      setTimeout(() => themeToggle.classList.remove('spin'), 520);
    });
  }
}


/* ===========================================================
   Dynamic Time Greeting Engine
   =========================================================== */

export function initGreeting(greetEl) {
  const timeGreets = {
    morning: [
      "Good morning! Ready to create?",
      "Morning! Let's make something awesome.",
      "Top of the morning — what's the plan?"
    ],
    afternoon: [
      "Good afternoon! What can I do for you?",
      "Hey, afternoon mode on — what's next?",
      "Afternoon! Need a quick helper?"
    ],
    evening: [
      "Good evening! How may I assist?",
      "Evening! Shall we wrap things up?",
      "Evening! What are we building?"
    ],
    night: [
      "Burning the midnight oil? I'm with you.",
      "Late night grind — I've got your back.",
      "Night shift online. What's up?"
    ]
  };

  function getBucket() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 22) return 'evening';
    return 'night';
  }

  function refreshGreeting() {
    const b = getBucket();
    if (greetEl) {
      greetEl.textContent = pick(timeGreets[b]);
    }
  }

  refreshGreeting();
  setInterval(refreshGreeting, 20000);
}


/* ===========================================================
   Proximity Chat Bubble Hover Physics
   =========================================================== */

export function initBubbleHover() {
  let raf = null;

  function allBubbles() {
    return Array.from(document.querySelectorAll('.chat-bubble'));
  }

  document.addEventListener('mousemove', function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      const { clientX: x, clientY: y } = e;
      allBubbles().forEach(b => {
        const r = b.getBoundingClientRect();
        const cx = Math.max(r.left, Math.min(x, r.right));
        const cy = Math.max(r.top, Math.min(y, r.bottom));
        const dist = Math.hypot(x - cx, y - cy);
        if (dist < 150) {
          b.classList.add('near');
        } else {
          b.classList.remove('near');
        }
      });
      raf = null;
    });
  }, { passive: true });
}


/* ===========================================================
   Local Storage Default Initialization & Legacy Sanitization
   =========================================================== */

export function initLocalStorageDefaults() {
  if (!localStorage.getItem("px-lang")) localStorage.setItem("px-lang", "hinglish");
  if (!localStorage.getItem("px-lines")) localStorage.setItem("px-lines", "1");
  if (!localStorage.getItem("px-groq")) localStorage.setItem("px-groq", JSON.stringify([]));
  if (!localStorage.getItem("px-mem")) localStorage.setItem("px-mem", JSON.stringify([]));
  if (!localStorage.getItem("px-thread")) localStorage.setItem("px-thread", JSON.stringify([]));
  
  const savedVoice = localStorage.getItem("px-voice");
  const validVoice = getValidVoice(savedVoice);
  localStorage.setItem("px-voice", validVoice);

  if (!localStorage.getItem("px-theme")) {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    localStorage.setItem("px-theme", prefersLight ? 'light' : 'dark');
  }
}


/* ===========================================================
   Interactive Robot Eye Physics Engine
   =========================================================== */

export function createEyePhysics(hero) {
  if (!hero) {
    console.warn("[UI] Robot Hero element not found for Eye Physics.");
    return { start() {}, stop() {}, setMode() {} };
  }

  const eyes = hero.querySelector('.eyes');
  const leftEye = hero.querySelector('.eye-left');
  const rightEye = hero.querySelector('.eye-right');

  if (!eyes || !leftEye || !rightEye) {
    return { start() {}, stop() {}, setMode() {} };
  }

  let vx = 0, vy = 0, x = 0, y = 0, tx = 0, ty = 0;
  let active = true, raf = null, blinkTimer = null, blinking = false;
  let MODE = 'idle', MOOD = 'neutral';

  const cfgByMood = {
    neutral: { speed: 0.08, damp: 0.85, range: 6 },
    hardcore: { speed: 0.14, damp: 0.75, range: 8 },
    caution: { speed: 0.05, damp: 0.9, range: 4 }
  };

  function scheduleBlink() {
    clearTimeout(blinkTimer);
    const base =
      MODE === 'thinking' ? 4200 :
      MODE === 'listening' ? 8000 :
      MODE === 'speaking' ? 5000 : 3200;
    blinkTimer = setTimeout(() => {
      doBlink();
      scheduleBlink();
    }, base + Math.random() * 2000);
  }

  function doBlink() {
    if (blinking || MODE === 'computing') return;
    blinking = true;
    leftEye.style.transform = rightEye.style.transform = 'scaleY(0.08)';
    setTimeout(() => {
      leftEye.style.transform = rightEye.style.transform = 'scaleY(1)';
      blinking = false;
    }, 120);
  }

  function step() {
    if (!active) return;
    const c = cfgByMood[MOOD] || cfgByMood.neutral;
    vx += (tx - x) * c.speed;
    vy += (ty - y) * c.speed;
    vx *= c.damp;
    vy *= c.damp;
    x += vx;
    y += vy;

    const r = c.range;
    x = Math.max(-r, Math.min(r, x));
    y = Math.max(-r, Math.min(r, y));

    eyes.style.transform = `translate(${x}px, ${y}px)`;
    raf = requestAnimationFrame(step);
  }

  function setTarget(nx, ny) {
    tx = nx;
    ty = ny;
  }

  function setMode({ idle, thinking, listening, speaking, computing, mood }) {
    MOOD = mood || MOOD;
    if (computing) {
      MODE = 'computing';
      setTarget(0, 0);
      clearTimeout(blinkTimer);
      return;
    }

    if (thinking) {
      MODE = 'thinking';
      setTarget(Math.sin(Date.now() / 600) * 4, 0);
    } else if (listening) {
      MODE = 'listening';
      setTarget(0, 1);
    } else if (speaking) {
      MODE = 'speaking';
      setTarget(0, Math.sin(Date.now() / 300) * 1.2);
    } else if (idle) {
      MODE = 'idle';
      setTarget((Math.random() * 2 - 1) * 3, (Math.random() * 2 - 1) * 2);
    }
    scheduleBlink();
  }

  function start() {
    if (raf) return;
    active = true;
    scheduleBlink();
    step();
  }

  function stop() {
    active = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    clearTimeout(blinkTimer);
    eyes.style.transform = 'translate(0,0)';
  }

  document.addEventListener('mousemove', e => {
    if (MODE !== 'idle') return;
    const r = hero.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    setTarget(dx * 6, dy * 4);
  }, { passive: true });

  return { start, stop, setMode };
}

export default {
  $,
  $all,
  clamp,
  getTime,
  pick,
  escapeHtml,
  keep,
  initWarmAudio,
  initTheme,
  initGreeting,
  initBubbleHover,
  initLocalStorageDefaults,
  createEyePhysics
};
