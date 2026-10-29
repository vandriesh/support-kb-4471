// Make one self-contained HTML file from a built kb page: CSS inline, no scripts.
// Usage: node scripts/standalone.mjs <route> <out file>, after `npm run build`.
import fs from 'node:fs';
import path from 'node:path';

const [route, out] = process.argv.slice(2);
let html = fs.readFileSync(path.join('build', route, 'index.html'), 'utf8');
html = html.replace(/<link[^>]*href="([^"]+\.css)"[^>]*>/g, (_, href) => {
  const css = fs.readFileSync(path.join('build', route, href), 'utf8');
  return `<style>${css}</style>`;
});
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`${out}: ${html.length} bytes`);
