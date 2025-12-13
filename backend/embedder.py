#!/usr/bin/env python3
import json
import argparse
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    MODEL_READY = True
except Exception:
    MODEL_READY = False

_MODEL = None


def load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    if not MODEL_READY:
        return None
    try:
        _MODEL = SentenceTransformer("Qwen/Qwen3-Embedding-0.6B")
    except Exception:
        _MODEL = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _MODEL


def embed_text(text: str, instruction: str = ""):
    clean_text = (text or "").strip()
    clean_instr = (instruction or "").strip()
    if not clean_text:
        return {"vector": [], "x": 0.0, "y": 0.0}

    full_text = f"{clean_instr}\n{clean_text}" if clean_instr else clean_text

    model = load_model()
    if model:
        emb = model.encode(full_text, convert_to_numpy=True, normalize_embeddings=False, dtype="float16")
    else:
        rng = np.random.default_rng(seed=42 + len(clean_text))
        emb = rng.normal(size=16).astype("float16")

    emb = np.array(emb, dtype=float)
    x = float(np.tanh(float(emb[0])))
    y = float(np.tanh(float(emb[1])))
    return {"vector": emb.tolist(), "x": x, "y": y}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--instruction", default="")
    args = parser.parse_args()
    result = embed_text(args.text, args.instruction)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
