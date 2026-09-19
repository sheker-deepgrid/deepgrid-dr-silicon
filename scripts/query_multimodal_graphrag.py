#!/usr/bin/env python3
"""
query_multimodal_graphrag.py — Query the Multimodal GraphRAG index across text,
silicon die layouts, architecture diagrams, simulation waveforms, and slide decks.
Uses models/gemini-embedding-2 (3,072 dimensions).
"""
import os
import sys
import json
import math
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, "/home/sheke/content-ideas/scripts")
from gemini_embed import embed, cosine_similarity

def load_index():
    meta_path = ROOT / "public/graphrag/multimodal-semantic.json"
    bin_path = ROOT / "public/graphrag/multimodal-semantic.bin"
    cache_path = ROOT / "app/data/.multimodal_embed_cache.json"

    # If bin is not fully written yet, load directly from cache and visual assets manifest
    visuals_path = ROOT / "app/data/graphrag-visual-assets.json"
    unified_path = ROOT / "app/data/graphrag-unified-index.json"

    with open(visuals_path, "r", encoding="utf-8") as f:
        visuals = json.load(f)["visualAssets"]

    chunks = []
    nodes = []
    if unified_path.exists():
        with open(unified_path, "r", encoding="utf-8") as f:
            u = json.load(f)
            chunks = u.get("chunks", [])
            nodes = u.get("nodes", [])

    cache = {}
    if cache_path.exists():
        with open(cache_path, "r", encoding="utf-8") as f:
            cache = json.load(f)

    return visuals, chunks, nodes, cache

def search(query_text=None, query_image=None, top_k=5):
    visuals, chunks, nodes, cache = load_index()

    if query_image and not os.path.exists(query_image):
        if (ROOT / query_image).exists():
            query_image = str(ROOT / query_image)

    print(f"Embedding query using models/gemini-embedding-2 (3,072 dims)...")
    q_vec = embed(text=query_text, image_path=query_image, model="models/gemini-embedding-2")

    # Score Visual Assets
    visual_scores = []
    for v in visuals:
        vec = cache.get(v["id"])
        if vec:
            sim = cosine_similarity(q_vec, vec)
            visual_scores.append((sim, v))

    visual_scores.sort(key=lambda x: x[0], reverse=True)

    # Score PDF Chunks
    chunk_scores = []
    for c in chunks:
        vec = cache.get(c["id"])
        if vec:
            sim = cosine_similarity(q_vec, vec)
            chunk_scores.append((sim, c))

    chunk_scores.sort(key=lambda x: x[0], reverse=True)

    print("\n" + "=" * 70)
    print(f"  MULTIMODAL GRAPHRAG SEARCH RESULTS")
    if query_text:
        print(f"  Query: \"{query_text}\"")
    if query_image:
        print(f"  Query Image: {query_image}")
    print("=" * 70)

    print("\n📷 TOP VISUAL & SCHEMATIC EVIDENCE:")
    for sim, v in visual_scores[:top_k]:
        type_badge = f"[{v['visualType'].upper()}]"
        print(f"  {sim:.4f}  {type_badge:<24} {v['name']}")
        print(f"         Asset File: {v['filePath']}")
        print(f"         Caption:    {v['caption'][:120]}...")
        print()

    if chunk_scores:
        print("\n📄 TOP WHITEPAPER & SPECIFICATION CITATIONS:")
        for sim, c in chunk_scores[:top_k]:
            print(f"  {sim:.4f}  {c['docTitle']} ({c['pageLabel']})")
            print(f"         Section: {c.get('section', '')}")
            print(f"         Snippet: {c['text'][:140].replace(chr(10), ' ')}...")
            print()

def main():
    parser = argparse.ArgumentParser(description="Query Multimodal GraphRAG index")
    parser.add_argument("--query", "-q", help="Text search query")
    parser.add_argument("--image", "-i", help="Image query path")
    parser.add_argument("--top", "-k", type=int, default=3, help="Number of results to display")

    args = parser.parse_args()
    if not args.query and not args.image:
        parser.print_help()
        sys.exit(1)

    search(query_text=args.query, query_image=args.image, top_k=args.top)

if __name__ == "__main__":
    main()
