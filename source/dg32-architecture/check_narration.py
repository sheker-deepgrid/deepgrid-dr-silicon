#!/usr/bin/env python3
"""Gate narration against the deck it narrates.

The failure this exists to catch: narration that recites the slide. A voice
track assembled from slide text passes every audio and video check ever
written -- it is present, it is the right length, it is in the right voice --
and it is still worthless in front of an investor.

Two measures, both mechanical:
  echo   - trigram overlap between the narration and the slide's own text
  tells  - artefacts that only appear when text was lifted off a slide

Exit 0 clean, 1 blocked, 2 findings.
"""
import argparse
import json
import os
import re
import sys
import zipfile

# Things a person never says out loud, which a script that reads slides emits.
TELLS = [
    (r"\bslide\s*(id\s*)?\d+", "reads a slide number or slide id"),
    (r"\bconfidential\b", "reads the confidentiality footer"),
    (r"\b(CIN|DPIIT|GSTIN)\b", "reads a registration number"),
    (r"\+\d{2}[\s-]?\d{4,5}[\s-]?\d{5}", "reads a phone number"),
    (r"[\w.+-]+@[\w-]+\.[\w.]+", "reads an email address"),
    (r"\bturning to\b", "slide-deck stage direction"),
    (r"\.\.\.$", "text was truncated mid-sentence"),
    (r"\bpage \d+ of \d+\b", "reads a page counter"),
    (r"\bnew in v\s*\d+\b", "reads an internal version annotation"),
    (r"\bwhat we cannot claim\b|\bnot done\b|\bquoted, not bought\b",
     "reads an internal caveat or status marker"),
    (r"\b(TODO|placeholder|draft only)\b", "reads a draft marker"),
    (r"\b\d+\s*/\s*\d+\s*$", "ends on a page fraction"),
]

# An assertion-led investor read does these. Absence of all of them is a
# symptom, not proof, so it reports as a finding rather than blocking.
ASSERTIVE = re.compile(
    r"\b(we|our|this is|that is|the point|the argument|because|which means|"
    r"so that|before|already|not |never |the reason|what (this|that|we|it)|"
    r"consider|note that|against|rather than|instead of|more than|less than|"
    r"which is why|once |until |unless |whether|if |so |how |why |but |yet |"
    r"only |every |no one|nothing |neither|deliberat|on purpose)\b", re.I)


def trigrams(text):
    w = re.findall(r"[a-z0-9]+", text.lower())
    return {tuple(w[i:i + 3]) for i in range(len(w) - 2)}


def deck_text(path):
    """Per-slide text from a .pptx, or from a '### idNNN' blocked text file."""
    if path.endswith(".pptx"):
        out, z = {}, zipfile.ZipFile(path)
        names = sorted((n for n in z.namelist()
                        if re.match(r"ppt/slides/slide\d+\.xml$", n)),
                       key=lambda n: int(re.search(r"(\d+)", n.split("/")[-1]).group(1)))
        for i, n in enumerate(names, 1):
            xml = z.read(n).decode("utf-8", "replace")
            out[str(i)] = " ".join(re.findall(r"<a:t>(.*?)</a:t>", xml, re.S))
        return out
    out, cur = {}, None
    for line in open(path, encoding="utf-8", errors="replace"):
        m = re.match(r"^###\s*id([\w.\-]+)", line.strip())
        if m:
            cur = m.group(1)
            out[cur] = ""
        elif cur:
            out[cur] += " " + line.strip()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("narration", help="authored narration JSON")
    ap.add_argument("--deck", help=".pptx or extracted slide-text file")
    ap.add_argument("--echo-max", type=float, default=0.18,
                    help="max share of narration trigrams also on the slide")
    a = ap.parse_args()

    narr = json.load(open(a.narration))
    findings = []
    slides = {}
    if a.deck:
        slides = {k: v for k, v in deck_text(a.deck).items() if v.strip()}
        # A gate that goes green because its population came back empty is
        # worse than no gate: it now certifies the defect. Block instead.
        if not slides:
            sys.exit(f"BLOCKED: --deck {a.deck} yielded no slide text "
                     f"(flattened-image slides, or an unparsed format). "
                     f"Echo is UNMEASURED -- supply extracted slide text.")
        overlap = set(narr) & set(slides)
        if not overlap:
            sys.exit(f"BLOCKED: narration keys {sorted(narr)[:4]}... do not "
                     f"match deck keys {sorted(slides)[:4]}.... Echo is "
                     f"UNMEASURED.")

    print(f"== narration gate: {os.path.basename(a.narration)} "
          f"({len(narr)} slides) ==")
    worst = []
    for k in sorted(narr, key=lambda x: (len(x), x)):
        text = narr[k]
        for pat, why in TELLS:
            if re.search(pat, text, re.I):
                findings.append(f"slide {k}: {why}")
        if not ASSERTIVE.search(text):
            findings.append(f"slide {k}: no assertion or causal language; "
                            f"reads as a list")
        if slides.get(k):
            nt, st = trigrams(text), trigrams(slides[k])
            echo = len(nt & st) / max(len(nt), 1)
            worst.append((echo, k))
            if echo > a.echo_max:
                findings.append(
                    f"slide {k}: {echo:.0%} of the narration is lifted "
                    f"verbatim from the slide (limit {a.echo_max:.0%})")

    if worst:
        worst.sort(reverse=True)
        print("  highest slide-echo:")
        for echo, k in worst[:5]:
            print(f"    slide {k:>4}  {echo:5.1%}")
        print(f"  mean echo {sum(e for e, _ in worst)/len(worst):.1%}")
    else:
        print("  no deck supplied -- echo NOT MEASURED, tells only")
        findings.append("echo UNMEASURED: no slide text supplied to compare "
                        "the narration against")

    print()
    if findings:
        print(f"{len(findings)} finding(s):")
        for f in findings[:40]:
            print(f"  - {f}")
        if len(findings) > 40:
            print(f"  ... and {len(findings)-40} more")
        sys.exit(2)
    print("CLEAN -- narration is synthesis, not recitation.")


if __name__ == "__main__":
    main()
