/* ============================================================
   Prototype-X v2
   File: jarvis.js
   Purpose: Immersive Fullscreen Voice Mode Assistant & State Machine

   Responsibility:
   - Pure black fullscreen overlay rendering (#jarvisOverlay).
   - Prominent Centered Bot Face (#JarvisBot) with identical animations & state switching.
   - Sidebar hamburger navigation toggle inside overlay (#jarvisMenuToggle).
   - Dedicated Cancel/Exit button (#jarvisClose).
   - Deterministic State Machine: Idle -> Listening -> Thinking -> Speaking -> Listening.
   - Zero text areas, zero headings, pure voice-visual focus.
   - Non-destructive return to Chat Mode (Zero history loss, no state reset).

   Author: Refactored Architecture
   ============================================================ */

import { STATE, CURRENT_MOOD, openJarvis as openStateJarvis, closeJarvis as closeStateJarvis, openSidebar } from "./state.js";
import { handleSendText } from "./chat.js";
import { createJarvisRecognition } from "./voice.js";

/* ============================================================
   Module Internal State
   ============================================================ */

let overlay = null;
let stage = null;
let robot = null;
let micButton = null;
let recognition = null;
let refreshHero = null;

let active = false;
let listening = false;
let thinking = false;
let speaking = false;

/* ============================================================
   State Machine Constant States
   ============================================================ */

export const JARVIS_STATES = Object.freeze({
    IDLE: "idle",
    LISTENING: "listening",
    THINKING: "thinking",
    SPEAKING: "speaking"
});

/* ============================================================
   Public Initializer
   ============================================================ */

export function initJarvis(deps = {}) {
    micButton = deps.micBtn;
    refreshHero = deps.refreshHero;

    buildOverlay();

    // Bind chat bar mic button to launch Fullscreen Voice Mode
    if (micButton) {
        micButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (active) {
                exitJarvis();
            } else {
                enterJarvis();
            }
        });
    }

    // Bind sidebar Voice tile if present
    const voiceTile = document.getElementById("voiceTile");
    if (voiceTile) {
        voiceTile.addEventListener("click", (e) => {
            enterJarvis();
        });
    }

    recognition = createJarvisRecognition();
    setupRecognition();
}

/* ============================================================
   Overlay DOM Builder (No Headings, No Text Area)
   ============================================================ */

function buildOverlay() {
    if (document.getElementById("jarvisOverlay")) {
        overlay = document.getElementById("jarvisOverlay");
        stage = document.getElementById("jarvisStage");
        robot = document.getElementById("JarvisBot");
        return;
    }

    overlay = document.createElement("div");
    overlay.className = "jarvis-overlay";
    overlay.id = "jarvisOverlay";
    overlay.dataset.state = JARVIS_STATES.IDLE;

    overlay.innerHTML = `
        <button class="jarvis-menu-btn" id="jarvisMenuToggle" aria-label="Open sidebar menu" title="Open Menu">
            <span class="bars">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </span>
        </button>
        <button class="jarvis-close" id="jarvisClose" aria-label="Exit Voice Mode" title="Exit Voice Mode">×</button>
        <div class="jarvis-stage" id="jarvisStage">
            <div class="jarvis-robot-container">
                <div id="JarvisBot" class="bot jarvis-bot neutral mood-neutral">
                    <div id="head">
                        <div id="left-ear">
                            <div id="left-ear-inner"></div>
                        </div>
                        <div id="face">
                            <div id="eyes">
                                <div id="left-eye"></div>
                                <div id="right-eye"></div>
                            </div>
                            <div id="mouth"></div>
                        </div>
                        <div id="right-ear">
                            <div id="right-ear-inner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    stage = document.getElementById("jarvisStage");
    robot = document.getElementById("JarvisBot");

    // Close button event handler
    const closeBtn = document.getElementById("jarvisClose");
    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            exitJarvis();
        });
    }

    // Sidebar Hamburger button event handler
    const menuBtn = document.getElementById("jarvisMenuToggle");
    if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const sidebar = document.getElementById("sidebar");
            const backdrop = document.getElementById("backdrop");
            if (sidebar) sidebar.classList.add("active");
            if (backdrop) backdrop.classList.add("show");
            openSidebar();
        });
    }

    // Clicking Robot Face toggles listening
    if (robot) {
        robot.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleListening();
        });
    }

    // Keyboard ESC key exit handler
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && active) {
            exitJarvis();
        }
    });
}

/* ============================================================
   Enter & Exit Voice Mode Lifecycle
   ============================================================ */

export function enterJarvis() {
    if (active) return;

    active = true;
    openStateJarvis();

    if (overlay) {
        overlay.classList.add("active");
    }
    document.body.classList.add("jarvis-open");

    setState(JARVIS_STATES.IDLE);

    // Auto-start listening on enter
    setTimeout(() => {
        if (active && !listening && !thinking && !speaking) {
            startListening();
        }
    }, 150);
}

export function exitJarvis() {
    if (!active) return;

    stopListening();

    active = false;
    closeStateJarvis();

    if (overlay) {
        overlay.classList.remove("active");
    }
    document.body.classList.remove("jarvis-open");

    setState(JARVIS_STATES.IDLE);
}

function toggleListening() {
    if (listening) {
        stopListening();
        setState(JARVIS_STATES.IDLE);
    } else if (!thinking && !speaking) {
        startListening();
    }
}

/* ============================================================
   Deterministic State Machine Transition
   ============================================================ */

function setState(state) {
    if (!overlay || !robot) return;

    overlay.dataset.state = state;

    // Remove old status animation classes
    robot.classList.remove("speaking", "thinking", "listening", "computing");

    if (state === JARVIS_STATES.LISTENING) {
        robot.classList.add("listening");
    } else if (state === JARVIS_STATES.THINKING) {
        robot.classList.add("thinking");
    } else if (state === JARVIS_STATES.SPEAKING) {
        robot.classList.add("speaking");
    }

    // Synchronize personality mood class for eye colors
    const moodClass = CURRENT_MOOD || "neutral";
    robot.classList.remove("neutral", "hardcore", "caution", "mood-neutral", "mood-hardcore", "mood-caution");
    robot.classList.add(moodClass, "mood-" + moodClass);
}

/* ============================================================
   Hero & Visualizer State Synchronization
   =========================================================== */

function syncHero() {
    STATE.mic = listening;
    STATE.thinking = thinking;
    STATE.speaking = speaking;

    if (refreshHero) {
        refreshHero();
    }
}

/* ============================================================
   Speech Listening Lifecycle
   =========================================================== */

function startListening() {
    if (listening || !recognition) return;

    listening = true;
    thinking = false;
    speaking = false;

    setState(JARVIS_STATES.LISTENING);
    syncHero();

    recognition.start();
}

function stopListening() {
    if (!listening || !recognition) return;

    listening = false;
    recognition.stop();
    syncHero();
}

/* ============================================================
   Speech Recognition Event Setup
   =========================================================== */

function setupRecognition() {
    if (!recognition) {
        console.warn("[Jarvis] Speech Recognition is unavailable.");
        return;
    }

    let localTranscript = "";

    recognition.setOnResult((text, isFinal) => {
        localTranscript = text || "";
        if (isFinal) {
            listening = false;
            thinking = true;
            speaking = false;

            setState(JARVIS_STATES.THINKING);
            syncHero();
        }
    });

    recognition.setOnEnd(async (finalText) => {
        listening = false;
        syncHero();

        const query = (finalText || localTranscript || "").trim();
        localTranscript = "";

        if (!query) {
            if (active) {
                setState(JARVIS_STATES.IDLE);
            }
            return;
        }

        await processVoiceInput(query);
    });
}

/* ============================================================
   Backend AI Query Processor
   =========================================================== */

async function processVoiceInput(text) {
    thinking = true;
    speaking = false;

    setState(JARVIS_STATES.THINKING);
    syncHero();

    try {
        await handleSendText(text, false, {
            skipUI: false,
            skipSpeak: false
        });
    } catch (err) {
        console.error("[Jarvis] processVoiceInput error:", err);
    } finally {
        thinking = false;
        speaking = true;

        setState(JARVIS_STATES.SPEAKING);
        syncHero();

        waitForSpeechFinish();
    }
}

/* ============================================================
   TTS Completion & Conversation Loop Waiter
   =========================================================== */

function waitForSpeechFinish() {
    const timer = setInterval(() => {
        if (STATE.speaking) return;

        clearInterval(timer);
        speaking = false;
        syncHero();

        if (!active) return;

        setState(JARVIS_STATES.IDLE);

        // Auto-restart continuous listening loop in Jarvis mode
        setTimeout(() => {
            if (active && !listening && !thinking && !speaking) {
                startListening();
            }
        }, 500);
    }, 120);
}

export default {
    initJarvis,
    enterJarvis,
    exitJarvis,
    JARVIS_STATES
};
