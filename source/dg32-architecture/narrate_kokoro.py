#!/usr/bin/env python3
"""Narrate a deck with the local Kokoro-82M model in the house Holt voice profile.

usage: ~/.venvs/kokoro/bin/python narrate_kokoro.py <package dir>
  reads  <pkg>/story-architect-pack.md, section "## 9. Narration" (one numbered line per slide)
  writes <pkg>/video/audio/slide-NN.wav and <pkg>/video/audio/narration-report.json
         (per-slide pace, pitch and sentence timings; make_film.py cues captions from them)

Holt profile (Holt_Voice_Direction.md, 2026-09-10, and the Holt reference recording):
140-155 wpm adjusted to the density of each thought, phrase pauses 0.25-0.45 s, sentence pauses
0.55-0.85 s, major transitions 1.0-1.3 s, median fundamental 135.6 Hz (measured on /tmp/holt.wav
with median_f0 below). Voice bm_george is the house match. Speed 1.05 with 0.55 s sentence pauses
was chosen on 2026-09-13 by measuring slides 1 and 9 against the band: 0.90 read 123-132 wpm on
this acronym-dense narration, 1.05 read 135-147 wpm at 138-144 Hz. Pace is counted on the words
actually spoken (DG32-LITE is four), not on the written text. Slide transitions come from
make_film.py (lead + tail), not from this script.
"""
import hashlib, json, pathlib, re, sys
import numpy as np, soundfile as sf

MODEL = "/home/sheke/.cache/hyperframes/tts/models/kokoro-v1.0.onnx"
VOICES = "/home/sheke/.cache/hyperframes/tts/voices/voices-v1.0.bin"
VOICE, SPEED, RATE = "bm_george", 1.05, 24000
# Per-slide pace for dense slides (Holt: "adjusting to the density of each thought"), e.g. SLIDE_SPEEDS="5:0.95,12:0.95".
import os
SLIDE_SPEEDS = {int(k): float(v) for k, v in (x.split(":") for x in os.environ.get("SLIDE_SPEEDS", "").split(",") if x)}
SENTENCE_PAUSE = 0.55
WPM_BAND = (140, 155)          # Holt target
WPM_GATE = (135, 160)          # hard gate: dense slides may sit just under the band
HOLT_F0 = 135.6

# Said aloud, never shown. Applied only to the text handed to the engine.
LEXICON = [
    ("DG32-LITE", "D G thirty-two Lite"), ("DG32-2DOM", "D G thirty-two two-dom"), ("DG32", "D G thirty-two"),
    ("RISC-V", "risk five"), ("RV32IM", "R V thirty-two I M"), ("STM32G0", "S T M thirty-two G zero"),
    ("S32K", "S thirty-two K"), ("AURIX", "Aurix"), ("FAULT_N", "fault N"), ("INT8", "int eight"),
    ("INT4", "int four"), ("QFN", "Q F N"), ("DShot", "D shot"), ("CORDIC", "cordic"), ("SRAM", "S RAM"),
    ("QSPI", "Q S P I"), ("UART", "you-art"), ("JTAG", "jay tag"), ("PWM", "P W M"), ("ADC", "A D C"),
    ("DMA", "D M A"), ("ECC", "E C C"), ("MCUs", "M C Us"), ("MCU", "M C U"), ("FIFO", "fife-oh"),
    ("CAN-FD", "can F D"), ("USB", "U S B"), ("PI ", "P I "), ("AI", "A I"), ("DSP", "D S P"),
    ("—", ", "), ("’", "'"), ("“", ""), ("”", ""),
]

_model = None


def spoken(text):
    for a, b in LEXICON:
        text = text.replace(a, b)
    return " ".join(text.split())


def spoken_words(text):
    return len(spoken(text).replace("-", " ").split())


def synth(text, cache, speed=None):
    global _model
    speed = speed or SPEED
    said = spoken(text)
    key = hashlib.sha256(f"{VOICE}|{speed}|{said}".encode()).hexdigest()[:16]
    hit = cache / f"{key}.npy"
    if hit.exists():
        return np.load(hit)
    if _model is None:
        import kokoro_onnx
        _model = kokoro_onnx.Kokoro(MODEL, VOICES)
    samples, sr = _model.create(said, voice=VOICE, speed=speed)
    if sr != RATE:
        raise RuntimeError(f"expected {RATE} Hz, got {sr}")
    samples = np.asarray(samples, dtype=np.float32)
    np.save(hit, samples)
    return samples


def trim(s, thresh=0.01):
    idx = np.where(np.abs(s) > thresh)[0]
    return s[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else s


def median_f0(s, sr=RATE):
    """Autocorrelation pitch over voiced 40 ms frames, 70-300 Hz search."""
    frame, hop, f0s = int(0.04 * sr), int(0.02 * sr), []
    lo, hi = int(sr / 300), int(sr / 70)
    for i in range(0, len(s) - frame, hop):
        x = s[i:i + frame] - s[i:i + frame].mean()
        if np.sqrt((x ** 2).mean()) < 0.02:
            continue
        ac = np.correlate(x, x, "full")[frame - 1:]
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.3 * ac[0]:
            f0s.append(sr / lag)
    return float(np.median(f0s)) if f0s else 0.0


def main():
    pkg = pathlib.Path(sys.argv[1]).resolve()
    pack = (pkg / "story-architect-pack.md").read_text(encoding="utf-8").split("## 9. Narration")[1]
    lines = {int(m.group(1)): m.group(2).strip() for m in re.finditer(r"^(\d+)\. (.+)$", pack, re.M)}
    out = pkg / "video" / "audio"; out.mkdir(parents=True, exist_ok=True)
    cache = out / ".cache"; cache.mkdir(exist_ok=True)
    report, failed = [], []
    for n in sorted(lines):
        sentences = [s for s in re.split(r"(?<=[.?!])\s+", lines[n]) if s]
        parts, timings, t = [], [], 0.0
        for i, sentence in enumerate(sentences):
            s = trim(synth(sentence, cache, SLIDE_SPEEDS.get(n)))
            timings.append({"text": sentence, "start": round(t, 3), "end": round(t + len(s) / RATE, 3)})
            parts.append(s); t += len(s) / RATE
            if i < len(sentences) - 1:
                parts.append(np.zeros(int(RATE * SENTENCE_PAUSE), dtype=np.float32)); t += SENTENCE_PAUSE
        audio = np.concatenate(parts)
        sf.write(out / f"slide-{n:02d}.wav", audio, RATE)
        dur = len(audio) / RATE
        words = spoken_words(lines[n])
        wpm = words / dur * 60
        f0 = median_f0(audio)
        ok = WPM_GATE[0] <= wpm <= WPM_GATE[1]
        report.append({"slide": n, "speed": SLIDE_SPEEDS.get(n, SPEED), "seconds": round(dur, 2), "spoken_words": words, "wpm": round(wpm, 1),
                       "median_f0_hz": round(f0, 1), "in_gate": ok, "sentences": timings})
        print(f"slide {n:02d}  {dur:5.1f}s  {words:3d} spoken words  {wpm:5.1f} wpm  F0 {f0:5.1f} Hz  {'ok' if ok else 'OUT OF GATE'}", flush=True)
        if not ok:
            failed.append(n)
    total_words = sum(r["spoken_words"] for r in report); total_s = sum(r["seconds"] for r in report)
    summary = {"voice": VOICE, "speed": SPEED, "slide_speeds": SLIDE_SPEEDS, "sentence_pause_s": SENTENCE_PAUSE, "wpm_band": WPM_BAND, "wpm_gate": WPM_GATE,
               "overall_wpm": round(total_words / total_s * 60, 1),
               "median_f0_hz": round(float(np.median([r["median_f0_hz"] for r in report])), 1), "holt_f0_hz": HOLT_F0,
               "total_seconds": round(total_s, 1), "failed_slides": failed, "slides": report}
    (out / "narration-report.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(f"overall {summary['overall_wpm']} wpm · median F0 {summary['median_f0_hz']} Hz (Holt {HOLT_F0}) · {total_s/60:.1f} min · failed {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
