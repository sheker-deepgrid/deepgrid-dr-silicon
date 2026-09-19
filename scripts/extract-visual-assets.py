#!/usr/bin/env python3
"""
extract-visual-assets.py — Catalogs and enriches all visual assets (SVGs, die layouts,
waveforms, technical deck slides, and simulation videos) into a unified visual manifest
for Multimodal GraphRAG indexing.
"""
import os
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def load_vtt_text(vtt_path):
    if not os.path.exists(vtt_path):
        return ""
    lines = []
    with open(vtt_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("WEBVTT") or "-->" in line or line.isdigit():
                continue
            lines.append(line)
    return " ".join(lines)

def get_deck_slide_metadata():
    """
    Parses story-architect-pack.md files to map slide index to title and visual purpose.
    """
    deck_meta = {}
    
    # Map deck directory to story-architect-pack.md
    packs = {
        "dg32-lite": ROOT / "source/dg32-architecture/story-architect-pack.md",
        "dg32-2dom": ROOT / "source/dg32-architecture/dg32-2dom/story-architect-pack.md",
        "dg32-lite-datasheet": ROOT / "source/dg32-datasheets/lite-datasheet/story-architect-pack.md",
        "dg32-2dom-datasheet": ROOT / "source/dg32-datasheets/2dom-datasheet/story-architect-pack.md",
        "dg32-lite-tapein": ROOT / "source/dg32-datasheets/tapein-diagram/story-architect-pack.md",
    }
    
    for deck_name, pack_file in packs.items():
        deck_meta[deck_name] = {}
        if not pack_file.exists():
            continue
        text = pack_file.read_text(encoding="utf-8")
        spine_match = re.search(r"## 5\. Slide spine\s*\n(.*?)(?=\n## |\Z)", text, re.DOTALL)
        if not spine_match:
            continue
        rows = spine_match.group(1).strip().splitlines()
        for row in rows:
            if not row.startswith("|") or "---" in row or "Title" in row:
                continue
            parts = [p.strip() for p in row.split("|")[1:-1]]
            if len(parts) >= 2 and parts[0].isdigit():
                slide_num = int(parts[0])
                title = parts[1]
                evidence = parts[3] if len(parts) > 3 else ""
                visual = parts[4] if len(parts) > 4 else ""
                deck_meta[deck_name][slide_num] = {
                    "title": title,
                    "evidence": evidence,
                    "visual": visual
                }
    return deck_meta

def main():
    visual_nodes = []
    deck_meta = get_deck_slide_metadata()

    # 1. Silicon Die Photos and Hardware Subsystems (public/media/deepgrid_*.jpg)
    hardware_photos = {
        "deepgrid_soc2_die.jpg": {
            "title": "DG32 SoC2 Hardened Silicon Die Layout",
            "category": "silicon_die",
            "docNum": "06",
            "docTitle": "DG32 QFN-64 Engineering Datasheet",
            "sku": "DG32-LITE / DG32-2DOM",
            "caption": "Microphotograph of the hardened 130 nm CMOS silicon die layout on SkyWater sky130A, showing dual lockstep rv32imc cores, SRAM macro blocks, and perimeter I/O pad ring.",
            "keywords": ["die layout", "silicon", "skywater 130nm", "sky130a", "hardened die", "microphotograph", "pad ring", "rv32imc"]
        },
        "deepgrid_defence.jpg": {
            "title": "Sovereign Defence Radar & Seeker Subsystem",
            "category": "hardware_application",
            "docNum": "05",
            "docTitle": "Master Whitepaper v3 (Mature-Node Silicon)",
            "sku": "SKU-3 / SKU-5",
            "caption": "Defence tactical seeker and radar transceiver subsystem utilizing DeepGrid mature-node radiation-tolerant silicon.",
            "keywords": ["defence", "radar", "seeker", "dap-2020", "make-ii", "mil-std-883k", "missile guidance", "srijan"]
        },
        "deepgrid_truck.jpg": {
            "title": "Smart Truck Commercial EV Drive & AD2 Compute",
            "category": "hardware_application",
            "docNum": "02",
            "docTitle": "Technical Annex v3 (10 SKUs, D100 & SDV)",
            "sku": "DG SDV / SKU-1",
            "caption": "Commercial heavy-duty electric vehicle powertrain with DG32 lockstep dual-inverter motor control and zonal compute.",
            "keywords": ["truck", "commercial ev", "powertrain", "bldc", "inverter", "iso 26262", "automotive grade"]
        },
        "deepgrid_robotics.jpg": {
            "title": "Autonomous Industrial Robotic Joint Actuator",
            "category": "hardware_application",
            "docNum": "01",
            "docTitle": "Thirty Use Cases, No Accelerator",
            "sku": "SKU-1 / DG32-LITE",
            "caption": "High-torque collaborative robot joint actuator driven by DG32-LITE field-oriented control (FOC) with on-die CORDIC angle computation.",
            "keywords": ["robotics", "actuator", "bldc motor", "foc", "cordic", "joint control", "industrial automation"]
        },
        "deepgrid_logistics.jpg": {
            "title": "Automated Warehouse AGV Traction Subsystem",
            "category": "hardware_application",
            "docNum": "01",
            "docTitle": "Thirty Use Cases, No Accelerator",
            "sku": "SKU-1 / DG32-LITE",
            "caption": "Autonomous guided vehicle (AGV) traction and steering motor subsystem utilizing DG32-LITE predictive bearing fault diagnostics.",
            "keywords": ["agv", "logistics", "traction", "motor controller", "warehouse automation", "predictive maintenance"]
        }
    }

    for fname, meta in hardware_photos.items():
        p = ROOT / "public/media" / fname
        if p.exists():
            visual_nodes.append({
                "id": f"visual_{fname.split('.')[0]}",
                "name": meta["title"],
                "category": "visual",
                "visualType": meta["category"],
                "filePath": f"public/media/{fname}",
                "docNum": meta["docNum"],
                "docTitle": meta["docTitle"],
                "sku": meta["sku"],
                "caption": meta["caption"],
                "keywords": meta["keywords"],
                "origin": "hardware_media"
            })

    # 2. Architecture Diagrams (public/diagrams/*.svg)
    arch_diagrams = {
        "dg32-lite-architecture.svg": {
            "title": "DG32-LITE Single-Domain Architecture Diagram",
            "docNum": "06",
            "docTitle": "DG32-LITE Preliminary Datasheet",
            "sku": "DG32-LITE",
            "caption": "Complete block diagram of DG32-LITE showing dual rv32imc cores in lockstep, cycle-by-cycle fault comparator, 32 KB SRAM, 64 KB ROM, 3-phase PWM, DShot ESC engine, and on-die SAR ADC.",
            "keywords": ["architecture diagram", "block diagram", "dg32-lite", "lockstep", "rv32imc", "pwm", "dshot", "cordic", "adc"]
        },
        "dg32-2dom-architecture.svg": {
            "title": "DG32-2DOM Dual-Domain Architecture Diagram",
            "docNum": "04",
            "docTitle": "DG32-2DOM System Architecture",
            "sku": "DG32-2DOM",
            "caption": "Dual-clock domain architecture diagram of DG32-2DOM showing 50 MHz deterministic motor control domain CDC-bridged to 114 MHz INT8 attention engine domain.",
            "keywords": ["architecture diagram", "dg32-2dom", "dual-domain", "cdc bridge", "attention engine", "int8", "bearing fault"]
        }
    }

    for fname, meta in arch_diagrams.items():
        p = ROOT / "public/diagrams" / fname
        if p.exists():
            visual_nodes.append({
                "id": f"visual_{fname.split('.')[0]}",
                "name": meta["title"],
                "category": "visual",
                "visualType": "architecture_diagram",
                "filePath": f"public/diagrams/{fname}",
                "docNum": meta["docNum"],
                "docTitle": meta["docTitle"],
                "sku": meta["sku"],
                "caption": meta["caption"],
                "keywords": meta["keywords"],
                "origin": "vector_diagram"
            })

    # 3. Whitepaper Simulation Figures & Waveforms (lines_image*.png, sims_image*.png)
    figure_captions = {
        "sims_image.png": {
            "title": "DG32 3-Phase Inverter Fault Injection Simulation",
            "caption": "Simulated phase-current waveform during high-side gate fault injection, showing 39-cycle hardware fault latch and emergency brake engagement.",
            "keywords": ["fault injection", "simulation", "current waveform", "39 cycles", "brake", "phase current"]
        },
        "sims_image2.png": {
            "title": "CWRU Bearing Fault Vibration Harmonic Spectrum",
            "caption": "Discrete Fourier Transform and Goertzel algorithm harmonic peak extraction for outer race bearing defect detection on CWRU benchmark dataset.",
            "keywords": ["bearing fault", "cwru", "vibration", "fft", "goertzel", "harmonics", "predictive diagnostics"]
        },
        "sims_image3.png": {
            "title": "Field-Oriented Control (FOC) DQ-Current Convergence",
            "caption": "CORDIC vector transformation showing Direct (Id) and Quadrature (Iq) current loop settling in ~300 clock cycles at 20 kHz PWM rate.",
            "keywords": ["foc", "cordic", "dq current", "convergence", "current loop", "20 khz pwm"]
        },
        "sims_image4.png": {
            "title": "DG32-2DOM Asynchronous Clock Domain Crossing (CDC) Timing",
            "caption": "Timing waveform of asynchronous 4-phase request/acknowledge handshake bridge between 50 MHz control domain and 114 MHz INT8 engine.",
            "keywords": ["cdc", "clock domain crossing", "timing waveform", "handshake", "synchronizer", "114 mhz"]
        },
        "lines_image.png": {
            "title": "DeepGrid Three-Factory Geopolitical Semiconductor Map",
            "caption": "Geopolitical supply chain map illustrating DeepGrid 3-factory mature-node fabrication strategy across SkyWater, SCL Chandigarh, and domestic OSAT packaging.",
            "keywords": ["three-factory", "sovereignty", "scl chandigarh", "skywater", "osat", "supply chain"]
        },
        "lines_image2.png": {
            "title": "198-Day Fast Tape-in Iteration Loop Methodology",
            "caption": "Iterative tape-in lifecycle showing 198-day loop from open-source RTL specification to hardened silicon test on multi-project wafer (MPW).",
            "keywords": ["198-day loop", "tape-in", "mpw", "open-source eda", "shuttle", "silicon iteration"]
        },
        "lines_image3.png": {
            "title": "10-SKU Sovereign Mature-Node Silicon Portfolio Matrix",
            "caption": "System-on-Chip matrix categorizing 10 mature-node SKUs across industrial motion, avionics power, smart metering, and drone zonal computing.",
            "keywords": ["sku compendium", "10 skus", "product matrix", "d100", "smart meter", "bldc"]
        },
        "lines_image5.png": {
            "title": "DG32-LITE QFN-64 Pin Group Distribution & Pad Ring",
            "caption": "Package layout showing 44 active signal pins grouped into 11 functional clusters with thermal paddle ground isolation.",
            "keywords": ["qfn-64", "pinout", "pad ring", "thermal paddle", "signal pins", "packaging"]
        },
        "lines_image7.png": {
            "title": "Bidirectional DShot Telemetry Reply Waveform",
            "caption": "Oscilloscope timing capture of GCR 4b-to-5b encoded bidirectional DShot telemetry frame received on pin-muxed PWM output pad.",
            "keywords": ["dshot", "bidirectional", "telemetry", "gcr 4b5b", "pwm pad", "esc"]
        }
    }

    for fname, meta in figure_captions.items():
        p = ROOT / "public/media" / fname
        if p.exists():
            visual_nodes.append({
                "id": f"visual_{fname.split('.')[0]}",
                "name": meta["title"],
                "category": "visual",
                "visualType": "simulation_waveform" if "sims" in fname else "whitepaper_figure",
                "filePath": f"public/media/{fname}",
                "docNum": "01" if "sims" in fname else "05",
                "docTitle": "Thirty Use Cases, No Accelerator" if "sims" in fname else "Master Whitepaper v3",
                "sku": "DG32-LITE / DG32-2DOM",
                "caption": meta["caption"],
                "keywords": meta["keywords"],
                "origin": "whitepaper_figure"
            })

    # 4. Presentation Slide Decks (public/decks/*/*.webp)
    deck_folders = sorted(list((ROOT / "public/decks").glob("*")))
    for deck_dir in deck_folders:
        if not deck_dir.is_dir():
            continue
        deck_slug = deck_dir.name
        slides = sorted(list(deck_dir.glob("slide-*.webp")))
        meta_dict = deck_meta.get(deck_slug, {})

        for slide_p in slides:
            # extract slide number from slide-XX.webp
            m = re.search(r"slide-(\d+)\.webp", slide_p.name)
            if not m:
                continue
            slide_idx = int(m.group(1))
            info = meta_dict.get(slide_idx, {})
            title = info.get("title", f"{deck_slug} Slide {slide_idx}")
            visual_desc = info.get("visual", "")
            evidence = info.get("evidence", "")

            caption = f"Presentation slide #{slide_idx} from {deck_slug}: {title}. Visual contents: {visual_desc}. Cited evidence: {evidence}."
            keywords = [deck_slug, f"slide {slide_idx}", title.lower()]
            for word in re.findall(r"[a-z0-9_-]{4,}", (title + " " + visual_desc).lower()):
                if word not in keywords:
                    keywords.append(word)

            visual_nodes.append({
                "id": f"slide_{deck_slug}_{slide_idx:02d}",
                "name": f"{deck_slug.upper()} Slide {slide_idx}: {title}",
                "category": "visual",
                "visualType": "deck_slide",
                "filePath": f"public/decks/{deck_slug}/{slide_p.name}",
                "deckName": deck_slug,
                "slideIndex": slide_idx,
                "docNum": "06" if "datasheet" in deck_slug or "tapein" in deck_slug else "04",
                "docTitle": f"{deck_slug} Slide Deck",
                "sku": "DG32-2DOM" if "2dom" in deck_slug else "DG32-LITE",
                "caption": caption,
                "keywords": keywords[:15],
                "origin": "presentation_slide"
            })

    # 5. Simulation Videos & Subtitle Narration (public/media/*.mp4)
    vids = {
        "dg32-lite-architecture.mp4": {
            "title": "DG32-LITE Architecture Narrated Explainer Film",
            "sku": "DG32-LITE",
            "poster": "public/media/dg32-lite-architecture-poster.jpg",
            "vtt": ROOT / "public/media/dg32-lite-architecture.vtt"
        },
        "dg32-2dom-architecture.mp4": {
            "title": "DG32-2DOM Dual-Domain Architecture Narrated Explainer Film",
            "sku": "DG32-2DOM",
            "poster": "public/media/dg32-2dom-architecture-poster.jpg",
            "vtt": ROOT / "public/media/dg32-2dom-architecture.vtt"
        },
        "dg32-lite-datasheet.mp4": {
            "title": "DG32-LITE Datasheet Engineering Walkthrough Film",
            "sku": "DG32-LITE",
            "poster": "public/media/dg32-lite-datasheet-poster.jpg",
            "vtt": ROOT / "public/media/dg32-lite-datasheet.vtt"
        },
        "dg32-2dom-datasheet.mp4": {
            "title": "DG32-2DOM Datasheet Engineering Walkthrough Film",
            "sku": "DG32-2DOM",
            "poster": "public/media/dg32-2dom-datasheet-poster.jpg",
            "vtt": ROOT / "public/media/dg32-2dom-datasheet.vtt"
        },
        "dg32-lite-tapein.mp4": {
            "title": "DG32-LITE Tape-in Signoff Gates Walkthrough Film",
            "sku": "DG32-LITE",
            "poster": "public/media/dg32-lite-tapein-poster.jpg",
            "vtt": ROOT / "public/media/dg32-lite-tapein.vtt"
        }
    }

    for vid_file, meta in vids.items():
        p = ROOT / "public/media" / vid_file
        if p.exists():
            vtt_narration = load_vtt_text(meta["vtt"])
            visual_nodes.append({
                "id": f"video_{vid_file.split('.')[0]}",
                "name": meta["title"],
                "category": "visual",
                "visualType": "simulation_video",
                "filePath": f"public/media/{vid_file}",
                "posterPath": meta["poster"],
                "sku": meta["sku"],
                "caption": f"Video explainer and interactive architecture simulation: {meta['title']}. Narration transcript: {vtt_narration[:600]}...",
                "keywords": [vid_file.split(".")[0], "video", "simulation", "film", meta["sku"].lower()],
                "origin": "simulation_film"
            })

    # Save visual manifest
    out_file = ROOT / "app/data/graphrag-visual-assets.json"
    out_file.write_text(json.dumps({"visualAssets": visual_nodes}, indent=2), encoding="utf-8")
    print(f"✓ Extracted {len(visual_nodes)} visual assets to {out_file.relative_to(ROOT)}")
    print(f"  - Silicon Die & Subsystem Photos: {sum(1 for v in visual_nodes if v['visualType'] in ('silicon_die', 'hardware_application'))}")
    print(f"  - Architecture SVGs: {sum(1 for v in visual_nodes if v['visualType'] == 'architecture_diagram')}")
    print(f"  - Whitepaper Figures & Waveforms: {sum(1 for v in visual_nodes if v['visualType'] in ('simulation_waveform', 'whitepaper_figure'))}")
    print(f"  - Presentation Slides: {sum(1 for v in visual_nodes if v['visualType'] == 'deck_slide')}")
    print(f"  - Simulation Videos: {sum(1 for v in visual_nodes if v['visualType'] == 'simulation_video')}")

if __name__ == "__main__":
    main()
