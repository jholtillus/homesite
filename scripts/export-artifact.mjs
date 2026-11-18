// Builds a self-contained copy of both sites for a claude.ai Artifact preview:
//  - main site at the root, the Theseus site under theseus/, the Panomachea site under panomachea/
//  - CSS inlined, page scripts bundled and inlined (the preview only runs inline/CDN scripts)
//  - fonts from Google Fonts instead of local files
//  - root-absolute URLs made relative via <base>, directory links rewritten to index.html
//  - links between the two sites point at each other inside the preview
//  - images downscaled to keep the upload small
// Output: artifact-preview/ (index.html is the main page; files.json lists every file to publish).
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, cpSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { buildSync } from 'esbuild';

const OUT = 'artifact-preview';
const MAIN_MARK = 'https://main.preview.invalid', THESEUS_MARK = 'https://theseus.preview.invalid', PANO_MARK = 'https://panomachea.preview.invalid';
const env = { ...process.env, ARTIFACT: '1', PUBLIC_MAIN_URL: MAIN_MARK, PUBLIC_THESEUS_URL: THESEUS_MARK, PUBLIC_PANOMACHEA_URL: PANO_MARK };
execSync('npx astro build', { stdio: 'inherit', env });
execSync('npx astro build', { stdio: 'inherit', env: { ...env, SITE: 'theseus' } });
execSync('npx astro build', { stdio: 'inherit', env: { ...env, SITE: 'panomachea' } });
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500&display=swap">';
const ROUTER = `<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank')return;var u=new URL(a.href,location.href);if(u.origin!==location.origin)return;if(u.pathname.slice(-1)==='/'){e.preventDefault();location.href=u.pathname+'index.html'+u.hash;}},true);</script>`;
const files = [];

function exportSite(SRC, prefix, roots) {
  for (const file of walk(SRC)) {
    const rel = relative(SRC, file).replace(/\\/g, '/');
    const outRel = prefix + rel;
    if (!rel.endsWith('.html')) {
      if (rel.startsWith('_astro/')) continue; // scripts are inlined; local fonts replaced by Google Fonts
      if (rel.startsWith('play/')) continue; // the web game's engine file is over the preview's per-file limit
      mkdirSync(dirname(join(OUT, outRel)), { recursive: true });
      cpSync(file, join(OUT, outRel));
      if (!rel.endsWith('.json')) files.push(outRel);
      continue;
    }
    let html = readFileSync(file, 'utf8');
    const inline = (code) => `<script>${code.replace(/<\/script/gi, '<\\/script')}</script>`;
    html = html.replace(/<script type="module" src="(\/_astro\/[^"]+)"><\/script>/g, (_, src) =>
      inline(buildSync({ entryPoints: [join(SRC, src)], bundle: true, format: 'iife', minify: true, write: false }).outputFiles[0].text));
    html = html.replace(/<script type="module">([\s\S]*?)<\/script>/g, (_, code) =>
      inline(buildSync({ stdin: { contents: code, resolveDir: SRC, loader: 'js' }, bundle: true, format: 'iife', minify: true, write: false }).outputFiles[0].text));
    html = html.replace(/@font-face\{[^}]*\}/g, '');
    // Cross-site links inside the preview.
    html = html.replaceAll(MAIN_MARK + '/', '/').replaceAll(MAIN_MARK, 'index.html');
    html = html.replaceAll(THESEUS_MARK + '/', 'theseus/').replaceAll(THESEUS_MARK, 'theseus/').replaceAll('theseus.preview.invalid', 'theseus.jordanholt.art');
    html = html.replaceAll(PANO_MARK + '/', 'panomachea/').replaceAll(PANO_MARK, 'panomachea/').replaceAll('panomachea.preview.invalid', 'panomachea.jordanholt.art');
    // Root-absolute -> relative to the preview root (resolved against <base>).
    html = html.replace(new RegExp(`(["'\`(,]\\s?)/(?=(${roots}))`, 'g'), `$1${prefix}`);
    if (prefix) html = html.replace(/(["'`])\/(?=(images|shop|projects|work|news|about|contact)\b)/g, '$1'); // links back to the main site
    html = html.replace(/href="\/(#[^"]*)?"/g, (_, h = '') => `href="${prefix}index.html${h}"`);
    html = html.replace(/(href|src)="([^"#:?]*\/)(#[^"]*)?"/g, (_, attr, path, hash = '') => `${attr}="${path}index.html${hash}"`);
    html = html.replace(/href="#([^"]*)"/g, (_, h) => `href="${outRel}#${h}"`);
    const depth = outRel.split('/').length - 1;
    const base = depth ? '../'.repeat(depth) : './';
    html = html.replace(/<head>/, `<head><base href="${base}">${FONTS}`).replace('</body>', `${ROUTER}</body>`);
    files.push(outRel);
    mkdirSync(dirname(join(OUT, outRel)), { recursive: true });
    writeFileSync(join(OUT, outRel), html);
  }
}
exportSite('dist-artifact', '', 'images|shop|projects|work|news|about|contact|_astro|favicon\\.svg|rss\\.xml');
exportSite('dist-artifact-theseus', 'theseus/', 'images|read|_astro|favicon\\.svg');
exportSite('dist-artifact-panomachea', 'panomachea/', 'images|_astro|favicon\\.svg');

// Downscale images for the preview upload.
execSync(`python3 -I -c "
import glob
from PIL import Image
for f in glob.glob('${OUT}/**/images/**/*.jpg', recursive=True):
    im = Image.open(f).convert('RGB'); im.thumbnail((1100, 1100)); im.save(f, quality=78, optimize=True, progressive=True)
"`);
writeFileSync(join(OUT, 'files.json'), JSON.stringify(files, null, 1));
const size = walk(OUT).reduce((n, f) => n + statSync(f).size, 0);
console.log(`artifact-preview: ${files.length} files + index.html, ${(size / 1e6).toFixed(1)} MB`);
