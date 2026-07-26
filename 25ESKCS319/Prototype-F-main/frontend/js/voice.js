/* ===========================================================
   Prototype-X v2
   File: voice.js
   Purpose: Speech Recognition & Kokoro Text-to-Speech Engine Pipeline

   Responsibility:
   - Chunking large response text for low-latency parallel TTS synthesis.
   - Sequential audio playback with queueing & memory-leak-safe URL revocation.
   - Overlap prevention & audio interruption cleanup.
   - Web Speech API synthesis fallback if Kokoro backend is offline.
   - Web Speech API setup for chat bar microphone input.
   - Jarvis Fullscreen Voice Mode Speech Recognition factory.

   Author: Refactored Architecture
   ============================================================ */

import { fetchTtsChunk } from './api.js';
import { STATE, TTS_VOICE, getValidVoice } from './state.js';

let refreshHero = null;
let currentBlobUrls = new Set();
let currentAudioQueue = [];
let isPlaybackActive = false;

/**
 * Initializes voice module dependencies.
 * @param {object} deps Dependency injection map ({ refreshHero }).
 */
export function initVoice(deps) {
  refreshHero = deps.refreshHero;
}

/**
 * Cleans up and revokes all active Blob URLs to prevent memory leaks.
 */
function cleanupBlobUrls() {
  currentBlobUrls.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {}
  });
  currentBlobUrls.clear();
}

/**
 * Immediately stops any playing TTS audio and resets playback state.
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  const player = document.getElementById('ttsPlayer');
  if (player) {
    try {
      player.pause();
      player.currentTime = 0;
      player.removeAttribute('src');
    } catch (_) {}
  }

  currentAudioQueue = [];
  isPlaybackActive = false;
  cleanupBlobUrls();
  STATE.speaking = false;
  if (refreshHero) refreshHero();
}

/**
 * Splits text into optimal length chunks for backend TTS generation.
 * @param {string} s Input string.
 * @param {number} maxLenFirst Max character length of first chunk (280 chars).
 * @param {number} maxLenNext Max character length of subsequent chunks (900 chars).
 * @returns {Array<string>} Array of text chunks.
 */
function chunkForFrontend(s, maxLenFirst = 280, maxLenNext = 900) {
  s = (s || "").replace(/\r/g, "").trim();
  if (!s) return [];

  const chunks = [];
  const take = (src, limit) => {
    if (src.length <= limit) return [src, ""];
    let i = src.lastIndexOf('.', limit);
    if (i < limit * 0.5) i = src.lastIndexOf(' ', limit);
    if (i <= 0) i = limit;
    return [src.slice(0, i + 1).trim(), src.slice(i + 1).trim()];
  };

  let [first, rest] = take(s, maxLenFirst);
  chunks.push(first);

  while (rest.length) {
    let part;
    [part, rest] = take(rest, maxLenNext);
    chunks.push(part);
  }

  return chunks;
}

/**
 * Speaks text using Kokoro TTS engine with audio streaming queue and URL cleanup.
 * Falls back to Web Speech Synthesis if Kokoro backend is unavailable.
 * @param {string} text Text to synthesize.
 * @param {Function|null} onEnd Completion callback.
 * @returns {Promise<void>}
 */
export function speakText(text, onEnd) {
  return new Promise(async (resolve) => {
    if (!text) {
      if (onEnd) onEnd();
      resolve();
      return;
    }

    // Stop any existing speech to prevent overlapping playback
    stopSpeaking();

    STATE.speaking = true;
    if (refreshHero) refreshHero();

    const cleanText = text.replace(/__SYSTEM__/g, '').trim();

    try {
      const parts = chunkForFrontend(cleanText);
      if (!parts.length) {
        stopSpeaking();
        if (onEnd) onEnd();
        resolve();
        return;
      }

      const player = document.getElementById('ttsPlayer');
      if (!player) {
        throw new Error("#ttsPlayer element missing");
      }

      currentAudioQueue = [];
      isPlaybackActive = true;
      let playing = false;

      function finishPlayback() {
        isPlaybackActive = false;
        cleanupBlobUrls();
        STATE.speaking = false;
        if (refreshHero) refreshHero();
        if (onEnd) onEnd();
        resolve();
      }

      function playNext() {
        if (!isPlaybackActive) return;
        const nextUrl = currentAudioQueue.shift();
        if (!nextUrl) {
          playing = false;
          finishPlayback();
          return;
        }

        playing = true;
        player.muted = false;
        player.volume = 1.0;
        player.src = nextUrl;
        player.play().catch(e => {
          console.warn("[Voice] Audio play blocked or interrupted:", e);
          if (currentAudioQueue.length) playNext();
          else finishPlayback();
        });
      }

      player.onended = () => {
        try {
          if (player.src && player.src.startsWith("blob:")) {
            URL.revokeObjectURL(player.src);
            currentBlobUrls.delete(player.src);
          }
        } catch (e) {}

        if (currentAudioQueue.length) {
          playNext();
        } else {
          playing = false;
          finishPlayback();
        }
      };

      player.onerror = (err) => {
        console.error("[Voice] Player playback error:", err);
        try {
          if (player.src && player.src.startsWith("blob:")) {
            URL.revokeObjectURL(player.src);
            currentBlobUrls.delete(player.src);
          }
        } catch (e) {}

        if (currentAudioQueue.length) {
          playNext();
        } else {
          playing = false;
          finishPlayback();
        }
      };

      // Single Source of Truth for Voice Selection
      const rawVoice = STATE.selectedVoice || TTS_VOICE || localStorage.getItem('px-voice') || "af_heart";
      const selectedVoiceModel = getValidVoice(rawVoice);

      // Fetch first audio chunk for instant low-latency playback
      const firstUrl = await fetchTtsChunk(parts[0], selectedVoiceModel);
      currentBlobUrls.add(firstUrl);
      currentAudioQueue.push(firstUrl);
      if (!playing) playNext();

      // Parallel worker pool to pre-fetch remaining chunks
      const concurrency = 3;
      let index = 1;
      async function worker() {
        while (index < parts.length && isPlaybackActive) {
          const i = index++;
          try {
            const url = await fetchTtsChunk(parts[i], selectedVoiceModel);
            if (isPlaybackActive) {
              currentBlobUrls.add(url);
              currentAudioQueue.push(url);
              if (!playing) playNext();
            } else {
              URL.revokeObjectURL(url);
            }
          } catch (e) {
            console.error(`[Voice] Chunk ${i} fetch failed:`, e);
          }
        }
      }

      const workers = Array(Math.min(concurrency, Math.max(1, parts.length - 1)))
        .fill(0)
        .map(() => worker());

      await Promise.all(workers);
    } catch (e) {
      console.warn('[Voice] Kokoro Backend TTS unavailable, using Web Speech API fallback:', e);
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.onend = utterance.onerror = () => {
            STATE.speaking = false;
            if (refreshHero) refreshHero();
            if (onEnd) onEnd();
            resolve();
          };
          window.speechSynthesis.speak(utterance);
          return;
        } catch (err) {
          console.error('[Voice] Web Speech Synthesis failed:', err);
        }
      }
      stopSpeaking();
      if (onEnd) onEnd();
      resolve();
    }
  });
}

/**
 * Speech Recognition setup for main input bar mic button.
 * @param {HTMLElement} micBtn Mic toggle button.
 * @param {HTMLTextAreaElement} input Main textarea input.
 * @param {HTMLElement} sendBtn Send button.
 * @returns {object|null} Recognition controller interface.
 */
export function setupSpeechRecognition(micBtn, input, sendBtn) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("[Voice] Web Speech API SpeechRecognition is not supported in this browser.");
    return null;
  }

  const LANGS = ["en-IN", "en-US"];
  let langIdx = 0;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = LANGS[langIdx];

  let listening = false;
  let finalText = "";

  function startRec() {
    if (listening) return;
    try {
      recognition.lang = LANGS[langIdx];
      recognition.start();
      listening = true;
      STATE.mic = true;
      STATE.typing = true;
      if (refreshHero) refreshHero();
      if (input) input.placeholder = "Boliyé… (Hinglish: en-IN)";
    } catch (e) {
      console.error('[Voice] startRec error:', e);
    }
  }

  function stopRec() {
    if (!listening) return;
    try {
      recognition.stop();
    } catch (e) {
      console.error('[Voice] stopRec error:', e);
    }
    listening = false;
    STATE.mic = false;
    if (refreshHero) refreshHero();
    if (input) input.placeholder = "Ask me anything...";
  }

  if (micBtn) {
    const micMutObserver = new MutationObserver(() => {
      const jarvisActive = document.getElementById('jarvisOverlay')?.classList.contains('active');
      if (jarvisActive) return;
      if (micBtn.classList.contains('active')) {
        startRec();
      } else {
        stopRec();
      }
    });

    micMutObserver.observe(micBtn, { attributes: true, attributeFilter: ['class'] });
  }

  recognition.onresult = function (evt) {
    let interim = "";
    for (let i = evt.resultIndex; i < evt.results.length; i++) {
      const t = evt.results[i][0].transcript;
      if (evt.results[i].isFinal) {
        finalText += t + " ";
      } else {
        interim += t;
      }
    }

    const latinOnly = (finalText + interim).replace(/[^\x00-\x7E]+/g, " ").replace(/\s+/g, " ").trim();
    if (input) {
      input.value = latinOnly;
      try {
        input.selectionStart = input.selectionEnd = input.value.length;
      } catch (e) {}
    }
  };

  recognition.onend = function () {
    if (micBtn && micBtn.classList.contains('active')) {
      setTimeout(() => {
        try { recognition.start(); } catch (e) {}
      }, 150);
    } else {
      listening = false;
    }
  };

  recognition.onerror = function (e) {
    console.warn('[Voice] recognition.onerror:', e);
    if (["no-speech", "audio-capture", "not-allowed", "service-not-allowed"].includes(e.error)) {
      stopRec();
      return;
    }
    langIdx = (langIdx + 1) % LANGS.length;
    if (micBtn && micBtn.classList.contains('active')) {
      try { recognition.stop(); } catch (e) {}
      setTimeout(startRec, 200);
    }
  };

  if (sendBtn) {
    sendBtn.addEventListener('click', stopRec);
  }

  return {
    recognition,
    startRec,
    stopRec,
    getFinalText: () => finalText,
    resetFinalText: () => { finalText = ""; }
  };
}

/**
 * Creates specialized Speech Recognition instance for Jarvis Fullscreen Voice Mode.
 * @returns {object|null} Jarvis Speech Recognition interface.
 */
export function createJarvisRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("[Voice] Jarvis SpeechRecognition not supported.");
    return null;
  }

  const LANGS = ["en-IN", "en-US"];
  let langIdx = 0;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = LANGS[langIdx];

  let onResult = null;
  let onEnd = null;
  let finalText = "";

  recognition.onresult = function (evt) {
    let interim = "";
    for (let i = evt.resultIndex; i < evt.results.length; i++) {
      const t = evt.results[i][0].transcript;
      if (evt.results[i].isFinal) {
        finalText += t + " ";
      } else {
        interim += t;
      }
    }

    const text = (finalText + interim).replace(/[^\x00-\x7E]+/g, " ").replace(/\s+/g, " ").trim();
    if (onResult) {
      onResult(text, evt.results[evt.results.length - 1]?.isFinal);
    }
  };

  recognition.onend = function () {
    const finalQuery = finalText.trim();
    finalText = "";
    if (onEnd) {
      onEnd(finalQuery);
    }
  };

  recognition.onerror = function (e) {
    console.warn('[Voice] Jarvis recognition error:', e);
    finalText = "";
    if (onEnd) {
      onEnd("");
    }
  };

  return {
    start() {
      finalText = "";
      try {
        recognition.start();
      } catch (e) {
        console.error("[Voice] Jarvis recognition start error:", e);
      }
    },
    stop() {
      try {
        recognition.stop();
      } catch (e) {}
    },
    setOnResult(fn) {
      onResult = fn;
    },
    setOnEnd(fn) {
      onEnd = fn;
    }
  };
}

export default {
  initVoice,
  speakText,
  stopSpeaking,
  setupSpeechRecognition,
  createJarvisRecognition
};
