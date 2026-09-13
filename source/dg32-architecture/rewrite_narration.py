#!/usr/bin/env python3
"""Rewrite narration lines at their source, gated before anything is written.

usage: rewrite_narration.py rewrites.json --check          # gate the merged narration in memory
       rewrite_narration.py rewrites.json --write          # gate, then replace the lines

rewrites.json maps a package directory to replacement lines, keyed by slide number:

    {"runs/<date>-<deck>/<package>": {"3": "New narration for slide 3.", "7": "..."}}

Each package directory holds `story-architect-pack.md`, whose `## 9. Narration` section has one
`N. text` line per slide (the format story-architect writes and the deck builder turns into speaker
notes), and exactly one `*-reviewed.pptx` whose slide text the narration is gated against.

The gate is check_narration.py's, applied to the whole merged narration, not only the rewritten
lines: at most --echo-max of a slide's narration trigrams may also be on the slide, every line needs
assertion or causal language, and no reader-only tells. Writing is refused while any slide is
flagged, every replacement must match exactly one line, and the pack is re-read after writing and
compared with what was gated.

Why this exists: four of five films once passed every pace, voice and duration gate while repeating
up to 39% of their slides' wording. Rewriting the voiced text after the fact leaves the deck's speaker
notes saying something else; rewriting the pack keeps notes and film one text.
"""
import argparse, json, pathlib, re, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from check_narration import ASSERTIVE, TELLS, deck_text, trigrams  # noqa: E402

LINE = re.compile(r'^(\d+)\. (.+)$', re.M)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('rewrites')
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument('--check', action='store_true')
    mode.add_argument('--write', action='store_true')
    ap.add_argument('--root', default='.', help='directory the package paths are relative to')
    ap.add_argument('--echo-max', type=float, default=0.18)
    a = ap.parse_args()

    rewrites = json.load(open(a.rewrites, encoding='utf-8'))
    flagged, plans = 0, []
    for rel, repl in rewrites.items():
        pkg = (pathlib.Path(a.root) / rel).resolve()
        decks = sorted(pkg.glob('*-reviewed.pptx'))
        if len(decks) != 1:
            sys.exit(f'BLOCKED: {pkg} needs exactly one *-reviewed.pptx, found {len(decks)}')
        slides = deck_text(str(decks[0]))
        if not any(v.strip() for v in slides.values()):
            sys.exit(f'BLOCKED: {decks[0].name} yielded no slide text; echo would be unmeasured')
        pack_path = pkg / 'story-architect-pack.md'
        head, sep, sec = pack_path.read_text(encoding='utf-8').partition('## 9. Narration')
        if not sep:
            sys.exit(f'BLOCKED: {pack_path} has no "## 9. Narration" section')
        narr = {m.group(1): m.group(2).strip() for m in LINE.finditer(sec)}
        unknown = set(repl) - set(narr)
        if unknown:
            sys.exit(f'BLOCKED: {rel}: slides {sorted(unknown)} are not in the pack')
        merged = {**narr, **repl}
        echoes = []
        for k in sorted(merged, key=int):
            text = merged[k]
            nt = trigrams(text)
            echo = len(nt & trigrams(slides.get(k, ''))) / max(len(nt), 1)
            echoes.append(echo)
            problems = [f'echo {echo:.0%}'] if echo > a.echo_max else []
            if not ASSERTIVE.search(text):
                problems.append('reads as a list')
            problems += [why for pat, why in TELLS if re.search(pat, text, re.I)]
            if problems:
                flagged += 1
                print(f'  {rel} slide {k}: {", ".join(problems)}')
        print(f'{rel}: {len(repl)} rewritten, mean echo {sum(echoes) / len(echoes):.1%}, max {max(echoes):.1%}')
        plans.append((rel, pack_path, head, sep, sec, repl, merged))

    if flagged:
        print(f'GATE: {flagged} slide(s) flagged; nothing written')
        return 1
    if a.check:
        print('GATE CLEAN (check only)')
        return 0
    for rel, pack_path, head, sep, sec, repl, merged in plans:
        for k, text in repl.items():
            pat = re.compile(rf'^{k}\. .+$', re.M)
            hits = pat.findall(sec)
            if len(hits) != 1:
                sys.exit(f'BLOCKED: {rel} slide {k} matched {len(hits)} lines')
            sec = pat.sub(lambda _m, k=k, text=text: f'{k}. {text}', sec)
        pack_path.write_text(head + sep + sec, encoding='utf-8')
        again = {m.group(1): m.group(2).strip() for m in LINE.finditer(pack_path.read_text(encoding='utf-8').partition('## 9. Narration')[2])}
        if again != merged:
            sys.exit(f'BLOCKED: {pack_path} after writing does not match the gated narration')
    print('GATE CLEAN; packs written')
    return 0


if __name__ == '__main__':
    sys.exit(main())
