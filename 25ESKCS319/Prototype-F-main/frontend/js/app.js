/* ===========================================================
   Prototype-X v2
   File: app.js
   Purpose: Application Bootstrap & Dependency Wiring Engine

   Responsibility:
   - Queries and caches DOM element references ONCE at startup.
   - Wires up module dependencies cleanly via dependency injection.
   - Initializes Eye Physics math engine, reactive state, themes, and audio context.
   - Exposes global setStatus function for verbatim bot state switching.
   - Synchronizes bot animations and personality eye colors across hero & overlay.
   - Formats professional UI labels ('Assistant', 'Professional', 'Direct') mapped to backend params.
   - Manages single source of truth for local Kokoro voices.

   Author: Refactored Architecture
   =========================================================== */

import { STATE, CURRENT_MOOD, setCurrentMood, initializeState, subscribe, getValidVoice } from './state.js';
import { KOKORO_VOICES } from './config.js';
import {
  initWarmAudio, initTheme, initGreeting, initBubbleHover,
  initLocalStorageDefaults, createEyePhysics, $all
} from './ui.js';
import {
  initChat, initBotActions, initInputHandlers, initPlusMenu,
  initChatStorage, addMoodSystemBubble, loadChat
} from './chat.js';
import { initMemory, updateMemoryBadge } from './memory.js';
import { initSidebar, renderChatList } from './sidebar.js';
import { initVoice, speakText, setupSpeechRecognition } from './voice.js';
import { initJarvis } from './jarvis.js';

/**
 * Global setStatus implementation verbatim as provided in user specification.
 * Updates state classes on both the hero bot and the Jarvis overlay bot.
 * @param {string} newstatus Status class name to apply ('speaking', 'thinking', 'listening', 'computing', '')
 */
export function setStatus(newstatus) {
  const targets = [document.getElementById('bot'), document.getElementById('JarvisBot')].filter(Boolean);
  targets.forEach(botEl => {
    botEl.classList.remove("speaking", "thinking", "listening", "computing");
    if (newstatus) {
      botEl.classList.add(newstatus);
    }
  });
}
window.setStatus = setStatus;

document.addEventListener('DOMContentLoaded', function () {
  // Initialize state and local storage defaults
  initializeState();
  initLocalStorageDefaults();
  initWarmAudio();

  // Cache DOM references (Single Source Query)
  const chat = document.getElementById('chatContainer');
  const input = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const micBtn = document.getElementById('micBtn');
  const attachBtn = document.getElementById('attachBtn');
  const plusMenu = document.getElementById('plusMenu');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const hiddenFile = document.getElementById('hiddenFile');
  const greetEl = document.getElementById('greetText');
  const hero = document.getElementById('bot') || document.getElementById('BotHeadHero');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  const backdrop = document.getElementById('backdrop');
  const themeToggle = document.getElementById('themeToggle');
  const voiceTile = document.getElementById('voiceTile');
  const voiceOptions = document.getElementById('voiceOptions');
  const memoryQuickText = document.getElementById('memoryQuickText');
  const memoryTile = document.getElementById("memoryTile");
  const memoryPanel = document.getElementById("memoryPanel");
  const memClose = document.getElementById("memClose");
  const memList = document.getElementById("memList");
  const memInput = document.getElementById("memInput");
  const memAddBtn = document.getElementById("memAddBtn");
  const langTile = document.getElementById('langTile');
  const lenTile = document.getElementById('lenTile');
  const langPanel = document.getElementById('langPanel');
  const lenPanel = document.getElementById('lenPanel');
  const lenCurrent = document.getElementById('lenCurrent');
  const lenSlider = document.getElementById('lenSlider');
  const langCurrent = document.getElementById('langCurrent');
  const moodPanel = document.getElementById('moodPanel');
  const modeTile = document.getElementById('modeTile');
  const modeCurrent = document.getElementById('modeCurrent');
  const voiceCurrentEl = document.getElementById('voiceCurrent');
  const historyTile = document.getElementById("historyTile");
  const historyContainer = document.getElementById("historyContainer");
  const newChatTile = document.getElementById("newChatTile");

  // Initialize Interactive Eye Physics
  const EyePhysics = createEyePhysics(hero);

  /**
   * Refreshes Robot Hero visuals and Eye Physics mode based on current state.
   * Syncs both main hero bot and Jarvis overlay bot face simultaneously.
   */
  function refreshHero() {
    const activity =
      STATE.thinking ? 'thinking' :
      STATE.speaking ? 'speaking' :
      (STATE.typing && !STATE.mic) ? 'computing' :
      STATE.mic ? 'listening' : '';

    setStatus(activity);

    const moodName = CURRENT_MOOD || 'neutral';
    const targets = [hero, document.getElementById('JarvisBot')].filter(Boolean);

    targets.forEach(b => {
      b.classList.remove('neutral', 'hardcore', 'caution', 'mood-neutral', 'mood-hardcore', 'mood-caution');
      b.classList.add(moodName, 'mood-' + moodName);
      if (activity) {
        b.classList.add(activity);
      }
    });

    EyePhysics.setMode({
      idle: !STATE.typing && !STATE.mic && !STATE.thinking && !STATE.speaking,
      thinking: STATE.thinking,
      listening: STATE.mic,
      speaking: STATE.speaking,
      computing: STATE.typing && !STATE.mic,
      mood: CURRENT_MOOD
    });
  }

  /**
   * Applies selected robot personality mood (neutral, hardcore, caution).
   * Updates eye color classes on both hero and Jarvis overlay bot faces.
   * Uses professional UI labels ('Assistant', 'Professional', 'Direct').
   * @param {string} mood Selected mood identifier.
   */
  function applyMood(mood) {
    setCurrentMood(mood);
    localStorage.setItem('px-mood', mood);

    const targets = [hero, document.getElementById('JarvisBot')].filter(Boolean);
    targets.forEach(b => {
      b.classList.remove('mood-neutral', 'mood-hardcore', 'mood-caution', 'neutral', 'hardcore', 'caution');
      b.classList.add('mood-' + mood, mood);
    });

    $all('.mood-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === mood);
    });

    if (modeCurrent) {
      if (mood === "hardcore") modeCurrent.textContent = "Professional";
      else if (mood === "caution") modeCurrent.textContent = "Direct";
      else modeCurrent.textContent = "Assistant";
      addMoodSystemBubble(mood);
    }
  }

  // Subscribe to state change on robotMood
  subscribe('robotMood', (newMood) => {
    applyMood(newMood);
  });

  // Wire up core modules
  initChat({
    chat,
    refreshHero,
    speakText,
    renderChatList: () => renderChatList(historyContainer, chat, loadChat)
  });

  initVoice({ refreshHero });
  initJarvis({ micBtn, refreshHero });

  // Initialize event handlers & UI listeners
  initBotActions();
  initInputHandlers(input, sendBtn);
  initPlusMenu(attachBtn, plusMenu, summarizeBtn, hiddenFile, input);
  initChatStorage();

  initMemory({
    memoryTile,
    memoryPanel,
    memClose,
    memList,
    memInput,
    memAddBtn,
    updateMemoryBadge: () => updateMemoryBadge(memoryQuickText)
  });

  initSidebar({
    menuToggle, sidebar, closeSidebar, backdrop,
    historyTile, historyContainer, newChatTile,
    langTile, langPanel, langCurrent,
    lenTile, lenPanel, lenCurrent, lenSlider,
    modeTile, moodPanel, modeCurrent,
    voiceTile, voiceOptions, voiceCurrentEl,
    chat, applyMood
  });

  setupSpeechRecognition(micBtn, input, sendBtn);

  // Initialize Theme, Greetings & Effects
  initTheme(themeToggle);
  initGreeting(greetEl);
  initBubbleHover();

  // Startup animations & state sync
  const savedMood = localStorage.getItem('px-mood') || 'neutral';
  setTimeout(() => applyMood(savedMood), 50);
  EyePhysics.start();
  setTimeout(refreshHero, 50);

  updateMemoryBadge(memoryQuickText);

  // Sync initial label text
  if (lenSlider && lenCurrent) {
    lenCurrent.textContent = lenSlider.value == 1 ? "Default" : lenSlider.value + " lines";
  }
  if (langCurrent) {
    langCurrent.textContent = localStorage.getItem('px-lang') === 'en-in' ? 'Indian English' : 'Hinglish';
  }
  if (voiceCurrentEl) {
    const savedVoice = getValidVoice(localStorage.getItem('px-voice') || 'af_heart');
    voiceCurrentEl.textContent = KOKORO_VOICES[savedVoice] || savedVoice;
  }

  console.info('🚀 Prototype-X V2 Bot Head & Architecture Initialized Successfully');
});
