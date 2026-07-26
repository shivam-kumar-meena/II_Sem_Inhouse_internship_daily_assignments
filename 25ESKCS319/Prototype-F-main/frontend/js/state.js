/* ===========================================================
   Prototype-X v2
   File: state.js
   Purpose: Global Application State Manager (Single Source of Truth)

   Responsibility:
   - Manages all global application state cleanly without DOM dependencies.
   - Provides reactive publish-subscribe notification for state changes.
   - Preserves complete backward compatibility for legacy imports.
   - Includes transparent UI-to-Backend mode parameter mapping.

   Author: Refactored Architecture
   =========================================================== */

import { PERSONALITY_MAP, KOKORO_VOICES } from "./config.js";

/* ===========================================================
   State Enums & Freeze Types
   =========================================================== */

export const APP_MODE = Object.freeze({
    CHAT: "chat",
    JARVIS: "jarvis"
});

export const ROBOT_MOOD = Object.freeze({
    NEUTRAL: "neutral",
    HAPPY: "happy",
    THINKING: "thinking",
    LISTENING: "listening",
    SPEAKING: "speaking",
    HARDCORE: "hardcore",
    CAUTION: "caution"
});

export const THEME = Object.freeze({
    DARK: "dark",
    LIGHT: "light"
});

export const VOICE_STATE = Object.freeze({
    IDLE: "idle",
    LISTENING: "listening",
    THINKING: "thinking",
    SPEAKING: "speaking"
});

export const CHAT_ROLE = Object.freeze({
    USER: "user",
    ASSISTANT: "assistant",
    SYSTEM: "system"
});

/* ===========================================================
   Internal Core State Object
   =========================================================== */

export const state = {
    // Application Lifecycle
    initialized: false,
    mode: APP_MODE.CHAT,

    // UI & Theme
    theme: THEME.DARK,
    sidebarOpen: false,
    memorySidebarOpen: false,
    jarvisOpen: false,

    // Voice & Audio
    voiceState: VOICE_STATE.IDLE,
    recognitionRunning: false,
    microphoneEnabled: false,
    continuousConversation: false,
    selectedVoice: "af_heart",
    speaking: false,
    mic: false,

    // Robot Mood & Visuals
    robotMood: ROBOT_MOOD.NEUTRAL,
    thinking: false,
    typing: false,

    // Chat Data & Thread Persistence
    currentChatId: null,
    messages: [],
    chats: [],
    memories: [],
    speechQueue: [],

    // Backend Statistics & Health
    backendOnline: false,
    lastLatency: 0,
    sessionStarted: false,
    sessionStartTime: null,
    totalMessages: 0,
    totalVoiceRequests: 0,
    totalTokens: 0
};

/* ===========================================================
   Reactive Proxy STATE (Backward Compatibility Wrapper)
   =========================================================== */

export const STATE = new Proxy(state, {
    get(target, prop) {
        return target[prop];
    },
    set(target, prop, value) {
        setState(prop, value);
        return true;
    }
});

export let CURRENT_MOOD = ROBOT_MOOD.NEUTRAL;
export let TTS_VOICE = "af_heart";

/* ===========================================================
   Transparent Personality Mode Mapping Helper
   =========================================================== */

/**
 * Maps frontend UI personality labels ('Assistant', 'Professional', 'Direct')
 * to exact backend expected parameters ('neutral', 'hardcore', 'caution').
 * @param {string} mode Input mode string from UI or state
 * @returns {string} Backend payload compatible mode string
 */
export function getBackendMode(mode = "neutral") {
    if (!mode) return "neutral";
    const lower = String(mode).toLowerCase();
    return PERSONALITY_MAP[lower] || "neutral";
}

/**
 * Validates and returns a supported Kokoro voice ID.
 * @param {string} voice Input voice name.
 * @returns {string} Valid Kokoro voice ID (defaults to 'af_heart').
 */
export function getValidVoice(voice = "af_heart") {
    if (!voice) return "af_heart";
    const lower = String(voice).toLowerCase();
    return KOKORO_VOICES[lower] ? lower : "af_heart";
}

/* ===========================================================
   Subscribers Registry
   =========================================================== */

const subscribers = new Map();

function ensureKeyExists(key) {
    if (!(key in state)) {
        throw new Error(`Prototype-X State Error: Key "${key}" is not registered in state.`);
    }
}

/* ===========================================================
   Core State Getter & Setter Functions
   =========================================================== */

export function getState(key = null) {
    if (key === null) {
        return { ...state };
    }
    ensureKeyExists(key);
    return state[key];
}

export function setState(key, value) {
    ensureKeyExists(key);

    const previous = state[key];

    if (Object.is(previous, value)) {
        return;
    }

    state[key] = value;

    // Sync legacy exported references
    if (key === "robotMood") {
        CURRENT_MOOD = value;
    } else if (key === "selectedVoice") {
        const validVoice = getValidVoice(value);
        state.selectedVoice = validVoice;
        TTS_VOICE = validVoice;
    } else if (key === "speaking") {
        if (value) {
            state.voiceState = VOICE_STATE.SPEAKING;
        } else if (state.voiceState === VOICE_STATE.SPEAKING) {
            state.voiceState = VOICE_STATE.IDLE;
        }
    } else if (key === "thinking") {
        if (value) {
            state.voiceState = VOICE_STATE.THINKING;
        }
    } else if (key === "mic") {
        state.microphoneEnabled = Boolean(value);
        if (value) {
            state.voiceState = VOICE_STATE.LISTENING;
        }
    }

    notifySubscribers(key, value, previous);
}

export function updateState(values) {
    if (typeof values !== "object" || values === null) {
        throw new Error("updateState expects a key-value object.");
    }
    Object.entries(values).forEach(([key, value]) => {
        setState(key, value);
    });
}

export function resetState() {
    state.initialized = false;
    state.mode = APP_MODE.CHAT;
    state.theme = THEME.DARK;
    state.voiceState = VOICE_STATE.IDLE;
    state.recognitionRunning = false;
    state.microphoneEnabled = false;
    state.continuousConversation = false;
    state.selectedVoice = "af_heart";
    state.speaking = false;
    state.mic = false;
    state.robotMood = ROBOT_MOOD.NEUTRAL;
    state.thinking = false;
    state.typing = false;
    state.messages = [];
    state.chats = [];
    state.memories = [];
    state.sidebarOpen = false;
    state.memorySidebarOpen = false;
    state.jarvisOpen = false;
    
    CURRENT_MOOD = ROBOT_MOOD.NEUTRAL;
    TTS_VOICE = "af_heart";
}

/* ===========================================================
   Subscription System
   =========================================================== */

export function subscribe(key, callback) {
    ensureKeyExists(key);
    if (typeof callback !== "function") {
        throw new Error("Subscriber callback must be a function.");
    }
    if (!subscribers.has(key)) {
        subscribers.set(key, []);
    }
    subscribers.get(key).push(callback);

    // Return unsubscribe function for convenient cleanup
    return () => unsubscribe(key, callback);
}

export function unsubscribe(key, callback) {
    if (!subscribers.has(key)) {
        return;
    }
    const updated = subscribers.get(key).filter(fn => fn !== callback);
    subscribers.set(key, updated);
}

function notifySubscribers(key, value, previous) {
    if (!subscribers.has(key)) {
        return;
    }
    subscribers.get(key).forEach(callback => {
        try {
            callback(value, previous);
        } catch (error) {
            console.error(`State Subscriber Error [${key}]:`, error);
        }
    });
}

/* ===========================================================
   Domain Specific Helpers
   =========================================================== */

// Theme Helpers
export function setTheme(theme) {
    if (!Object.values(THEME).includes(theme)) {
        throw new Error(`Invalid theme: ${theme}`);
    }
    setState("theme", theme);
}

export function toggleTheme() {
    const nextTheme = state.theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    setTheme(nextTheme);
}

// Robot & Mood Helpers
export function setRobotMood(mood) {
    const backendMood = getBackendMode(mood);
    setState("robotMood", backendMood);
}

export function setCurrentMood(mood) {
    setRobotMood(mood);
}

// Voice & Audio Helpers
export function setVoiceState(voiceState) {
    if (!Object.values(VOICE_STATE).includes(voiceState)) {
        throw new Error(`Invalid voice state: ${voiceState}`);
    }
    setState("voiceState", voiceState);
}

export function setTtsVoice(voice) {
    const valid = getValidVoice(voice);
    setState("selectedVoice", valid);
}

export function setRecognitionRunning(value) {
    setState("recognitionRunning", Boolean(value));
}

export function setMicrophoneEnabled(value) {
    setState("mic", Boolean(value));
}

export function setSpeaking(value) {
    setState("speaking", Boolean(value));
}

export function setContinuousConversation(value) {
    setState("continuousConversation", Boolean(value));
}

// Chat Helpers
export function setCurrentChat(chatId) {
    setState("currentChatId", chatId);
}

export function setChats(chats) {
    setState("chats", chats);
}

export function setMessages(messages) {
    setState("messages", messages);
}

export function addMessage(message) {
    state.messages.push(message);
    state.totalMessages++;
    notifySubscribers("messages", state.messages, state.messages);
}

export function clearMessages() {
    state.messages = [];
    notifySubscribers("messages", state.messages, []);
}

// Memory Helpers (Architecture Ready)
export function setMemories(memories) {
    setState("memories", memories);
}

export function addMemory(memory) {
    state.memories.push(memory);
    notifySubscribers("memories", state.memories, state.memories);
}

export function removeMemory(index) {
    state.memories.splice(index, 1);
    notifySubscribers("memories", state.memories, state.memories);
}

// Sidebar & Jarvis Navigation Helpers
export function openSidebar() {
    setState("sidebarOpen", true);
}

export function closeSidebar() {
    setState("sidebarOpen", false);
}

export function openMemorySidebar() {
    setState("memorySidebarOpen", true);
}

export function closeMemorySidebar() {
    setState("memorySidebarOpen", false);
}

export function openJarvis() {
    setState("jarvisOpen", true);
    setState("mode", APP_MODE.JARVIS);
}

export function closeJarvis() {
    setState("jarvisOpen", false);
    setState("mode", APP_MODE.CHAT);
}

// Statistics Helpers
export function incrementVoiceRequests() {
    state.totalVoiceRequests++;
}

export function incrementTokens(count = 0) {
    state.totalTokens += Number(count);
}

export function setBackendLatency(milliseconds) {
    setState("lastLatency", milliseconds);
}

export function setBackendStatus(status) {
    setState("backendOnline", Boolean(status));
}

// Session Lifecycle
export function startSession() {
    state.sessionStarted = true;
    state.sessionStartTime = Date.now();
}

export function endSession() {
    state.sessionStarted = false;
}

export function initializeState() {
    if (state.initialized) {
        return;
    }
    state.initialized = true;
    startSession();
}

export default state;
