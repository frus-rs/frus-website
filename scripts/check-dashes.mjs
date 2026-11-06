// Fails when an em dash is left in the site's text: the pages, the generated catalog, the
// copied documentation and the translations. `scripts/punctuation.mjs` says why.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['docs', 'widgets', 'blog', 'src', 'i18n', 'docusaurus.config.ts', 'sidebars.ts'];
const text = /\.(md|mdx|tsx?|json|ya?ml)$/;

const found = [];
function walk(file) {
  if (!fs.existsSync(file)) return;
  if (fs.statSync(file).isDirectory()) {
    for (const entry of fs.readdirSync(file)) walk(path.join(file, entry));
    return;
  }
  if (!text.test(file)) return;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes('\u2014') || line.includes('&mdash;')) {
      found.push(`${path.relative(site, file)}:${i + 1}: ${line.trim().slice(0, 100)}`);
    }
  });
}
roots.forEach((root) => walk(path.join(site, root)));

if (found.length) {
  console.error(`${found.length} em dash(es) left in the site's text:\n${found.join('\n')}`);
  process.exit(1);
}
console.log('no em dashes in the site');
