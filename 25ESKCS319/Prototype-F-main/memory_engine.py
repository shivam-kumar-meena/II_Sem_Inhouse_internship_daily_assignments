"""
Prototype-X Memory Engine
Production-ready local memory engine with safe fallback.

Requirements:
    pip install chromadb sentence-transformers
"""

import json
import logging
import os
import sqlite3
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

BASE_DIR = os.path.dirname(__file__)
MEMORY_DIR = os.path.join(BASE_DIR, "memory")
CHROMA_DIR = os.path.join(MEMORY_DIR, "chroma")
SQLITE_DB = os.path.join(MEMORY_DIR, "profile.db")
BACKUP_FILE = os.path.join(MEMORY_DIR, "backup.json")

os.makedirs(CHROMA_DIR, exist_ok=True)

# Safe Fallback Engine if chromadb or sentence-transformers is loading/missing
HAS_CHROMADB = False
embedding_model = None
collection = None

try:
    import chromadb
    from sentence_transformers import SentenceTransformer
    
    logger.info("Loading embedding model...")
    embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    logger.info("Embedding model loaded.")

    client = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.get_or_create_collection("prototype_memory")
    HAS_CHROMADB = True
except Exception as e:
    logger.warning(f"ChromaDB / SentenceTransformer unavailable ({e}). Operating in memory fallback mode.")

connection = sqlite3.connect(SQLITE_DB, check_same_thread=False)
cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memory_text TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
connection.commit()

_memory_fallback = []


def _get_embedding(text: str) -> List[float]:
    if HAS_CHROMADB and embedding_model:
        return embedding_model.encode(text).tolist()
    return []


def _backup_memories():
    try:
        memories = get_all_memories()
        with open(BACKUP_FILE, "w", encoding="utf-8") as f:
            json.dump(memories, f, indent=4)
    except Exception as e:
        logger.error(f"Failed to save backup file: {e}")


def add_memory(memory_text: str) -> bool:
    memory_text = memory_text.strip()
    if not memory_text:
        return False

    try:
        cursor.execute("INSERT OR IGNORE INTO profile (memory_text) VALUES (?)", (memory_text,))
        connection.commit()

        if HAS_CHROMADB and collection:
            cursor.execute("SELECT id FROM profile WHERE memory_text = ?", (memory_text,))
            row = cursor.fetchone()
            if row:
                doc_id = str(row[0])
                embedding = _get_embedding(memory_text)
                collection.upsert(
                    ids=[doc_id],
                    embeddings=[embedding],
                    documents=[memory_text]
                )
        else:
            if memory_text not in _memory_fallback:
                _memory_fallback.append(memory_text)

        _backup_memories()
        return True
    except Exception as e:
        logger.error(f"Error adding memory: {e}")
        return False


def get_all_memories() -> List[str]:
    try:
        cursor.execute("SELECT memory_text FROM profile ORDER BY id DESC")
        rows = cursor.fetchall()
        sqlite_memories = [row[0] for row in rows]
        if sqlite_memories:
            return sqlite_memories
        return _memory_fallback
    except Exception as e:
        logger.error(f"Error fetching memories: {e}")
        return _memory_fallback


def search_memory(query: str, top_k: int = 3) -> List[str]:
    if not query.strip():
        return []

    try:
        if HAS_CHROMADB and collection:
            query_embedding = _get_embedding(query)
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            documents = results.get("documents", [[]])[0]
            return documents
        else:
            all_mems = get_all_memories()
            return all_mems[:top_k]
    except Exception as e:
        logger.error(f"Error searching memory: {e}")
        return []


def delete_memory(index: int) -> bool:
    try:
        memories = get_all_memories()
        if index < 0 or index >= len(memories):
            return False

        memory_text = memories[index]

        cursor.execute("SELECT id FROM profile WHERE memory_text = ?", (memory_text,))
        row = cursor.fetchone()

        cursor.execute("DELETE FROM profile WHERE memory_text = ?", (memory_text,))
        connection.commit()

        if row and HAS_CHROMADB and collection:
            doc_id = str(row[0])
            try:
                collection.delete(ids=[doc_id])
            except Exception:
                pass

        if memory_text in _memory_fallback:
            _memory_fallback.remove(memory_text)

        _backup_memories()
        return True
    except Exception as e:
        logger.error(f"Error deleting memory: {e}")
        return False


def edit_memory(index: int, new_text: str) -> bool:
    new_text = new_text.strip()
    if not new_text:
        return False

    try:
        memories = get_all_memories()
        if index < 0 or index >= len(memories):
            return False

        old_text = memories[index]

        cursor.execute("SELECT id FROM profile WHERE memory_text = ?", (old_text,))
        row = cursor.fetchone()

        cursor.execute("UPDATE profile SET memory_text = ? WHERE memory_text = ?", (new_text, old_text))
        connection.commit()

        if row and HAS_CHROMADB and collection:
            doc_id = str(row[0])
            new_embedding = _get_embedding(new_text)
            collection.upsert(
                ids=[doc_id],
                embeddings=[new_embedding],
                documents=[new_text]
            )

        if old_text in _memory_fallback:
            idx = _memory_fallback.index(old_text)
            _memory_fallback[idx] = new_text

        _backup_memories()
        return True
    except Exception as e:
        logger.error(f"Error editing memory: {e}")
        return False
