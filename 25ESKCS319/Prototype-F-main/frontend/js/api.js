/* ===========================================================
   Prototype-X v2
   File: api.js
   Purpose: Network Communication & Backend API Client

   Responsibility:
   - Encapsulates all HTTP request logic to Flask endpoints.
   - Zero DOM manipulation.
   - Transparently maps UI mode names ('Assistant', 'Professional', 'Direct') to backend params.
   - Sends valid Kokoro voice parameters to /tts endpoint.
   - Memory placeholder API wrappers ready for future integration.
   - Robust error handling and response validation.

   Author: Refactored Architecture
   =========================================================== */

import { TTS_BACKEND_URL, ENDPOINTS } from './config.js';
import { setBackendStatus, setBackendLatency, getBackendMode, getValidVoice } from './state.js';

/**
 * Loads all saved memory strings from backend SQLite / Chroma engine.
 * @returns {Promise<Array<string>>} List of memory strings.
 */
export async function memLoad() {
  const startTime = performance.now();
  try {
    const res = await fetch(ENDPOINTS.MEMORY_LIST);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to load memory`);
    }
    const data = await res.json();
    setBackendStatus(true);
    setBackendLatency(Math.round(performance.now() - startTime));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("[API] Memory Load Error:", e);
    setBackendStatus(false);
    return [];
  }
}

/**
 * Adds a new memory string to backend vector/sqlite store.
 * @param {string} text Memory text to add.
 * @returns {Promise<Response>}
 */
export async function memAdd(text) {
  try {
    const res = await fetch(ENDPOINTS.MEMORY_ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    setBackendStatus(res.ok);
    return res;
  } catch (e) {
    console.error("[API] Memory Add Error:", e);
    setBackendStatus(false);
    throw e;
  }
}

/**
 * Deletes a memory item by index.
 * @param {number} index Index of memory item to delete.
 * @returns {Promise<Response>}
 */
export async function memDelete(index) {
  try {
    const res = await fetch(ENDPOINTS.MEMORY_DELETE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index })
    });
    setBackendStatus(res.ok);
    return res;
  } catch (e) {
    console.error("[API] Memory Delete Error:", e);
    setBackendStatus(false);
    throw e;
  }
}

/**
 * Edits an existing memory item at the specified index.
 * @param {number} index Target memory index.
 * @param {string} text New text content.
 * @returns {Promise<Response>}
 */
export async function memEdit(index, text) {
  try {
    const res = await fetch(ENDPOINTS.MEMORY_EDIT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, text })
    });
    setBackendStatus(res.ok);
    return res;
  } catch (e) {
    console.error("[API] Memory Edit Error:", e);
    setBackendStatus(false);
    throw e;
  }
}

/**
 * Sends prompt and conversation options to /ask route.
 * Transparently maps UI personality mode names ('Assistant', 'Professional', 'Direct') to backend ('neutral', 'hardcore', 'caution').
 * @param {string} finalPrompt Formatted prompt with context and user message.
 * @param {string} mode Personality mode ('neutral', 'hardcore', 'caution', 'Assistant', 'Professional', 'Direct').
 * @param {number|null} lines Optional response line limit.
 * @param {string} language Selected language ('hinglish', 'en-in').
 * @param {string|null} sessionId Session identifier.
 * @returns {Promise<string>} AI text reply.
 */
export async function askBackend(finalPrompt, mode = "neutral", lines = null, language = "hinglish", sessionId = null) {
  const startTime = performance.now();
  try {
    const backendMode = getBackendMode(mode);
    const payload = {
      prompt: finalPrompt,
      mode: backendMode,
      length: lines ? Number(lines) : null,
      language: language
    };

    if (sessionId) {
      payload.session_id = sessionId;
    }

    const res = await fetch(ENDPOINTS.ASK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setBackendLatency(Math.round(performance.now() - startTime));

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend Error ${res.status}: ${text}`);
    }

    const data = await res.json();
    setBackendStatus(true);
    return data.answer || "No reply from backend.";
  } catch (err) {
    console.error("[API] Ask Backend Error:", err);
    setBackendStatus(false);
    return "__SYSTEM__ Backend not running or crashed.";
  }
}

/**
 * Requests Kokoro TTS audio generation for given text and voice model.
 * @param {string} text Text to synthesize.
 * @param {string} voice Target Kokoro voice model name (e.g. 'af_heart', 'af_bella').
 * @returns {Promise<string>} Blob URL pointing to generated WAV audio.
 */
export async function fetchTtsChunk(text, voice = "af_heart") {
  try {
    const validVoice = getValidVoice(voice);
    const res = await fetch(TTS_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: validVoice })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[API] TTS Backend Error:", errText);
      throw new Error(`TTS Backend Error ${res.status}: ${errText}`);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("[API] Fetch TTS Chunk Error:", e);
    throw e;
  }
}

/**
 * Checks server health status.
 * @returns {Promise<object|null>} Health check response.
 */
export async function checkHealth() {
  try {
    const res = await fetch(ENDPOINTS.HEALTH);
    if (!res.ok) return null;
    const data = await res.json();
    setBackendStatus(true);
    return data;
  } catch (e) {
    setBackendStatus(false);
    return null;
  }
}

export default {
  memLoad,
  memAdd,
  memDelete,
  memEdit,
  askBackend,
  fetchTtsChunk,
  checkHealth
};
