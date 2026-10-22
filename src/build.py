import glob, json, os, sys
t = open('template.html').read()
# Three.js r160 UMD build, vendored. Drop its leading console.warn (deprecation notice) so the page loads with a clean console.
three = open('vendor/three.min.js').read()
three = '/* three.js r160 - MIT License - Copyright 2010-2023 Three.js Authors (see vendor/THREE_LICENSE) */\n!' + three[three.index('function(t,e)'):]
# knowledge base: inlined so the "learn" panel works offline by double-click
kb = {os.path.basename(f)[:-3]: open(f).read() for f in sorted(glob.glob('knowledge/*.md'))}
# `python3 build.py public` writes dist/index.html for web hosting, without the team's own speaker-notes summary
PUBLIC = len(sys.argv) > 1 and sys.argv[1] == 'public'
if PUBLIC: kb = {k: v for k, v in kb.items() if not k.startswith('speaker_notes')}
parts = [('THREE', three), ('CHART', open('chart.js').read()), ('I18N', open('i18n.js').read()), ('PHYSICS', open('physics.js').read()),
         ('DEFAULTS', open('defaults.js').read()),
         ('KNOWLEDGE', 'const KNOWLEDGE = ' + json.dumps(kb, ensure_ascii=False).replace('</', '<\\/') + ';'),
         ('VIZ3D', open('viz3d.js').read()), ('UI', open('ui.js').read()), ('VIEWS', open('views.js').read()),
         ('OPT', open('optimizer.js').read())]
for k, src in parts:
    assert '/*%s*/' % k in t, k
    t = t.replace('/*%s*/' % k, src)
out = 'dist/index.html' if PUBLIC else 'hybrid_taxel_simulator.html'
os.makedirs('dist', exist_ok=True) if PUBLIC else None
open(out, 'w').write(t); print(out, len(t))
# public build also publishes the source code (same files, same structure) under dist/src so anyone can read and rerun it
if PUBLIC:
    import shutil
    SRC = ['physics.js', 'defaults.js', 'optimizer.js', 'i18n.js', 'ui.js', 'views.js', 'viz3d.js', 'chart.js', 'template.html',
           'build.py', 'test.js', 'verify.js', 'vendor/three.min.js', 'vendor/THREE_LICENSE'] + ['knowledge/%s.md' % k for k in kb]
    shutil.rmtree('dist/src', ignore_errors=True)
    for f in SRC:
        os.makedirs(os.path.dirname(os.path.join('dist/src', f)) or 'dist/src', exist_ok=True)
        shutil.copy2(f, os.path.join('dist/src', f))
    print('dist/src', len(SRC), 'files')
    exec(open('readme_public.py', encoding='utf-8').read())
