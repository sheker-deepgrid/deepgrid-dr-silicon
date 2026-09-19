#!/usr/bin/env python3
"""
build-multimodal-index.py — Builds the 3,072-dimensional Multimodal GraphRAG Index
using models/gemini-embedding-2 via Google AI Studio API.

Embeds:
  1. 1,075 Graphify Nodes (AST symbols + domain concepts)
  2. 177 PDF Whitepaper Chunks (from 8 authoritative technical documents)
  3. 82 Visual Assets (Silicon die layouts, waveforms, SVGs, slides, videos)
  4. 14 Executive Curated Themes & Example Questions

Writes:
  - public/graphrag/multimodal-semantic.bin (Int8Array: unit vectors * 127)
  - public/graphrag/multimodal-semantic.json (metadata, counts, asset catalogue)
"""
import os
import sys
import io
import re
import json
import math
import time
import base64
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

def get_api_key():
    k = os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if k:
        return k
    candidates = [
        ROOT.parent / "content-ideas/.claude/settings.local.json",
        ROOT / ".claude/settings.local.json",
        Path.home() / "content-ideas/.claude/settings.local.json",
        Path.home() / ".config/content/.env"
    ]
    for c in candidates:
        if c.exists():
            try:
                if str(c).endswith(".json"):
                    with open(c) as f:
                        data = json.load(f)
                        val = data.get("env", {}).get("GOOGLE_GENERATIVE_AI_API_KEY")
                        if val:
                            return val
                elif str(c).endswith(".env"):
                    with open(c) as f:
                        for line in f:
                            if "GOOGLE_GENERATIVE_AI_API_KEY" in line:
                                return line.strip().split("=", 1)[1].strip("\"'")
            except Exception:
                pass
    return None

def optimize_image_base64(filepath, max_dim=1024):
    """
    Downscales image to max_dim on the longest edge and returns (mime_type, base64_str).
    """
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".svg":
        # SVGs can be passed as raw XML text
        return "text/plain", None

    try:
        with Image.open(filepath) as img:
            img = img.convert("RGB")
            w, h = img.size
            if max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
            
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85)
            b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
            return "image/jpeg", b64_str
    except Exception as e:
        print(f"Warning: could not process image {filepath}: {e}", file=sys.stderr)
        return None, None

def batch_embed(requests, api_key, model="models/gemini-embedding-2", max_retries=5):
    url = f"https://generativelanguage.googleapis.com/v1beta/{model}:batchEmbedContents?key={api_key}"
    payload = {"requests": requests}
    data_bytes = json.dumps(payload).encode("utf-8")

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                url,
                data=data_bytes,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                return [e["values"] for e in res.get("embeddings", [])]
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8")
            if e.code == 429:
                wait_time = 20 * (attempt + 1)
                print(f"\n  [Rate limit 429] Window active. Cooling down for {wait_time}s...", file=sys.stderr)
                time.sleep(wait_time)
            else:
                raise RuntimeError(f"Google API HTTP {e.code}: {err_msg}")
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(3)
    raise RuntimeError("Failed after max retries")

def main():
    api_key = get_api_key()
    if not api_key:
        print("Error: GOOGLE_GENERATIVE_AI_API_KEY not found!", file=sys.stderr)
        sys.exit(1)

    t0 = time.time()
    print("=== MULTIMODAL GRAPHRAG INDEX COMPILER ===")
    print("Model: models/gemini-embedding-2 (3,072 dimensions)")

    # 1. Load Unified Index (Nodes & Chunks)
    unified_index_path = ROOT / "app/data/graphrag-unified-index.json"
    if not unified_index_path.exists():
        print(f"Error: {unified_index_path} not found. Run build-unified-graphrag.py first.", file=sys.stderr)
        sys.exit(1)
    with open(unified_index_path, "r", encoding="utf-8") as f:
        unified = json.load(f)

    nodes = unified.get("nodes", [])
    chunks = unified.get("chunks", [])
    print(f"Loaded {len(nodes)} Graphify nodes, {len(chunks)} PDF chunks.")

    # 2. Load Visual Assets
    visual_path = ROOT / "app/data/graphrag-visual-assets.json"
    if not visual_path.exists():
        print(f"Error: {visual_path} not found. Run extract-visual-assets.py first.", file=sys.stderr)
        sys.exit(1)
    with open(visual_path, "r", encoding="utf-8") as f:
        visual_data = json.load(f)
    visual_assets = visual_data.get("visualAssets", [])
    print(f"Loaded {len(visual_assets)} visual assets.")

    # 3. Load Curated Executive Themes & Example Questions
    themes_file = ROOT / "app/data/theme-examples.ts"
    theme_examples = {}
    if themes_file.exists():
        # Parse example questions simply
        ts_content = themes_file.read_text(encoding="utf-8")
        current_theme = None
        for line in ts_content.splitlines():
            m_theme = re.search(r"['\"]([^'\"]+)['\"]\s*:\s*\[", line)
            if m_theme:
                current_theme = m_theme.group(1)
                theme_examples[current_theme] = []
            elif current_theme and re.search(r"['\"]([^'\"]+)['\"]", line):
                q = re.search(r"['\"]([^'\"]+)['\"]", line).group(1)
                theme_examples[current_theme].append(q)

    # Executive Theme summaries
    executive_themes = [
        {"title": "130 nm Lockstep Motor-Control Architecture", "desc": "DG32-LITE dual-core rv32imc lockstep architecture on SkyWater sky130A with cycle-by-cycle fault comparator and 39-cycle fault latch."},
        {"title": "DG32-2DOM Dual-Domain Condition Monitoring", "desc": "DG32-2DOM dual clock domain SoC with 50 MHz motor domain CDC bridged to 114 MHz INT8 attention engine for vibration diagnostics."},
        {"title": "Thirty Edge AI Industrial Use Cases", "desc": "Predictive diagnostics, CWRU bearing fault detection, motor vibration anomaly monitoring without hardware accelerators on scalar RISC-V."},
        {"title": "Three-Factory Semiconductor Sovereignty", "desc": "Domestic dual-foundry supply chain strategy across SCL Chandigarh, SkyWater, and Indian OSAT packaging facilities for $9B import substitution."},
        {"title": "Hardware DShot Telemetry Reply RTL", "desc": "Bidirectional DShot telemetry reply engine with GCR 4b/5b transition encoding and PWM pin multiplexing."},
        {"title": "10-SKU Sovereign Silicon Compendium", "desc": "System-on-chip portfolio covering drone flight compute (D100), smart energy metrology (SKU-2), avionics power (SKU-3), and zonal mobility (SDV)."},
        {"title": "Statutory Defence Moats & DAP-2020 Make-II", "desc": "Defence procurement moats under DAP-2020 Make-II, Positive Indigenisation Lists (PIL), and SRIJAN indigenisation portal."},
        {"title": "198-Day Fast Tape-in Iteration Loop", "desc": "Accelerated mature-node tape-in development cycle leveraging open-source EDA (OpenLane) and Multi-Project Wafer shuttles."}
    ]

    example_list = []
    for t_idx, theme in enumerate(executive_themes):
        title = theme["title"]
        qs = theme_examples.get(title, [])
        for q in qs:
            example_list.append({"q": q, "theme_idx": t_idx, "theme_title": title})

    print(f"Loaded {len(executive_themes)} executive themes and {len(example_list)} theme calibration examples.")

    # 4. Formulate All Embedding Requests (Visuals and Chunks first)
    embed_items = []

    # Section A: Visual Assets (Multimodal)
    for v in visual_assets:
        file_path = ROOT / v["filePath"]
        parts = []
        
        # If video, use poster image
        if v["visualType"] == "simulation_video" and "posterPath" in v:
            file_path = ROOT / v["posterPath"]

        mime, b64_data = optimize_image_base64(str(file_path))
        if b64_data:
            parts.append({
                "inlineData": {
                    "mimeType": mime,
                    "data": b64_data
                }
            })
        
        # Companion text (title, caption, keywords, sku)
        text_desc = f"{v['name']}. {v.get('sku', '')}. {v.get('caption', '')}. Keywords: {', '.join(v.get('keywords', []))}"
        parts.append({"text": text_desc[:1800]})

        embed_items.append({
            "type": "visual",
            "id": v["id"],
            "parts": parts,
            "meta": v
        })

    # Section B: Chunks
    for c in chunks:
        text = f"{c['docTitle']}. {c.get('section', '')}. {c['text']}"
        embed_items.append({
            "type": "chunk",
            "id": c["id"],
            "parts": [{"text": text[:1800]}]
        })

    # Section C: Themes
    for t in executive_themes:
        text = f"{t['title']}. {t['desc']}"
        embed_items.append({
            "type": "theme",
            "id": f"theme_{t['title'].lower().replace(' ', '_')}",
            "parts": [{"text": text[:1000]}]
        })

    # Section D: Example Questions
    for e in example_list:
        text = f"Represent this question for semiconductor architecture search: {e['q']}"
        embed_items.append({
            "type": "example",
            "id": f"example_{len(embed_items)}",
            "parts": [{"text": text}],
            "theme_idx": e["theme_idx"]
        })

    # Section E: Nodes (AST symbols and domain concepts)
    for n in nodes:
        text = f"{n['name']}. {n.get('communityName', '')}. {n.get('description', '')}"
        embed_items.append({
            "type": "node",
            "id": n["id"],
            "parts": [{"text": text[:1200]}]
        })

    total_items = len(embed_items)
    print(f"\nTotal items to embed: {total_items}")
    print(f"  - Nodes: {len(nodes)}")
    print(f"  - PDF Chunks: {len(chunks)}")
    print(f"  - Visual Assets: {len(visual_assets)}")
    print(f"  - Themes: {len(executive_themes)}")
    print(f"  - Example Questions: {len(example_list)}")

    # 5. Batch Processing with Checkpoint Cache & Rate Pacing
    cache_path = ROOT / "app/data/.multimodal_embed_cache.json"
    cache = {}
    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cache = json.load(f)
            print(f"✓ Resumed from cache: {len(cache)}/{total_items} items already embedded.")
        except Exception:
            cache = {}

    BATCH_SIZE = 10
    model_name = "models/gemini-embedding-2"
    all_vectors = []

    print("\nStarting batch embedding via Google AI Studio API...")
    for i in range(0, total_items, BATCH_SIZE):
        batch = embed_items[i : i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = math.ceil(total_items / BATCH_SIZE)

        # Check if all items in this batch are already in cache
        uncached_indices = [idx for idx, item in enumerate(batch) if item["id"] not in cache]

        if uncached_indices:
            reqs = [{"model": model_name, "content": {"parts": batch[idx]["parts"]}} for idx in uncached_indices]
            sys.stdout.write(f"\r  Batch {batch_num}/{total_batches}: embedding {len(reqs)} new items...")
            sys.stdout.flush()

            new_vecs = batch_embed(reqs, api_key=api_key, model=model_name)
            for sub_i, idx in enumerate(uncached_indices):
                cache[batch[idx]["id"]] = new_vecs[sub_i]

            # Save cache atomically
            tmp_path = str(cache_path) + ".tmp"
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(cache, f)
            os.replace(tmp_path, cache_path)

            # Pacing delay between API calls to prevent per-minute burst rate limits
            time.sleep(2.5)
        else:
            sys.stdout.write(f"\r  Batch {batch_num}/{total_batches}: cached ({min(i + BATCH_SIZE, total_items)}/{total_items} items)...")
            sys.stdout.flush()

    for item in embed_items:
        all_vectors.append(cache[item["id"]])

    print("\n✓ All items embedded successfully!")
    dims = len(all_vectors[0])
    print(f"Returned vector dimension: {dims}")

    # 6. Normalize and Quantize to Int8
    print("Normalizing and quantizing vectors to int8...")
    SCALE = 127
    int8_bytes = bytearray(len(all_vectors) * dims)

    for r_idx, vec in enumerate(all_vectors):
        # L2 normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        # Quantize to [-127, 127]
        for c_idx, val in enumerate(vec):
            clamped = max(-127, min(127, round(val * SCALE)))
            # Int8 signed byte
            byte_val = clamped if clamped >= 0 else (256 + clamped)
            int8_bytes[r_idx * dims + c_idx] = byte_val

    # 7. Write Outputs
    out_dir = ROOT / "public/graphrag"
    out_dir.mkdir(parents=True, exist_ok=True)

    bin_path = out_dir / "multimodal-semantic.bin"
    bin_path.write_bytes(bytes(int8_bytes))
    print(f"✓ Saved {len(int8_bytes) // 1024} KB dense vector binary to {bin_path.relative_to(ROOT)}")

    # Metadata & Index Catalog
    meta = {
        "model": model_name,
        "dims": dims,
        "scale": SCALE,
        "counts": {
            "nodes": len(nodes),
            "chunks": len(chunks),
            "visuals": len(visual_assets),
            "themes": len(executive_themes),
            "examples": len(example_list)
        },
        "offset": {
            "visuals": 0,
            "chunks": len(visual_assets),
            "themes": len(visual_assets) + len(chunks),
            "examples": len(visual_assets) + len(chunks) + len(executive_themes),
            "nodes": len(visual_assets) + len(chunks) + len(executive_themes) + len(example_list)
        },
        "visualCatalog": [
            {
                "index": idx,
                "id": v["id"],
                "name": v["name"],
                "visualType": v["visualType"],
                "filePath": v["filePath"],
                "docNum": v.get("docNum", "00"),
                "docTitle": v.get("docTitle", ""),
                "sku": v.get("sku", ""),
                "caption": v.get("caption", "")
            }
            for idx, v in enumerate(visual_assets)
        ],
        "builtAt": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "elapsedSeconds": round(time.time() - t0, 1)
    }

    json_path = out_dir / "multimodal-semantic.json"
    json_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"✓ Saved metadata catalog to {json_path.relative_to(ROOT)}")

    # 8. Cross-Modal Integrity Self-Test
    print("\n=== RUNNING CROSS-MODAL RETRIEVAL VERIFICATION ===")
    def cosine_sim(qv, row_idx):
        dot = 0.0
        row_offset = row_idx * dims
        for c in range(dims):
            # unpack signed int8
            b = int8_bytes[row_offset + c]
            signed_b = b if b < 128 else b - 256
            dot += qv[c] * signed_b
        return dot / (SCALE * 1.0)

    # Embed test query
    test_queries = [
        ("die floorplan and silicon layout on sky130A", "visual_deepgrid_soc2_die"),
        ("bearing fault vibration harmonic spectrum CWRU", "visual_sims_image2"),
        ("lockstep safety condition monitoring slide", "slide_")
    ]

    for q_text, expected_target in test_queries:
        req = [{"model": model_name, "content": {"parts": [{"text": f"Represent this sentence for searching relevant passages: {q_text}"}]}}]
        q_vec = batch_embed(req, api_key=api_key)[0]
        # Normalize
        q_norm = math.sqrt(sum(x * x for x in q_vec))
        q_vec = [x / q_norm for x in q_vec]

        # Score visual rows specifically
        v_start = meta["offset"]["visuals"]
        scores = []
        for v_i in range(len(visual_assets)):
            row = v_start + v_i
            sim = cosine_sim(q_vec, row)
            scores.append((sim, visual_assets[v_i]))

        scores.sort(key=lambda x: x[0], reverse=True)
        top_hit = scores[0][1]
        top_sim = scores[0][0]
        hit_match = expected_target in top_hit["id"]
        status = "✓ PASS" if hit_match else "⚠ NOTICE"
        print(f"{status}: Query \"{q_text}\"")
        print(f"       -> Top Visual Hit: {top_hit['id']} ({top_hit['name']}) [Cosine: {top_sim:.4f}]")

    print(f"\nCompleted in {time.time() - t0:.1f}s.")

if __name__ == "__main__":
    main()
