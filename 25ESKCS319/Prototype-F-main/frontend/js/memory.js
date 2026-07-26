/* ===========================================================
   Prototype-X v2
   File: memory.js
   Purpose: Memory Sidebar Drawer & Memory Notes Manager

   Responsibility:
   - Memory panel drawer open/close toggles & backdrop click handlers.
   - Fetching memory items via api.js (`memLoad`).
   - Adding (`memAdd`), Editing (`memEdit`), and Deleting (`memDelete`) memory entries.
   - Live synchronization of Quick Memory Badge ("ON (N)" / "OFF").

   Author: Refactored Architecture
   =========================================================== */

import { memLoad, memDelete, memEdit, memAdd } from './api.js';
import { openMemorySidebar, closeMemorySidebar, setMemories } from './state.js';

/**
 * Initializes Memory Panel & Event Handlers.
 * @param {object} deps Injectable element & function map.
 */
export function initMemory(deps) {
  const { memoryTile, memoryPanel, memClose, memList, memInput, memAddBtn, updateMemoryBadge } = deps;

  if (!memoryPanel) return;

  if (memoryTile) {
    memoryTile.addEventListener("click", () => {
      memoryPanel.classList.add("active");
      openMemorySidebar();
      memRender(memList, updateMemoryBadge);
    });
  }

  if (memClose) {
    memClose.addEventListener("click", () => {
      memoryPanel.classList.remove("active");
      closeMemorySidebar();
    });
  }

  document.addEventListener("click", (e) => {
    if (
      memoryPanel.classList.contains("active") &&
      !memoryPanel.contains(e.target) &&
      (memoryTile && !memoryTile.contains(e.target))
    ) {
      memoryPanel.classList.remove("active");
      closeMemorySidebar();
    }
  });

  if (memAddBtn && memInput) {
    memAddBtn.addEventListener("click", async () => {
      const text = memInput.value.trim();
      if (!text) return;
      await memAdd(text);
      memInput.value = "";
      await memRender(memList, updateMemoryBadge);
      if (updateMemoryBadge) updateMemoryBadge();
    });

    memInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        memAddBtn.click();
      }
    });
  }
}

/**
 * Renders the list of memory items in the Memory Panel body.
 * @param {HTMLElement} memList List container element.
 * @param {Function} updateMemoryBadge Badge refresh callback.
 */
async function memRender(memList, updateMemoryBadge) {
  if (!memList) return;

  const memories = await memLoad();
  setMemories(memories);

  memList.innerHTML = "";

  if (memories.length === 0) {
    memList.innerHTML = "<div style='opacity:.6; padding:12px; font-size:0.9rem;'>No memory saved yet.</div>";
    return;
  }

  const fragment = document.createDocumentFragment();

  memories.forEach((text, index) => {
    const row = document.createElement("div");
    row.className = "mem-item";

    const bullet = document.createElement("div");
    bullet.className = "mem-text";
    bullet.textContent = "• " + text;

    const actions = document.createElement("div");
    actions.className = "mem-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";

    delBtn.onclick = async () => {
      await memDelete(index);
      await memRender(memList, updateMemoryBadge);
      if (updateMemoryBadge) updateMemoryBadge();
    };

    editBtn.onclick = async () => {
      const newText = prompt("Edit memory:", text);
      if (!newText) return;
      await memEdit(index, newText);
      await memRender(memList, updateMemoryBadge);
      if (updateMemoryBadge) updateMemoryBadge();
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    row.appendChild(bullet);
    row.appendChild(actions);
    fragment.appendChild(row);
  });

  memList.appendChild(fragment);
}

/**
 * Updates the Quick Memory badge text ("ON (N)" / "OFF").
 * @param {HTMLElement} memoryQuickText Badge text container.
 */
export async function updateMemoryBadge(memoryQuickText) {
  if (!memoryQuickText) return;
  const mem = await memLoad();
  setMemories(mem);
  const txt = mem.length ? `ON (${mem.length})` : "OFF";
  memoryQuickText.textContent = txt;
}

export default {
  initMemory,
  updateMemoryBadge
};
