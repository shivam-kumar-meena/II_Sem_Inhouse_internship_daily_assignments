/* ===========================================================
   Prototype-X v2
   File: sidebar.js
   Purpose: Sidebar Navigation Drawer & Settings Control Panels

   Responsibility:
   - Sidebar open/close drawer transitions and backdrop click handlers.
   - History tile drawer rendering with chat rename and delete actions.
   - New Chat initialization and reset triggers.
   - Language selector panel (Hinglish, Indian English).
   - Answer length slider control (Default / 1-50 lines).
   - Personality Mode panel selection (Assistant, Professional, Direct).
   - Local Kokoro Voice selection panel (Heart, Bella, Nicole, Sarah, Sky, Adam, Michael).
   - Keyboard shortcuts binding (Alt+N, Alt+H, Alt+C).

   Author: Refactored Architecture
   =========================================================== */

import { $all } from './ui.js';
import { setTtsVoice, openSidebar as openStateSidebar, closeSidebar as closeStateSidebar, getValidVoice } from './state.js';
import { KOKORO_VOICES } from './config.js';
import {
  loadChats, saveChats, createNewChat, loadChat,
  addBotBubble, clearChatUI
} from './chat.js';

/**
 * Initializes Sidebar Navigation & Settings panels.
 * @param {object} deps Injectable element & function map.
 */
export function initSidebar(deps) {
  const {
    menuToggle, sidebar, closeSidebar, backdrop,
    historyTile, historyContainer, newChatTile,
    langTile, langPanel, langCurrent,
    lenTile, lenPanel, lenCurrent, lenSlider,
    modeTile, moodPanel, modeCurrent,
    voiceTile, voiceOptions, voiceCurrentEl,
    chat, applyMood
  } = deps;

  if (!sidebar) return;

  /* ===========================================================
     Drawer Toggle Handlers
     =========================================================== */

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.add('active');
      if (backdrop) backdrop.classList.add('show');
      sidebar.setAttribute('aria-hidden', 'false');
      if (backdrop) backdrop.setAttribute('aria-hidden', 'false');
      openStateSidebar();
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener('click', function () {
      sidebar.classList.remove('active');
      if (backdrop) backdrop.classList.remove('show');
      sidebar.setAttribute('aria-hidden', 'true');
      if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
      closeStateSidebar();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      sidebar.classList.remove('active');
      backdrop.classList.remove('show');
      sidebar.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      closeStateSidebar();
    });
  }

  /* ===========================================================
     History Drawer & Rendering
     =========================================================== */

  if (historyTile && historyContainer) {
    historyTile.addEventListener("click", () => {
      const isOpen = historyContainer.style.display === "flex";
      if (isOpen) {
        historyContainer.style.display = "none";
        return;
      }
      document.querySelectorAll('.tile').forEach(t => t.classList.remove('active'));
      historyTile.classList.add('active');

      renderChatList(historyContainer, chat, loadChat);
      historyContainer.style.display = "flex";
      historyContainer.style.opacity = "0";
      historyContainer.style.transform = "translateY(10px)";
      setTimeout(() => {
        historyContainer.style.opacity = "1";
        historyContainer.style.transform = "translateY(0)";
      }, 10);
    });

    document.addEventListener("click", (e) => {
      if (
        historyContainer.style.display === "flex" &&
        !historyContainer.contains(e.target) &&
        !historyTile.contains(e.target)
      ) {
        historyContainer.style.display = "none";
      }
    });
  }

  /* ===========================================================
     New Chat Creation
     =========================================================== */

  if (newChatTile) {
    newChatTile.addEventListener('click', () => {
      createNewChat();
      clearChatUI();
      localStorage.setItem("px-thread", JSON.stringify([]));
      addBotBubble("Hello! I'm Prototype-X — ask me anything.");
      if (historyContainer) {
        renderChatList(historyContainer, chat, loadChat);
        historyContainer.style.display = "none";
      }
    });
  }

  /* ===========================================================
     Interactive Tiles Mousemove Lighting Effect
     =========================================================== */

  const tilesParent = document.getElementById('tiles');
  if (tilesParent) {
    tilesParent.addEventListener('mousemove', function (e) {
      const t = e.target.closest('.tile');
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      t.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ===========================================================
     Language Selector Panel
     =========================================================== */

  if (langTile && langPanel) {
    langTile.addEventListener('click', () => {
      langPanel.hidden = !langPanel.hidden;
      document.querySelectorAll('.tile').forEach(t => t.classList.remove('active'));
      langTile.classList.add('active');
    });
  }

  $all('.lang-opt').forEach(btn =>
    btn.addEventListener('click', function () {
      const v = btn.dataset.lang;
      localStorage.setItem('px-lang', v);
      if (langCurrent) {
        langCurrent.textContent = v === 'en-in' ? 'Indian English' : 'Hinglish';
      }
      document.querySelectorAll('.lang-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (langPanel) langPanel.hidden = true;
    })
  );

  /* ===========================================================
     Answer Length Slider Panel
     =========================================================== */

  if (lenSlider) {
    lenSlider.value = localStorage.getItem('px-lines') || '1';
    if (lenCurrent) {
      lenCurrent.textContent = lenSlider.value == 1 ? "Default" : lenSlider.value + " lines";
    }
    lenSlider.addEventListener('input', function () {
      localStorage.setItem('px-lines', String(lenSlider.value));
      if (lenCurrent) {
        lenCurrent.textContent = lenSlider.value == 1 ? "Default" : lenSlider.value + " lines";
      }
    });
  }

  if (lenTile && lenPanel) {
    lenTile.addEventListener('click', () => {
      lenPanel.hidden = !lenPanel.hidden;
    });
  }

  /* ===========================================================
     Personality Mode Panel
     =========================================================== */

  if (modeTile && moodPanel) {
    modeTile.addEventListener('click', function () {
      moodPanel.hidden = !moodPanel.hidden;
    });
  }

  $all('.mood-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      if (applyMood) applyMood(btn.dataset.mood);
    });
  });

  /* ===========================================================
     Local Kokoro Voice Selection Panel
     =========================================================== */

  function applyVoiceUI(v) {
    const validVoice = getValidVoice(v);
    setTtsVoice(validVoice);
    localStorage.setItem('px-voice', validVoice);

    const displayName = KOKORO_VOICES[validVoice] || validVoice;
    if (voiceCurrentEl) {
      voiceCurrentEl.textContent = displayName;
    }
    $all('.voice-opt').forEach(b => {
      if (b.dataset.voice) {
        b.classList.toggle('active', b.dataset.voice === validVoice);
      }
    });
  }

  (function initVoiceSetting() {
    applyVoiceUI(localStorage.getItem('px-voice') || 'af_heart');
  })();

  if (voiceTile && voiceOptions) {
    voiceTile.addEventListener('click', function () {
      voiceOptions.hidden = !voiceOptions.hidden;
    });
    $all('.voice-opt').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (btn.dataset.voice) applyVoiceUI(btn.dataset.voice);
      });
    });
  }

  /* Sync Initial Language UI */
  const savedLang = localStorage.getItem("px-lang") || "hinglish";
  if (langCurrent) {
    langCurrent.textContent = savedLang === "en-in" ? "Indian English" : "Hinglish";
  }
  document.querySelectorAll('.lang-opt').forEach(btn => {
    if (btn.dataset.lang === savedLang) btn.classList.add('active');
  });

  /* Keyboard Shortcuts (Alt+H, Alt+C, Alt+N) */
  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.key.toLowerCase() === "h") {
      if (applyMood) applyMood("hardcore");
    } else if (e.altKey && e.key.toLowerCase() === "c") {
      if (applyMood) applyMood("caution");
    } else if (e.altKey && e.key.toLowerCase() === "n") {
      if (applyMood) applyMood("neutral");
    }
  });
}

/**
 * Renders the saved chat list inside the History Container.
 * @param {HTMLElement} historyContainer Target container element.
 * @param {HTMLElement} chatEl Main chat bubble container.
 * @param {Function} loadChatFn Chat loader function reference.
 */
export function renderChatList(historyContainer, chatEl, loadChatFn) {
  const chats = loadChats();
  const container = historyContainer || document.getElementById("historyContainer");
  if (!container) return;

  container.innerHTML = "";

  chats.forEach(chatItem => {
    const div = document.createElement("div");
    div.className = "tile";
    div.innerHTML = `
      <h4>${chatItem.title}</h4>
      <p>${new Date(chatItem.created_at).toLocaleDateString()}</p>
      <div style="position:absolute; top:8px; right:8px; display:flex; gap:6px;">
        <button class="editBtn" title="Edit title">✏️</button>
        <button class="deleteBtn" title="Delete chat">❌</button>
      </div>`;

    div.onclick = (e) => {
      if (e.target.tagName === "BUTTON") return;
      if (loadChatFn) loadChatFn(chatItem.id);
    };

    const deleteBtn = div.querySelector(".deleteBtn");
    if (deleteBtn) {
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        let allChats = loadChats();
        allChats = allChats.filter(c => c.id !== chatItem.id);
        saveChats(allChats);

        if (localStorage.getItem("px-current-chat") === chatItem.id) {
          if (allChats.length) {
            localStorage.setItem("px-current-chat", allChats[0].id);
            if (loadChatFn) loadChatFn(allChats[0].id);
          } else {
            createNewChat();
            if (chatEl) chatEl.innerHTML = "";
          }
        }
        renderChatList(container, chatEl, loadChatFn);
      };
    }

    const editBtn = div.querySelector(".editBtn");
    if (editBtn) {
      editBtn.onclick = (e) => {
        e.stopPropagation();
        const newTitle = prompt("Edit chat title:", chatItem.title);
        if (!newTitle) return;
        const allChats = loadChats();
        const index = allChats.findIndex(c => c.id === chatItem.id);
        if (index !== -1) {
          allChats[index].title = newTitle;
          saveChats(allChats);
          renderChatList(container, chatEl, loadChatFn);
        }
      };
    }

    container.appendChild(div);
  });
}

export default {
  initSidebar,
  renderChatList
};
