// Packs each example application of the latest frus release into a .zip the site offers.
//
// The examples are taken from the release tag of the version published on crates.io, not from
// frus's master: master moves ahead of the published crate, and a downloaded example has to
// build against what `cargo` fetches. In the repository each example depends on the checkout it
// sits in (`frus = { path = "../../crates/frus" }`); in the archive it depends on the published
// crate, and the comments and README sections about the checkout go.
//
// Writes `static/downloads/examples/<name>.zip` and `src/data/examples.json`.
//
// Which release, in order: `FRUS_EXAMPLES_VERSION` (e.g. `0.5.0`); the newest stable version on
// crates.io. The tag is shallow-cloned into `.frus-release/v<version>/` once.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {crc32, deflateRawSync} from 'node:zlib';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(site, 'static/downloads/examples');

async function releasedVersion() {
  if (process.env.FRUS_EXAMPLES_VERSION) return process.env.FRUS_EXAMPLES_VERSION;
  try {
    const response = await fetch('https://crates.io/api/v1/crates/frus', {
      headers: {'User-Agent': 'frus-website build (https://frus.dev)'},
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`crates.io answered ${response.status}`);
    return (await response.json()).crate.max_stable_version;
  } catch (err) {
    // A release is tagged once it is published: the newest `vX.Y.Z` tag names the same version.
    console.warn(`crates.io unreachable (${err.message}): using the newest release tag`);
    const tags = execFileSync('git', ['ls-remote', '--tags', '--refs', 'https://github.com/frus-rs/frus.git'], {
      encoding: 'utf8',
    })
      .split('\n')
      .map((line) => line.match(/refs\/tags\/v(\d+)\.(\d+)\.(\d+)$/))
      .filter(Boolean)
      .map((m) => m.slice(1).map(Number))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    if (tags.length === 0) throw new Error('no release tag found');
    return tags.at(-1).join('.');
  }
}

function checkout(version) {
  const dir = path.join(site, '.frus-release', `v${version}`);
  if (!fs.existsSync(path.join(dir, 'frus-examples'))) {
    fs.rmSync(dir, {recursive: true, force: true});
    execFileSync(
      'git',
      ['-c', 'core.autocrlf=false', '-c', 'advice.detachedHead=false', 'clone', '--quiet', '--depth', '1', '--branch', `v${version}`, 'https://github.com/frus-rs/frus.git', dir],
      {stdio: 'inherit'},
    );
  }
  return dir;
}

// `0.5.0` → `0.5`: what a project writes in its manifest.
const requirement = (version) => version.split('.').slice(0, 2).join('.');

function rewriteManifest(text, version) {
  return (
    text
      // The sentence that sends readers from the checkout to the published crate.
      // It ends on the line that quotes the manifest entry: `frus = "0.3"` or `frus = { .. }`.
      // Begun on a line of its own, the lines go; begun mid-line, that line keeps its start.
      .replace(
        /(^# )?(?:This points at the frus checkout|frus is not \(yet\) published)[\s\S]*?frus = (?:"\d+\.\d+"|\{[^}\n]*\})\n/gm,
        (_, lineStart) => (lineStart ? '' : '\n'),
      )
      // A comment left with an empty line at its head, where the sentence was.
      .replace(/^(\[dependencies\]\n)#\n/gm, '$1')
      .replace(/[ \t]+$/gm, '')
      .replace(/path = "[^"]*crates\/frus"/g, `version = "${requirement(version)}"`)
  );
}

function rewriteReadme(text, version) {
  return text.replace(
    /## Building against the published crate\n[\s\S]*?(?=\n## |$)/,
    '## The frus dependency\n\n' +
      `This copy depends on the published crate, \`frus = "${requirement(version)}"\`: frus ${version}, ` +
      'the release it was taken from.\n',
  );
}

// A .zip of `files` ({name, data}), deflated, with no dependency.
function zip(files) {
  const local = [];
  const central = [];
  let offset = 0;
  // 2026-01-01 00:00 in DOS time: the archive does not depend on when it was made.
  const time = 0;
  const date = ((2026 - 1980) << 9) | (1 << 5) | 1;
  for (const {name, data} of files) {
    const nameBytes = Buffer.from(name, 'utf8');
    const packed = deflateRawSync(data, {level: 9});
    const stored = packed.length >= data.length;
    const body = stored ? data : packed;
    const crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(stored ? 0 : 8, 8);
    header.writeUInt16LE(time, 10);
    header.writeUInt16LE(date, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(body.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    local.push(header, nameBytes, body);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(0x0314, 4); // made by Unix, so the mode below is read
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(stored ? 0 : 8, 10);
    entry.writeUInt16LE(time, 12);
    entry.writeUInt16LE(date, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBytes.length, 28);
    entry.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBytes);
    offset += header.length + nameBytes.length + body.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}

// The table in frus-examples/README.md: | [`name`](name) | what it teaches |
function descriptions(readme) {
  const found = [];
  for (const match of readme.matchAll(/^\| \[`([\w-]+)`\]\([\w-]+\) \| (.+?) \|$/gm)) {
    found.push({name: match[1], teaches: match[2]});
  }
  return found;
}

const version = await releasedVersion();
const repo = checkout(version);
const tracked = execFileSync('git', ['-C', repo, 'ls-files', '-z', 'frus-examples'], {encoding: 'utf8'})
  .split('\0')
  .filter(Boolean);

fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});
const listed = descriptions(fs.readFileSync(path.join(repo, 'frus-examples/README.md'), 'utf8'));
const examples = [];
for (const {name, teaches} of listed) {
  const prefix = `frus-examples/${name}/`;
  const files = tracked
    .filter((file) => file.startsWith(prefix))
    .map((file) => {
      let data = fs.readFileSync(path.join(repo, file));
      const base = path.posix.basename(file);
      if (base === 'Cargo.toml') data = Buffer.from(rewriteManifest(data.toString('utf8'), version));
      if (base === 'README.md') data = Buffer.from(rewriteReadme(data.toString('utf8'), version));
      return {name: `${name}/${file.slice(prefix.length)}`, data};
    });
  if (files.length === 0) throw new Error(`frus-examples/${name} has no files at v${version}`);
  const left = files.find((f) => f.name.endsWith('Cargo.toml') && /crates\/frus"/.test(f.data.toString()));
  if (left) throw new Error(`${left.name} still points at a frus checkout`);
  const archive = zip(files);
  fs.writeFileSync(path.join(out, `${name}.zip`), archive);
  examples.push({name, teaches, files: files.length, bytes: archive.length});
}

fs.mkdirSync(path.join(site, 'src/data'), {recursive: true});
fs.writeFileSync(
  path.join(site, 'src/data/examples.json'),
  JSON.stringify({version, tag: `v${version}`, examples}, null, 2) + '\n',
);
console.log(`packed ${examples.length} examples of frus ${version}`);
