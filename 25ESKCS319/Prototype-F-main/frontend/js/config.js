/* ===========================================================
   Prototype-X v2
   File: config.js
   Responsibility: Application Configuration & Backend Endpoint Registry
   
   Provides centralized configuration constants for API communication,
   backend endpoints, default options, and application settings.
   =========================================================== */

export const API_BASE = "http://localhost:7007";

export const TTS_BACKEND_URL = `${API_BASE}/tts`;

export const ENDPOINTS = Object.freeze({
    ASK: `${API_BASE}/ask`,
    MEMORY_LIST: `${API_BASE}/memory/list`,
    MEMORY_ADD: `${API_BASE}/memory/add`,
    MEMORY_EDIT: `${API_BASE}/memory/edit`,
    MEMORY_DELETE: `${API_BASE}/memory/delete`,
    TTS: TTS_BACKEND_URL,
    HEALTH: `${API_BASE}/health`
});

/**
 * Professional Personality Mode Mappings:
 * Frontend UI Label -> Backend Parameter Value
 * Assistant -> neutral
 * Professional -> hardcore
 * Direct -> caution
 */
export const PERSONALITY_MAP = Object.freeze({
    "assistant": "neutral",
    "professional": "hardcore",
    "direct": "caution",
    "neutral": "neutral",
    "hardcore": "hardcore",
    "caution": "caution"
});

export const PERSONALITY_LABELS = Object.freeze({
    "neutral": { label: "Assistant", icon: "🟢", code: "neutral" },
    "hardcore": { label: "Professional", icon: "🔴", code: "hardcore" },
    "caution": { label: "Direct", icon: "🟡", code: "caution" }
});

/**
 * Local Kokoro TTS Voices Registry
 */
export const KOKORO_VOICES = Object.freeze({
    "af_heart": "Heart",
    "af_bella": "Bella",
    "af_nicole": "Nicole",
    "af_sarah": "Sarah",
    "af_sky": "Sky",
    "am_adam": "Adam",
    "am_michael": "Michael"
});

export const DEFAULT_CONFIG = Object.freeze({
    LANGUAGE: "hinglish",
    VOICE: "af_heart",
    MODE: "neutral",
    ANSWER_LINES: 1,
    MAX_THREAD_HISTORY: 6,
    MAX_FULL_HISTORY: 20,
    TYPING_SPEED_MS: 18,
    RATE_LIMIT_DELAY_MS: 1000
});

export default {
    API_BASE,
    TTS_BACKEND_URL,
    ENDPOINTS,
    PERSONALITY_MAP,
    PERSONALITY_LABELS,
    KOKORO_VOICES,
    DEFAULT_CONFIG
};
