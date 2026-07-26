import io
import wave
import time
import hashlib
import threading
import logging

from kokoro import KPipeline

logger = logging.getLogger(__name__)

# ==========================================
# CONFIGURATION
# ==========================================

LANGUAGE = "a"

DEFAULT_VOICE = "af_heart"

CACHE_TTL = 3600

MAX_CACHE_SIZE = 300

# ==========================================
# LOAD KOKORO
# ==========================================

logger.info("Loading Kokoro TTS...")

pipeline = KPipeline(
    lang_code=LANGUAGE
)

logger.info("Kokoro Loaded Successfully.")

# ==========================================
# CACHE
# ==========================================

tts_cache = {}

cache_time = {}

cache_lock = threading.Lock()

# ==========================================
# AVAILABLE VOICES
# ==========================================

SUPPORTED_VOICES = {

    # ---------- Female ----------

    "af_heart": "Heart",
    "af_bella": "Bella",
    "af_nicole": "Nicole",
    "af_sarah": "Sarah",
    "af_sky": "Sky",

    # ---------- Male ----------

    "am_adam": "Adam",
    "am_michael": "Michael",

}

# ==========================================
# VOICE UTILITIES
# ==========================================

def get_voice(voice_name: str) -> str:
    """
    Returns a valid Kokoro voice.
    Falls back to DEFAULT_VOICE if invalid.
    """

    if not voice_name:
        return DEFAULT_VOICE

    voice_name = voice_name.lower()

    if voice_name not in SUPPORTED_VOICES:

        logger.warning(
            f"Unknown voice '{voice_name}'. "
            f"Using '{DEFAULT_VOICE}'."
        )

        return DEFAULT_VOICE

    return voice_name


def list_voices():
    """
    Returns all available voices.
    """

    return [
        {
            "id": voice_id,
            "name": display_name
        }
        for voice_id, display_name
        in SUPPORTED_VOICES.items()
    ]


# ==========================================
# CACHE UTILITIES
# ==========================================

def make_cache_key(text: str, voice: str) -> str:

    raw = f"{voice}:{text}".encode("utf-8")

    return hashlib.sha256(raw).hexdigest()


def clean_cache():

    now = time.time()

    with cache_lock:

        expired = [

            key

            for key in cache_time

            if now - cache_time[key] > CACHE_TTL

        ]

        for key in expired:

            tts_cache.pop(key, None)

            cache_time.pop(key, None)

        # Safety limit

        if len(tts_cache) > MAX_CACHE_SIZE:

            oldest = sorted(

                cache_time.items(),

                key=lambda item: item[1]

            )

            remove_count = len(tts_cache) - MAX_CACHE_SIZE

            for key, _ in oldest[:remove_count]:

                tts_cache.pop(key, None)

                cache_time.pop(key, None)


# ==========================================
# AUDIO CONVERTER
# ==========================================

def audio_to_wav_bytes(audio):

    """
    Converts Kokoro float32 numpy audio
    into standard WAV bytes.
    """

    import numpy as np

    audio = np.asarray(audio)

    audio = np.clip(audio, -1.0, 1.0)

    audio = (audio * 32767).astype(np.int16)

    buffer = io.BytesIO()

    with wave.open(buffer, "wb") as wav:

        wav.setnchannels(1)

        wav.setsampwidth(2)

        wav.setframerate(24000)

        wav.writeframes(audio.tobytes())

    buffer.seek(0)

    return buffer.read()


# ==========================================
# GENERATE TTS
# ==========================================

def generate_tts(text: str, voice: str = DEFAULT_VOICE):

    if not text:
        return None

    text = " ".join(text.strip().split())

    if not text:
        return None

    voice = get_voice(voice)

    cache_key = make_cache_key(text, voice)

    # ======================================
    # CACHE
    # ======================================

    with cache_lock:

        if cache_key in tts_cache:

            if time.time() - cache_time[cache_key] < CACHE_TTL:

                logger.info("⚡ TTS Cache Hit")

                return tts_cache[cache_key]

    clean_cache()

    # ======================================
    # GENERATE SPEECH
    # ======================================

    try:

        logger.info(
            f"🔊 Generating Speech | Voice={voice}"
        )

        generator = pipeline(

            text,

            voice=voice

        )

        audio = None

        for _, _, samples in generator:

            audio = samples

            break

        if audio is None:

            logger.error("No audio returned from Kokoro.")

            return None

        wav_bytes = audio_to_wav_bytes(audio)

        with cache_lock:

            tts_cache[cache_key] = wav_bytes

            cache_time[cache_key] = time.time()

        logger.info(
            f"✅ Speech Generated ({len(wav_bytes)} bytes)"
        )

        return wav_bytes

    except Exception as e:

        logger.exception(
            f"TTS Generation Failed: {e}"
        )

        return None

# ==========================================
# CACHE MANAGEMENT
# ==========================================

def clear_cache():
    """
    Clear all cached audio.
    """

    with cache_lock:

        tts_cache.clear()
        cache_time.clear()

    logger.info("🧹 TTS cache cleared.")


def cache_info():
    """
    Returns cache statistics.
    """

    with cache_lock:

        return {

            "items": len(tts_cache),

            "max_items": MAX_CACHE_SIZE,

            "ttl_seconds": CACHE_TTL

        }


# ==========================================
# VOICE INFORMATION
# ==========================================

def get_default_voice():

    return DEFAULT_VOICE


def set_default_voice(voice):

    global DEFAULT_VOICE

    voice = get_voice(voice)

    DEFAULT_VOICE = voice

    logger.info(f"Default voice changed to {voice}")


# ==========================================
# HEALTH CHECK
# ==========================================

def health_check():

    return {

        "status": "online",

        "engine": "Kokoro",

        "language": LANGUAGE,

        "default_voice": DEFAULT_VOICE,

        "voices": len(SUPPORTED_VOICES),

        "cache": cache_info()

    }


# ==========================================
# TEST
# ==========================================

if __name__ == "__main__":

    logger.setLevel(logging.INFO)

    print("=" * 50)
    print("Prototype-X TTS Engine")
    print("=" * 50)

    print(health_check())

    audio = generate_tts(
        "Hello Shivam. Prototype X is now running locally.",
        DEFAULT_VOICE
    )

    if audio:

        with open("sample.wav", "wb") as f:

            f.write(audio)

        print("[SUCCESS] sample.wav created successfully.")

    else:

        print("[ERROR] Failed to generate speech.")


