"""Assemble a narrated film from deck frames + Holt-profile narration clips.

usage: python3 make_film.py <package dir> <slug> "<chapter spec>"
  package dir: frames/slide-NN.png (1920x1080 PowerPoint export), video/audio/slide-NN.wav and
               video/audio/narration-report.json (from narrate_kokoro.py)
  chapter spec: "Title:1-3;Title:4-8;..."  (slide ranges, 1-based, inclusive)

Writes video/<slug>.mp4 (H.264 + AAC + soft English captions), video/<slug>.vtt,
video/<slug>-film.json (duration, chapters, segments) and video/<slug>-poster.jpg.

Each slide holds for lead + narration + tail; lead + tail = 1.2 s, inside the Holt direction's
1.0-1.3 s major-transition band. Captions are cued from the per-sentence timings the narration
script measured, not estimated. Segments are joined by re-encoding, and the result is gated on
its decoded duration matching the sum of the segments.
"""
import json, subprocess, sys, pathlib

LEAD, TAIL, FADE = 0.35, 0.85, 0.25
pkg, slug, spec = pathlib.Path(sys.argv[1]).resolve(), sys.argv[2], sys.argv[3]
out = pkg / 'video'; seg_dir = out / 'segments'; seg_dir.mkdir(parents=True, exist_ok=True)
report = json.loads((out / 'audio' / 'narration-report.json').read_text())


def run(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'failed: {" ".join(map(str, cmd))}\n{r.stderr[-1500:]}')
    return r.stdout


def ts(t):
    h, rem = divmod(t, 3600); m, s = divmod(rem, 60)
    return f'{int(h):02d}:{int(m):02d}:{s:06.3f}'


def probe_duration(p):
    return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).strip())


segments, cues, t0 = [], [], 0.0
for r in report['slides']:
    n = r['slide']
    frame, audio = pkg / 'frames' / f'slide-{n:02d}.png', out / 'audio' / f'slide-{n:02d}.wav'
    if not frame.exists() or not audio.exists():
        sys.exit(f'missing input for slide {n}: frame={frame.exists()} audio={audio.exists()}')
    dur = round(LEAD + r['seconds'] + TAIL, 3)
    seg = seg_dir / f'{slug}-{n:02d}.mp4'
    run(['ffmpeg', '-y', '-loop', '1', '-framerate', '30', '-i', frame, '-i', audio,
         '-filter_complex', f'[0:v]scale=1920:1080,format=yuv420p,fade=t=in:st=0:d={FADE},fade=t=out:st={dur - FADE:.3f}:d={FADE}[v];'
                            f'[1:a]adelay={int(LEAD * 1000)}:all=1,apad,atrim=0:{dur:.3f},aformat=sample_rates=48000:channel_layouts=stereo[a]',
         '-map', '[v]', '-map', '[a]', '-t', f'{dur:.3f}', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24',
         '-tune', 'stillimage', '-c:a', 'aac', '-b:a', '128k', seg])
    for s in r['sentences']:
        cues.append((t0 + LEAD + s['start'], t0 + LEAD + s['end'], s['text']))
    segments.append({'slide': n, 'start': round(t0, 3), 'duration': dur})
    t0 += dur

vtt = out / f'{slug}.vtt'
vtt.write_text('WEBVTT\n\n' + ''.join(f'{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n' for i, (a, b, t) in enumerate(cues, 1)), encoding='utf-8')

film = out / f'{slug}.mp4'
inputs = []
for s in segments:
    inputs += ['-i', seg_dir / f'{slug}-{s["slide"]:02d}.mp4']
concat = ''.join(f'[{i}:v][{i}:a]' for i in range(len(segments))) + f'concat=n={len(segments)}:v=1:a=1[v][a]'
run(['ffmpeg', '-y', *inputs, '-i', vtt, '-filter_complex', concat, '-map', '[v]', '-map', '[a]', '-map', f'{len(segments)}:0',
     '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-tune', 'stillimage', '-r', '30', '-c:a', 'aac', '-b:a', '128k',
     '-c:s', 'mov_text', '-metadata:s:s:0', 'language=eng', '-movflags', '+faststart', film])
actual = probe_duration(film)
if abs(actual - t0) > 0.5:
    sys.exit(f'duration gate failed: film {actual:.2f}s vs segments {t0:.2f}s')

chapters = []
for part in spec.split(';'):
    title, rng = part.rsplit(':', 1); a, b = map(int, rng.split('-'))
    first = next(s for s in segments if s['slide'] == a); last = next(s for s in segments if s['slide'] == b)
    chapters.append({'title': title, 'slides': [a, b], 'start': first['start'], 'end': round(last['start'] + last['duration'], 3)})
(out / f'{slug}-film.json').write_text(json.dumps({'duration': round(t0, 3), 'chapters': chapters, 'segments': segments}, indent=2) + '\n')
run(['ffmpeg', '-y', '-i', pkg / 'frames' / 'slide-01.png', '-vf', 'scale=1280:720', '-q:v', '3', out / f'{slug}-poster.jpg'])
print(f'{film.name} · {actual:.1f}s decoded vs {t0:.1f}s planned · {len(segments)} slides · {len(cues)} captions · '
      f'{film.stat().st_size / 1e6:.1f} MB · chapters {[c["title"] for c in chapters]}')
