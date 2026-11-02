// Writes `src/data/playground-api.json`, which the playground's editor completes from: the names
// the interpreter offers (`playground/api.json`), each with the first sentence of its doc comment
// from frus's rustdoc JSON (`RUSTDOC_JSON`, a folder), when that sentence describes the widget and
// not where its design comes from.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rustdocDir = process.env.RUSTDOC_JSON;
if (!rustdocDir) throw new Error('RUSTDOC_JSON: the folder holding frus_widgets.json');
const api = JSON.parse(fs.readFileSync(path.join(site, 'playground/api.json'), 'utf8'));
const pedigree = /\breference\b|flutter|\bdart\b/i;

const docs = new Map();
for (const crate of ['frus_widgets', 'frus_core']) {
  const {index} = JSON.parse(fs.readFileSync(path.join(rustdocDir, `${crate}.json`), 'utf8'));
  for (const item of Object.values(index)) {
    const inner = item.crate_id === 0 && (item.inner.struct ?? item.inner.enum);
    if (!inner) continue;
    for (const id of inner.impls ?? []) {
      const impl = index[id];
      if (!impl || impl.inner.impl.trait) continue;
      for (const memberId of impl.inner.impl.items) {
        const member = index[memberId];
        if (member?.docs) docs.set(`${item.name}.${member.name}`, member.docs);
      }
    }
  }
}

function firstSentence(text) {
  if (!text) return undefined;
  const spans = [];
  const masked = text.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').replace(/`[^`]*`/g, (m) => `\0${spans.push(m) - 1}\0`);
  const sentence = masked.split(/(?<=[.!?])\s/)[0].replace(/\0(\d+)\0/g, (_, i) => spans[+i]);
  const plain = sentence.replace(/\[`?([^\]`]+)`?\]\([^)]*\)/g, '$1').replace(/\[`([^`]+)`\]/g, '$1').replace(/\*\*/g, '').replace(/`/g, '').trim();
  return pedigree.test(plain) ? undefined : plain;
}

let documented = 0;
for (const [type, entry] of Object.entries(api.types)) {
  for (const member of [...entry.constructors, ...entry.methods]) {
    const doc = firstSentence(docs.get(`${type}.${member.name}`));
    if (doc) {
      member.doc = doc;
      documented++;
    }
  }
}

fs.mkdirSync(path.join(site, 'src/data'), {recursive: true});
fs.writeFileSync(path.join(site, 'src/data/playground-api.json'), `${JSON.stringify(api, null, 1)}\n`);
console.log(`${Object.keys(api.types).length} types, ${documented} members documented`);
