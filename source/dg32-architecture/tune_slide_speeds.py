#!/usr/bin/env python3
"""Per-slide TTS speeds that bring every slide to a target pace, from a measured narration report.

usage: tune_slide_speeds.py narration-report.json [--target 150] [--band 140 155] [--base 1.05]

Reads a report with one entry per slide carrying the `speed` it was voiced at and the measured
spoken-word `wpm` (narrate_kokoro.py writes this shape). Any slide outside the band gets
speed x target / wpm, capped at the base speed so a slow slide is never pushed faster than the voice
is meant to run. Prints a SLIDE_SPEEDS string (`slide:speed,...`) for the next voicing pass;
slides at the base speed are left out.

Pace is corrected with the voice's speed control, never by cutting the writing. Re-voice with the
printed speeds and re-measure: the second pass is the one that is gated. A slide still under the band
at the base speed is text that is short on words for its sentences, and the fix is the writing.
"""
import argparse, json, sys


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('report')
    ap.add_argument('--target', type=float, default=150)
    ap.add_argument('--band', type=float, nargs=2, default=(140, 155))
    ap.add_argument('--base', type=float, default=1.05)
    a = ap.parse_args()
    slides = json.load(open(a.report))['slides']
    if not slides:
        sys.exit('BLOCKED: report has no slides')
    out = []
    for s in slides:
        speed, wpm = s['speed'], s['wpm']
        if not a.band[0] <= wpm <= a.band[1]:
            speed = min(a.base, round(speed * a.target / wpm, 2))
        if speed != a.base:
            out.append(f"{s['slide']}:{speed}")
    print(','.join(out))
    return 0


if __name__ == '__main__':
    sys.exit(main())
