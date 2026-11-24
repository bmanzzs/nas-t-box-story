"""Assemble the movie from src/ parts.

  python build.py            -> ../NAS-T-BOX-Story.html (artifact fragment) + ../index.html (standalone, opens from disk)
Also checks narration pacing and that every referenced image exists, and writes ../narration-script.md and ../_files.json.
"""
import json, os, re, sys, html

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
rd = lambda n: open(os.path.join(here, n), encoding='utf-8').read()

css, js, js3d, scenes = rd('engine.css'), rd('engine.js'), rd('scene3d.js'), rd('scenes.html')
extra_css = rd('scenes.css') if os.path.exists(os.path.join(here, 'scenes.css')) else ''

HEAD = '''<title>The NAS-T-BOX Story</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
'''
LIBS = '''<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
'''
fragment = f'{HEAD}<style>\n{css}\n{extra_css}\n</style>\n{scenes}\n{LIBS}<script>\n{js3d}\n</script>\n<script>\n{js}\n</script>\n'
open(os.path.join(root, 'NAS-T-BOX-Story.html'), 'w', encoding='utf-8').write(fragment)

standalone = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
              '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
              f'{HEAD}<style>\n{css}\n{extra_css}\n</style>\n</head>\n<body>\n{scenes}\n{LIBS}<script>\n{js3d}\n</script>\n<script>\n{js}\n</script>\n</body>\n</html>\n')
open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(standalone)

# ---- checks -------------------------------------------------------------
used = sorted(set(re.findall(r'(?:src|href)="((?:img|model)/[^"]+)"', scenes) + re.findall(r"url\((?:'|\")?((?:img|model)/[^)'\"]+)", scenes + css + extra_css)))
used += [m for m in ['model/duct_v11.glb'] if m not in used and 'duct_v11.glb' in js3d]
missing = [u for u in used if not os.path.exists(os.path.join(root, u))]
size = sum(os.path.getsize(os.path.join(root, u)) for u in used if u not in missing)
json.dump(used, open(os.path.join(root, '_files.json'), 'w'), indent=0)

WPS = 2.75   # comfortable narration pace, words per second
t = 0.0
rows, script, problems = [], [], []
act = None
for m in re.finditer(r'<section class="scene[^"]*"([^>]*)>(.*?)</section>', scenes, re.S):
    attrs, body = m.group(1), m.group(2)
    sid = re.search(r'id="([^"]+)"', attrs).group(1)
    dur = float(re.search(r'data-dur="([^"]+)"', attrs).group(1))
    a = re.search(r'data-act="([^"]+)"', attrs)
    if a and a.group(1) != act:
        act = a.group(1)
        script.append(f'\n## {act}\n')
    caps = [(float(c.group(1)), html.unescape(re.sub(r'<[^>]+>', '', c.group(2)).strip())) for c in re.finditer(r'<p class="vo" data-at="([^"]+)">(.*?)</p>', body, re.S)]
    words = sum(len(c[1].split()) for c in caps)
    for i, (at, text) in enumerate(caps):
        end = caps[i + 1][0] if i + 1 < len(caps) else dur
        need = len(text.split()) / WPS
        if need > (end - at) + 0.35:
            problems.append(f'{sid} @{at:g}s: {len(text.split())} words need {need:.1f}s, has {end - at:.1f}s  | {text[:60]}')
        mm, ss = divmod(int(t + at), 60)
        script.append(f'**{mm}:{ss:02d}**  {text}\n')
    rows.append((sid, dur, words))
    t += dur
total_words = sum(r[2] for r in rows)
open(os.path.join(root, 'narration-script.md'), 'w', encoding='utf-8').write(
    '# The NAS-T-BOX Story — narration script\n\n'
    f'Runtime {int(t // 60)}:{int(t % 60):02d} · {total_words} words · timestamps are where each line starts in the movie.\n'
    + '\n'.join(script))
print(f'scenes {len(rows)}  runtime {int(t // 60)}:{int(t % 60):02d}  words {total_words}  files {len(used)} ({size / 1048576:.1f} MB)  fragment {len(fragment) // 1024} KB')
if missing:
    print('MISSING FILES:', missing)
for p in problems:
    print('PACE:', p)
