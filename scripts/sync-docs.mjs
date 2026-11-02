// Copies frus's documentation into the site before every build.
//
// The pages are written once, in the frus repository (`docs/`, `ARCHITECTURE.md`, ...), where
// GitHub shows them and frus's test suite compiles their examples. This script places them
// where the site reads them and points every link that leaves the copied set at GitHub, so
// the site never holds a second, staler copy.
//
// Where the frus repository is found, in order:
//   1. `FRUS_REPO`, a path to a checkout;
//   2. `../frus`, a checkout beside this one;
//   3. `.frus/`, a shallow clone of the public repository, made on first use.
//      `FRUS_UPDATE=1` pulls it first.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const github = 'https://github.com/KalybosPro/frus/blob/master';

function findRepo() {
  const isFrus = (dir) => fs.existsSync(path.join(dir, 'docs/guide/README.md'));
  if (process.env.FRUS_REPO) {
    const dir = path.resolve(process.env.FRUS_REPO);
    if (!isFrus(dir)) throw new Error(`FRUS_REPO=${dir} is not a frus checkout`);
    return dir;
  }
  const sibling = path.resolve(site, '../frus');
  if (isFrus(sibling)) return sibling;
  const clone = path.join(site, '.frus');
  if (!isFrus(clone)) {
    execFileSync('git', ['clone', '--depth', '1', 'https://github.com/KalybosPro/frus.git', clone], {stdio: 'inherit'});
  } else if (process.env.FRUS_UPDATE === '1') {
    execFileSync('git', ['-C', clone, 'pull', '--ff-only', '--depth', '1'], {stdio: 'inherit'});
  }
  return clone;
}

const repo = findRepo();

// Repository file → page in the site's `docs/`.
const pages = {
  'docs/getting-started.md': 'getting-started.md',
  'docs/app-structure.md': 'app-structure.md',
  'ARCHITECTURE.md': 'internals/architecture.md',
  'CONTRIBUTING.md': 'internals/contributing.md',
  'crates/frus-cli/README.md': 'tooling/cli.md',
};
for (const file of fs.readdirSync(path.join(repo, 'docs/guide'))) {
  if (file.endsWith('.md')) pages[`docs/guide/${file}`] = `guide/${file}`;
}

// Pictures the home page shows.
const media = ['tasks.png', 'charts.png', 'board.png', 'data.png', 'android.png', 'light.png', 'tour.gif'];

const copied = new Set(Object.keys(pages));

function rewriteLinks(source, text) {
  const dir = path.posix.dirname(source);
  return text.replace(/(!?\[[^\]]*\])\(([^)\s]+)\)/g, (whole, label, target) => {
    if (/^[a-z]+:/i.test(target) || target.startsWith('#')) return whole;
    const [file, anchor] = target.split('#');
    const resolved = path.posix.normalize(path.posix.join(dir, file));
    if (copied.has(resolved)) {
      const from = path.posix.dirname(pages[source]);
      const rel = path.posix.relative(from, pages[resolved]) || path.posix.basename(pages[resolved]);
      return `${label}(${rel}${anchor ? `#${anchor}` : ''})`;
    }
    const kind = fs.existsSync(path.join(repo, resolved)) && fs.statSync(path.join(repo, resolved)).isDirectory()
      ? 'tree'
      : 'blob';
    const url = `${github.replace('/blob/', `/${kind}/`)}/${resolved.replace(/\/$/, '')}`;
    return `${label}(${url}${anchor ? `#${anchor}` : ''})`;
  });
}

for (const [source, page] of Object.entries(pages)) {
  const text = fs.readFileSync(path.join(repo, source), 'utf8');
  const front = `---\ncustom_edit_url: ${github}/${source}\n---\n\n`;
  const out = path.join(site, 'docs', page);
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, front + rewriteLinks(source, text));
}

const mediaOut = path.join(site, 'static/media');
fs.mkdirSync(mediaOut, {recursive: true});
for (const file of media) {
  fs.copyFileSync(path.join(repo, 'docs/media', file), path.join(mediaOut, file));
}

console.log(`synced ${Object.keys(pages).length} pages and ${media.length} pictures from ${repo}`);

// The playground's examples, which its tests compile: the page loads them from here.
const examplesOut = path.join(site, 'static/playground-app/examples');
fs.mkdirSync(examplesOut, {recursive: true});
for (const file of fs.readdirSync(path.join(site, 'playground/examples-src'))) {
  fs.copyFileSync(path.join(site, 'playground/examples-src', file), path.join(examplesOut, file));
}
