/* ===========================================================
   Prototype-X v2
   File: chat.js
   Purpose: Chat Logic, Message Rendering & Thread Persistence

   Responsibility:
   - Manages chat UI bubble rendering (User, Assistant, System).
   - Character-by-character typing animation with speed control.
   - Context composition (Thread history + Prompts).
   - Chat thread persistence in localStorage (`px-chats`, `px-current-chat`, `px-thread`).
   - Interactive Bot Actions: Copy, Speak, Regenerate, Up/Down Feedback.
   - Input Bar triggers, Shift+Enter handling, and Plus Menu overlay handlers.

   Author: Refactored Architecture
   =========================================================== */

import { memLoad, memAdd, askBackend } from './api.js';
import { STATE, CURRENT_MOOD } from './state.js';
import { escapeHtml, getTime, clamp, keep } from './ui.js';

let chat = null;
let lastDay = null;
let refreshHero = null;
let speakTextFn = null;
let renderChatListFn = null;

/**
 * Initializes Chat module with DOM container & injected functional callbacks.
 * @param {object} deps Dependency injection map.
 */
export function initChat(deps) {
  chat = deps.chat;
  refreshHero = deps.refreshHero;
  speakTextFn = deps.speakText;
  renderChatListFn = deps.renderChatList;
}

export function getChatEl() {
  return chat;
}

/* ===========================================================
   Chat Persistence Storage Helpers
   =========================================================== */

export function loadChats() {
  try {
    return JSON.parse(localStorage.getItem("px-chats") || "[]");
  } catch (e) {
    console.error("[Chat] Error loading px-chats:", e);
    return [];
  }
}

export function saveChats(chats) {
  try {
    localStorage.setItem("px-chats", JSON.stringify(chats));
  } catch (e) {
    console.error("[Chat] Error saving px-chats:", e);
  }
}

export function getCurrentChat() {
  const id = localStorage.getItem("px-current-chat");
  return loadChats().find(c => c.id === id);
}

export function createNewChat() {
  const id = "chat_" + Date.now();
  const newChat = {
    id,
    title: "New Chat",
    messages: [],
    created_at: Date.now()
  };
  const chats = loadChats();
  chats.unshift(newChat);
  saveChats(chats);
  localStorage.setItem("px-current-chat", id);
  return newChat;
}

export function addMessage(role, text) {
  const chats = loadChats();
  const id = localStorage.getItem("px-current-chat");
  const chatObj = chats.find(c => c.id === id);
  if (!chatObj) return;

  chatObj.messages.push({ role, text });
  saveChats(chats);

  if (renderChatListFn) {
    renderChatListFn();
  }
}

/* ===========================================================
   Smart Title Generation
   =========================================================== */

const IGNORE_PATTERNS = [
  /^hi$/i, /^hello$/i, /^hey$/i, /^yo$/i,
  /^my name is/i, /^i am/i
];

function isValidTopic(text) {
  const cleaned = text.trim().toLowerCase();
  if (cleaned.length < 6) return false;
  return !IGNORE_PATTERNS.some(p => p.test(cleaned));
}

function generateSmartTitle(text) {
  let cleaned = text.toLowerCase();
  cleaned = cleaned
    .replace(/tell me about|what is|explain|give me|define|how to/g, "")
    .replace(/please|bro|bhai/g, "")
    .trim();

  return cleaned
    .split(" ")
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ===========================================================
   Thread History Helpers
   =========================================================== */

function threadLoad() {
  try {
    return JSON.parse(localStorage.getItem('px-thread') || '[]');
  } catch {
    return [];
  }
}

function threadSave(t) {
  try {
    localStorage.setItem('px-thread', JSON.stringify(t));
  } catch (e) {
    console.error("[Chat] Error saving thread:", e);
  }
}

function extractYear(s) {
  if (!s) return null;
  const m1 = s.match(/\b(?:in|as of|around)\s+(19\d{2}|20\d{2}|2100)\b/i);
  if (m1) return m1[1];
  const m2 = s.match(/\b(19\d{2}|20\d{2}|2100)\b/);
  return m2 ? m2[1] : null;
}

/* ===========================================================
   Prompt Composition
   =========================================================== */

export async function composePrompt(userText) {
  const lang = localStorage.getItem('px-lang') || 'hinglish';
  const sliderValue = parseInt(localStorage.getItem('px-lines') || '1', 10);

  let lengthInstruction = "";
  if (sliderValue > 1) {
    lengthInstruction = `Answer in maximum ${sliderValue} lines.`;
  }

  const year = extractYear(userText);
  const memories = await memLoad();
  const thread = keep(threadLoad(), 6);

  const threadText = thread.map(t => `${t.role === 'user' ? 'U' : 'A'}: ${t.text}`).join('\n');
  const memText = memories.length ? `User memory notes: ${memories.join('; ')}` : 'User memory notes: (none)';
  const timeHint = year
    ? `If the question implies a specific year, answer as it was in ${year}.`
    : 'If the question implies a past time, answer for that time.';

  const instruction = [
    `Language: ${lang}.`,
    lengthInstruction,
    `Be helpful and precise.`,
    timeHint
  ].join(' ');

  return [
    `[CONTEXT]\n${threadText || '(start)'}\n`,
    `[MEMORY]\n${memText}\n`,
    `[INSTRUCTION]\n${instruction}\n`,
    `[QUESTION]\n${userText}`
  ].join('\n');
}

/* ===========================================================
   Scroll Helper
   =========================================================== */

export function scrollToBottom() {
  if (!chat) return;
  requestAnimationFrame(() => {
    chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
  });
}

function maybeAddDay() {
  if (!chat) return;
  const today = new Date().toDateString();
  if (lastDay === today) return;
  lastDay = today;

  const d = document.createElement('div');
  d.className = 'chat-day';
  d.textContent = 'Today';
  chat.appendChild(d);
}

function appendTimeFor(el, isUser = false) {
  if (!chat) return;
  const time = document.createElement('div');
  time.className = 'msg-time' + (isUser ? ' user-time' : '');
  time.textContent = getTime();
  chat.appendChild(time);
}

/* ===========================================================
   Bubble Rendering
   =========================================================== */

export function addUserBubble(text) {
  if (!chat) return;
  maybeAddDay();

  const u = document.createElement('div');
  u.className = 'chat-bubble user-bubble';
  u.innerHTML = `<span class="text">${escapeHtml(text)}</span>`;

  const last = chat.lastElementChild;
  if (last && last.classList && last.classList.contains('user-bubble')) {
    u.classList.add('grouped');
    last.classList.add('grouped');
  }

  chat.appendChild(u);
  appendTimeFor(u, true);
  scrollToBottom();
}

export function addBotBubble(text, speak = false, isSystem = false) {
  if (!chat) return;
  maybeAddDay();

  const b = document.createElement('div');
  b.className = 'chat-bubble bot-bubble' + (isSystem ? ' system' : '');

  const row = document.createElement('div');
  row.className = 'bot-row';

  const avatar = document.createElement('div');
  avatar.className = 'px-avatar thinking';

  const x = document.createElement('div');
  x.className = 'px-x';
  avatar.appendChild(x);

  const header = document.createElement('div');
  header.className = 'bot-header';
  header.innerHTML = `<span class="bot-name">Prototype-X</span>`;

  b.classList.add('flowbite');
  row.appendChild(avatar);

  const col = document.createElement('div');
  col.style.display = 'flex';
  col.style.flexDirection = 'column';
  col.style.alignItems = 'flex-start';
  col.style.marginLeft = '2px';
  col.appendChild(header);
  col.appendChild(b);
  row.appendChild(col);

  b.innerHTML = `
    <span class="text"><strong></strong></span>
    <div class="bubble-time">${getTime()}</div>
    <div class="bot-actions">
      <button class="bot-action-btn" data-action="copy" title="Copy">📋</button>
      <button class="bot-action-btn" data-action="speak" title="Speak">🔊</button>
      <button class="bot-action-btn" data-action="regen" title="Regenerate">♻️</button>
      <button class="bot-action-btn" data-action="up" title="Good answer">👍</button>
      <button class="bot-action-btn" data-action="down" title="Bad answer">👎</button>
    </div>`;

  const strongEl = b.querySelector('.text strong');
  strongEl.textContent = '';

  let typingActive = true;
  const fullText = (text || '').replace('__SYSTEM__', '').trim();
  let i = 0;
  const speed = 18;

  const typer = setInterval(() => {
    if (!typingActive) {
      clearInterval(typer);
      strongEl.textContent = fullText;
      avatar.classList.remove('thinking');
      if (speak) {
        avatar.classList.add('speaking');
        setTimeout(() => avatar.classList.remove('speaking'), 1200);
      } else {
        avatar.classList.add('idle');
      }
      if (speak && speakTextFn) {
        speakTextFn(fullText).catch(() => {});
      }
      scrollToBottom();
      return;
    }

    strongEl.textContent += fullText.charAt(i) || '';
    i++;

    if (i >= fullText.length) {
      typingActive = false;
      clearInterval(typer);
      avatar.classList.remove('thinking');
      if (speak) {
        avatar.classList.add('speaking');
        setTimeout(() => avatar.classList.remove('speaking'), 1200);
      } else {
        avatar.classList.add('idle');
      }

      try {
        const feedback = {
          type: "auto-like",
          score: 1,
          text: fullText,
          time: new Date().toISOString()
        };
        const store = JSON.parse(localStorage.getItem("px-feedback") || "[]");
        store.push(feedback);
        localStorage.setItem("px-feedback", JSON.stringify(store));
      } catch (e) {
        console.warn("[Chat] Auto-score error:", e);
      }

      if (speak && speakTextFn) {
        speakTextFn(fullText).catch(() => {});
      }
    }
    scrollToBottom();
  }, speed);

  chat.appendChild(row);

  const prevRow = [...chat.children]
    .slice(0, -1)
    .reverse()
    .find(el => el.querySelector && el.querySelector('.bot-bubble'));

  if (prevRow) {
    const prevBubble = prevRow.querySelector('.bot-bubble');
    b.classList.add('grouped');
    if (prevBubble) prevBubble.classList.add('grouped');
  }

  b.addEventListener('click', () => {
    if (!typingActive) return;
    typingActive = false;
  });

  scrollToBottom();
}

/* ===========================================================
   Chat Management & Loading
   =========================================================== */

export function loadChat(id) {
  if (!chat) return;
  const chats = loadChats();
  const chatData = chats.find(c => c.id === id);
  if (!chatData) return;

  localStorage.setItem("px-current-chat", id);
  chat.innerHTML = "";
  lastDay = null;

  chatData.messages.forEach(msg => {
    if (msg.role === "user") {
      addUserBubble(msg.text);
    } else {
      addBotBubble(msg.text, false);
    }
  });

  scrollToBottom();
}

export function clearChatUI() {
  if (!chat) return;
  chat.innerHTML = "";
  lastDay = null;
}

/* ===========================================================
   Main Message Dispatcher
   =========================================================== */

export async function handleSendText(rawText, isRegen = false, options = {}) {
  const text = (rawText || '').trim();
  const skipUI = options.skipUI || false;
  const skipSpeak = options.skipSpeak || false;

  if (!text) return "";

  if (!isRegen && !skipUI) addUserBubble(text);
  if (!isRegen) addMessage("user", text);

  const currentChat = getCurrentChat();
  if (currentChat && currentChat.title === "New Chat" && isValidTopic(text)) {
    currentChat.title = generateSmartTitle(text);
    const chats = loadChats();
    const index = chats.findIndex(c => c.id === currentChat.id);
    if (index !== -1) {
      chats[index] = currentChat;
      saveChats(chats);
      if (renderChatListFn) renderChatListFn();
    }
  }

  STATE.typing = false;
  if (refreshHero) refreshHero();

  let thinking = null;
  if (!skipUI) {
    thinking = document.createElement('div');
    thinking.className = 'chat-bubble bot-bubble';
    thinking.innerHTML = '<span class="bot-emoji">🤖</span><span class="text"><strong>Thinking…</strong></span>';
    chat.appendChild(thinking);
    scrollToBottom();
  } else {
    STATE.thinking = true;
    if (refreshHero) refreshHero();
  }

  const lang = localStorage.getItem('px-lang') || 'hinglish';
  const sliderValue = parseInt(localStorage.getItem('px-lines') || '1', 10);
  let lines = sliderValue === 1 ? null : clamp(sliderValue, 1, 50);

  const finalPrompt = await composePrompt(text);
  const answer = await askBackend(finalPrompt, CURRENT_MOOD, lines, lang);

  if (thinking) thinking.remove();
  STATE.thinking = false;

  if (!skipUI) {
    addBotBubble(answer, !skipSpeak, answer.startsWith('__SYSTEM__'));
  }
  addMessage("assistant", answer);

  const thr = threadLoad();
  if (!isRegen) thr.push({ role: 'user', text });
  thr.push({ role: 'assistant', text: answer });
  threadSave(keep(thr, 20));

  if (refreshHero) refreshHero();
  return answer;
}

/* ===========================================================
   Slash Command /remember
   =========================================================== */

export async function trySlashRemember(s) {
  const match =
    s.match(/^\/remember\s+(.+)/i) ||
    s.match(/^\\r\s+(.+)/i) ||
    s.match(/^\\R\s+(.+)/i) ||
    s.match(/^-r\s+(.+)/i);

  if (!match) return false;
  const note = match[1].trim();
  if (!note) return false;

  await memAdd(note);
  addBotBubble("✅ Memory saved.");
  return true;
}

/* ===========================================================
   Interactive Action Buttons Delegation
   =========================================================== */

export function initBotActions() {
  if (!chat) return;

  chat.addEventListener('click', function (e) {
    const btn = e.target.closest('.bot-action-btn');
    if (!btn) return;

    const bubble = btn.closest('.bot-bubble');
    if (!bubble) return;

    const textEl = bubble.querySelector('.text strong');
    const text = textEl ? textEl.textContent : '';
    const action = btn.dataset.action;

    if (action === 'copy') {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = '📋'; }, 800);
      });
    } else if (action === 'speak') {
      if (!text || !speakTextFn) return;
      speakTextFn(text).catch(() => {});
    } else if (action === 'regen') {
      const thread = threadLoad();
      const lastUser = [...thread].reverse().find(m => m.role === 'user');
      if (!lastUser) return;
      handleSendText(lastUser.text, true).catch(() => {});
    } else if (action === 'up' || action === 'down') {
      const feedback = {
        type: action === 'up' ? 'like' : 'dislike',
        text,
        time: new Date().toISOString()
      };
      const store = JSON.parse(localStorage.getItem('px-feedback') || '[]');
      store.push(feedback);
      localStorage.setItem('px-feedback', JSON.stringify(store));
      btn.textContent = action === 'up' ? '✅' : '❌';
      setTimeout(() => {
        btn.textContent = action === 'up' ? '👍' : '👎';
      }, 800);
    }
  });
}

/* ===========================================================
   Input Bar & Event Wireup
   =========================================================== */

export function initInputHandlers(input, sendBtn) {
  if (!input || !sendBtn) return;

  sendBtn.addEventListener('click', function () {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    handleSendText(msg).catch(() => {});
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  input.addEventListener('input', function () {
    const hasText = input.value.trim().length > 0;
    STATE.typing = hasText;
    if (refreshHero) refreshHero();
  });
}

/* ===========================================================
   Plus Menu Overlay Logic
   =========================================================== */

export function initPlusMenu(attachBtn, plusMenu, summarizeBtn, hiddenFile, input) {
  if (!attachBtn || !plusMenu) return;

  attachBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    plusMenu.classList.toggle('show');
    plusMenu.setAttribute('aria-hidden', plusMenu.classList.contains('show') ? 'false' : 'true');
  });

  document.addEventListener('click', function (e) {
    if (!plusMenu.contains(e.target) && e.target !== attachBtn) {
      plusMenu.classList.remove('show');
      plusMenu.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      plusMenu.classList.remove('show');
      plusMenu.setAttribute('aria-hidden', 'true');
    }
  });

  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn && hiddenFile) {
    uploadBtn.addEventListener('click', function () {
      hiddenFile.click();
      plusMenu.classList.remove('show');
      plusMenu.setAttribute('aria-hidden', 'true');
    });
  }

  if (summarizeBtn && input) {
    summarizeBtn.addEventListener('click', function () {
      const msg = input.value.trim() || 'Paste some text and try again.';
      input.value = '';
      handleSendText('Summarize: ' + msg).catch(() => {});
    });
  }
}

/* ===========================================================
   Personality System Messages (Professional UI Labels)
   =========================================================== */

export function addMoodSystemBubble(mood) {
  if (mood === "hardcore") {
    addBotBubble("__SYSTEM__ 🔴 Professional mode enabled.", false, true);
  } else if (mood === "caution") {
    addBotBubble("__SYSTEM__ 🟡 Direct mode enabled.", false, true);
  } else {
    addBotBubble("__SYSTEM__ 🟢 Assistant mode enabled.", false, true);
  }
}

export function initChatStorage() {
  if (!localStorage.getItem("px-current-chat")) {
    createNewChat();
  }
}

export default {
  initChat,
  getChatEl,
  loadChats,
  saveChats,
  getCurrentChat,
  createNewChat,
  addMessage,
  composePrompt,
  scrollToBottom,
  addUserBubble,
  addBotBubble,
  loadChat,
  clearChatUI,
  handleSendText,
  trySlashRemember,
  initBotActions,
  initInputHandlers,
  initPlusMenu,
  addMoodSystemBubble,
  initChatStorage
};
