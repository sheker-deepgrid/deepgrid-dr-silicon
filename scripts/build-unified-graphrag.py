#!/usr/bin/env python3
import json, re, math
from pathlib import Path
import fitz

def main():
    # 1. Load Graphify AST Graph
    with open('/home/sheke/deepgrid-dr-site/graphify-out/graph.json') as f:
        graphify = json.load(f)

    nodes = {}
    for n in graphify['nodes']:
        nid = n['id']
        src_file = n.get('source_file', '')
        src_loc = n.get('source_location', '')
        cname = n.get('community_name', 'Silicon Subsystem')
        nodes[nid] = {
            'id': nid,
            'name': n.get('label', nid),
            'shortName': n.get('norm_label', n.get('label', nid)),
            'category': n.get('file_type', 'architecture'),
            'communityId': n.get('community', 0),
            'communityName': cname,
            'description': f"RTL / software subsystem in {src_file}:{src_loc} belonging to community '{cname}'.",
            'origin': 'graphify'
        }

    edges = []
    for l in graphify['links']:
        edges.append({
            'from': l['source'],
            'to': l['target'],
            'label': l.get('relation', 'relates_to'),
            'weight': l.get('weight', 1.0)
        })

    print(f"Graphify base: {len(nodes)} nodes, {len(edges)} edges")

    # 2. Extract domain items from deepgrid-knowledge.ts
    ts_code = Path('/home/sheke/deepgrid-dr-site/app/data/deepgrid-knowledge.ts').read_text(encoding='utf-8')
    catalog_blocks = re.findall(
        r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],.*?tagline:\s*['\"]([^'\"]+)['\"].*?summary:\s*['\"]([^'\"]+)['\"].*?citation:\s*['\"]([^'\"]+)['\"]",
        ts_code,
        re.DOTALL
    )
    print(f"Found {len(catalog_blocks)} catalog items in deepgrid-knowledge.ts")

    domain_communities = {
        'sku': (20, '10-SKU Sovereign Silicon Portfolio'),
        'ai': (21, '30 Industrial Edge AI Use Cases & Scalar DSP'),
        'strategy': (22, 'Sovereign Dual-Foundry & Mature-Node Economics'),
        'architecture': (23, 'Deterministic Motor Control & Lockstep Safety RTL'),
        'defense': (24, 'Statutory Defence Moats & DAP-2020 Make-II'),
        'finance': (25, 'Seed Capital, Financial Model & Charlie Munger Audits')
    }

    for item_id, name, tagline, summary, citation in catalog_blocks:
        cat = 'architecture'
        if 'sku' in item_id or 'd100' in item_id: cat = 'sku'
        elif 'ai' in item_id or 'usecases' in item_id or 'dsp' in item_id or 'tree' in item_id: cat = 'ai'
        elif 'dap' in item_id or 'boxes' in item_id or 'pil' in item_id: cat = 'defense'
        elif 'fund' in item_id or 'munger' in item_id or 'crash' in item_id or 'price' in item_id: cat = 'finance'
        elif 'three-factory' in item_id or 'import' in item_id or 'loop' in item_id: cat = 'strategy'
        
        cid, cname = domain_communities.get(cat, (23, 'Deterministic Motor Control & Lockstep Safety RTL'))
        nodes[item_id] = {
            'id': item_id,
            'name': name,
            'shortName': name[:30],
            'category': cat,
            'communityId': cid,
            'communityName': cname,
            'description': f"{tagline}. {summary}",
            'citation': citation,
            'origin': 'domain_knowledge'
        }

    edge_matches = re.findall(
        r"\{\s*from:\s*['\"]([^'\"]+)['\"],\s*to:\s*['\"]([^'\"]+)['\"],\s*label:\s*['\"]([^'\"]+)['\"]",
        ts_code
    )
    print(f"Found {len(edge_matches)} domain edges in deepgrid-knowledge.ts")
    for src, dst, lbl in edge_matches:
        edges.append({
            'from': src,
            'to': dst,
            'label': lbl,
            'weight': 1.5
        })

    print(f"Total Unified Graph: {len(nodes)} nodes, {len(edges)} edges")

    # 3. Load all 177 PDF Pages from the 8 whitepapers
    pdf_dir = Path('/home/sheke/deepgrid-dr-site/public/downloads/docs')
    pdfs = sorted(list(pdf_dir.glob('*.pdf')))
    pdf_meta = {
        'deepgrid-mature-node-silicon-master-whitepaper-v3.pdf': {'title': 'Master Whitepaper v3 (Mature-Node Silicon)', 'docNum': '05', 'size': '5.4 MB', 'spec': './downloads/docs/deepgrid-mature-silicon-architecture.md'},
        'deepgrid-sku-compendium-technical-annex-v3.pdf': {'title': 'Technical Annex v3 (10 SKUs, D100 & SDV)', 'docNum': '02', 'size': '4.8 MB', 'spec': './downloads/docs/deepgrid-sku-compendium-architecture.md'},
        'deepgrid-dg32-ai-30-use-cases.pdf': {'title': 'Thirty Use Cases, No Accelerator', 'docNum': '01', 'size': '414 KB', 'spec': './downloads/docs/deepgrid-dg32-ai-architecture.md'},
        'deepgrid-dshot-rx-block-spec.pdf': {'title': 'Hardware DShot RX Specification', 'docNum': '03', 'size': '345 KB', 'spec': './downloads/docs/deepgrid-dshot-rx-architecture.md'},
        'deepgrid-dg32-2dom-system-architecture.pdf': {'title': 'DG32-2DOM System Architecture', 'docNum': '04', 'size': '77 KB', 'spec': './downloads/docs/deepgrid-2dom-architecture.md'},
        'deepgrid-datasheets-qfn64.pdf': {'title': 'DG32 QFN-64 Engineering Datasheet', 'docNum': '06', 'size': '76 KB', 'spec': './downloads/docs/deepgrid-datasheets-engineering-spec.md'},
        'deepgrid-dg32-2dom-preliminary-datasheet.pdf': {'title': 'DG32-2DOM Preliminary Datasheet', 'docNum': '04', 'size': '40 KB', 'spec': './downloads/docs/deepgrid-2dom-architecture.md'},
        'deepgrid-dg32-lite-preliminary-datasheet.pdf': {'title': 'DG32-LITE Preliminary Datasheet', 'docNum': '06', 'size': '38 KB', 'spec': './downloads/docs/deepgrid-datasheets-engineering-spec.md'}
    }

    corpus_chunks = []
    for p in pdfs:
        meta = pdf_meta.get(p.name, {'title': p.stem, 'docNum': '05', 'size': '1.0 MB', 'spec': './downloads/docs/deepgrid-mature-silicon-architecture.md'})
        doc = fitz.open(p)
        for page_idx in range(len(doc)):
            text = doc[page_idx].get_text().strip()
            if len(text) < 60: continue
            lines = [l.strip() for l in text.splitlines() if len(l.strip()) > 3]
            section = f"Page {page_idx+1}"
            for l in lines[:5]:
                if re.match(r"^[0-9]+(\.[0-9]+)*\s+[A-Z]", l) or "Section" in l or "Specification" in l:
                    section = l
                    break
            corpus_chunks.append({
                'id': f"pdf_{p.stem}_p{page_idx+1}",
                'docTitle': meta['title'],
                'docNum': meta['docNum'],
                'pdfPath': f"./downloads/docs/{p.name}",
                'pdfSize': meta['size'],
                'specPath': meta['spec'],
                'pageLabel': f"p. {page_idx+1}",
                'section': section,
                'text': text[:1800]
            })

    print(f"Total PDF chunks: {len(corpus_chunks)}")

    # 4. Build Global Vocabulary across all Nodes + all PDF Chunks
    all_texts = []
    for nid, n in nodes.items():
        all_texts.append(f"{n['name']} {n['communityName']} {n['description']}")
    for c in corpus_chunks:
        all_texts.append(f"{c['docTitle']} {c['section']} {c['text']}")

    vocab = set()
    for t in all_texts:
        for w in re.findall(r"[a-z0-9_]+", t.lower()):
            if len(w) > 2:
                vocab.add(w)

    vocab = sorted(list(vocab))
    vocab_idx = {w: i for i, w in enumerate(vocab)}
    DIM = len(vocab)
    print(f"Unified vocabulary dimension: {DIM}")

    # Compute IDF
    idf = [0.0] * DIM
    for t in all_texts:
        seen_w = set(re.findall(r"[a-z0-9_]+", t.lower()))
        for w in seen_w:
            if w in vocab_idx:
                idf[vocab_idx[w]] += 1.0

    total_docs = len(all_texts)
    idf = [math.log((total_docs + 1.0) / (cnt + 1.0)) + 1.0 for cnt in idf]

    # Vectorize Nodes
    def vectorize_text(text):
        words = re.findall(r"[a-z0-9_]+", text.lower())
        vec = {}
        for w in words:
            if w in vocab_idx:
                idx = vocab_idx[w]
                vec[idx] = vec.get(idx, 0.0) + 1.0
        norm_sq = 0.0
        for idx, count in vec.items():
            w_val = count * idf[idx]
            vec[idx] = w_val
            norm_sq += w_val * w_val
        norm = math.sqrt(norm_sq)
        if norm > 0:
            return {str(idx): round(val / norm, 4) for idx, val in vec.items()}
        return {}

    node_list = []
    for nid, n in nodes.items():
        v = vectorize_text(f"{n['name']} {n['communityName']} {n['description']}")
        n_copy = dict(n)
        n_copy['vector'] = v
        node_list.append(n_copy)

    # Vectorize Corpus Chunks
    for c in corpus_chunks:
        c['vector'] = vectorize_text(f"{c['docTitle']} {c['section']} {c['text']}")

    unified_index = {
        'nodes': node_list,
        'edges': edges,
        'chunks': corpus_chunks,
        'vocab': vocab,
        'idf': [round(x, 4) for x in idf]
    }

    out_file = Path('/home/sheke/deepgrid-dr-site/app/data/graphrag-unified-index.json')
    out_file.write_text(json.dumps(unified_index), encoding='utf-8')
    print(f"Wrote unified GraphRAG index to {out_file} ({round(len(out_file.read_bytes())/1024, 1)} KB)")

if __name__ == '__main__':
    main()
