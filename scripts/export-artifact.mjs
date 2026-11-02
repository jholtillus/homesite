// Builds a self-contained copy of the site for a claude.ai Artifact preview:
//  - CSS inlined, page scripts bundled and inlined (the preview only runs inline/CDN scripts)
//  - fonts from Google Fonts instead of local files
//  - root-absolute URLs made relative via <base>, directory links rewritten to index.html
//  - images downscaled to keep the upload small
// Output: artifact-preview/ (index.html is the main page; everything else is published alongside).
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, cpSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { buildSync } from 'esbuild';

const SRC = 'dist-artifact', OUT = 'artifact-preview';
execSync('npx astro build', { stdio: 'inherit', env: { ...process.env, ARTIFACT: '1' } });
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap">';
const ROUTER = `<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank')return;var u=new URL(a.href,location.href);if(u.origin!==location.origin)return;if(u.pathname.slice(-1)==='/'){e.preventDefault();location.href=u.pathname+'index.html'+u.hash;}},true);</script>`;
const ROOTS = 'images|shop|projects|work|news|about|contact|_astro|favicon\\.svg|rss\\.xml';
const files = [];

for (const file of walk(SRC)) {
  const rel = relative(SRC, file);
  if (!rel.endsWith('.html')) {
    if (rel.startsWith('_astro/')) continue; // scripts are inlined; local fonts replaced by Google Fonts
    mkdirSync(dirname(join(OUT, rel)), { recursive: true });
    cpSync(file, join(OUT, rel));
    if (!rel.endsWith('.json')) files.push(rel);
    continue;
  }
  let html = readFileSync(file, 'utf8');
  // Inline module scripts as bundled IIFEs.
  html = html.replace(/<script type="module" src="(\/_astro\/[^"]+)"><\/script>/g, (_, src) => {
    const code = buildSync({ entryPoints: [join(SRC, src)], bundle: true, format: 'iife', minify: true, write: false }).outputFiles[0].text;
    return `<script>${code.replace(/<\/script/gi, '<\\/script')}</script>`;
  });
  html = html.replace(/<script type="module">([\s\S]*?)<\/script>/g, (_, code) => {
    const out = buildSync({ stdin: { contents: code, resolveDir: SRC, loader: 'js' }, bundle: true, format: 'iife', minify: true, write: false }).outputFiles[0].text;
    return `<script>${out.replace(/<\/script/gi, '<\\/script')}</script>`;
  });
  html = html.replace(/@font-face\{[^}]*\}/g, '');
  // Root-absolute -> root-relative (resolved against <base>).
  html = html.replace(new RegExp(`(["'\`(,]\\s?)/(?=(${ROOTS}))`, 'g'), '$1');
  html = html.replace(/href="\/"/g, 'href="index.html"');
  html = html.replace(/(href|src)="([^"#:?]+\/)(#[^"]*)?"/g, (_, attr, path, hash = '') => `${attr}="${path}index.html${hash}"`);
  const pagePath = rel.replace(/\\/g, '/');
  html = html.replace(/href="#([^"]*)"/g, (_, h) => `href="${pagePath}#${h}"`);
  const depth = pagePath.split('/').length - 1;
  const base = depth ? '../'.repeat(depth) : './';
  html = html.replace(/<head>/, `<head><base href="${base}">${FONTS}`).replace('</body>', `${ROUTER}</body>`);

  if (pagePath === 'index.html') {
    // The main page is wrapped in the host's own document skeleton.
    const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<base[^>]*>/g, '');
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
    html = head + body;
  } else files.push(pagePath);
  mkdirSync(dirname(join(OUT, pagePath)), { recursive: true });
  writeFileSync(join(OUT, pagePath), html);
}

// Downscale images for the preview upload.
execSync(`python3 -I -c "
import glob
from PIL import Image
for f in glob.glob('${OUT}/images/**/*.jpg', recursive=True):
    im = Image.open(f).convert('RGB'); im.thumbnail((1100, 1100)); im.save(f, quality=78, optimize=True, progressive=True)
"`);
writeFileSync(join(OUT, 'files.json'), JSON.stringify(Object.fromEntries(files.map((f) => [f, join(OUT, f)])), null, 1));
const size = walk(OUT).reduce((n, f) => n + statSync(f).size, 0);
console.log(`artifact-preview: ${files.length} files + index.html, ${(size / 1e6).toFixed(1)} MB`);
