// Writes the widget catalog, `widgets/`: one page per demo of frus's widget gallery, each made
// from the widget's own source at a pinned revision of frus.
//
//   Purpose     the demo's one-sentence summary, from the gallery's catalog
//   Signature   the type and its constructors, copied verbatim from the source
//   Example     the rendered demo, and the demo's file as the gallery compiles it
//   Properties  the builder methods: their arguments verbatim, and their doc comment
//   Behaviour   the type's doc comment
//   See also    the family's other widgets, the guide's page, the API reference
//   Source      a permalink to the file, at the pinned revision
//
// Inputs, all made from a frus checkout (`FRUS_REPO`, else `../frus`):
//   - rustdoc JSON for frus-widgets, frus-shell and frus-core (`RUSTDOC_JSON`, a folder):
//       cargo +nightly rustdoc -p frus-widgets --all-features -- -Z unstable-options --output-format json
//   - the gallery's catalog and previews, from `tools/widget-shots`.
// The pages are committed; run this again to bring them to a newer frus.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frus = path.resolve(process.env.FRUS_REPO ?? path.join(site, '../frus'));
const rustdocDir = process.env.RUSTDOC_JSON;
if (!rustdocDir) throw new Error('RUSTDOC_JSON: the folder holding frus_widgets.json, frus_shell.json and frus_core.json');
const catalog = JSON.parse(fs.readFileSync(path.join(site, 'tools/widget-shots/catalog.json'), 'utf8'));
const rev = execFileSync('git', ['-C', frus, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
const short = rev.slice(0, 12);
const dirty = execFileSync('git', ['-C', frus, 'status', '--porcelain', '--', 'crates', 'frus-examples/widgets'], {encoding: 'utf8'}).trim();
if (dirty) console.warn(`warning: the frus checkout has uncommitted changes; the permalinks name ${short}:\n${dirty}`);

const github = `https://github.com/frus-rs/frus/blob/${rev}`;
const out = path.join(site, 'widgets');

// The guide's page for each family.
const guide = {
  layout: ['Laying out a screen', '/docs/guide/layout'],
  text: ['Text, colour and the theme', '/docs/guide/style'],
  buttons: ['Taking input', '/docs/guide/input'],
  inputs: ['Taking input', '/docs/guide/input'],
  display: ['Text, colour and the theme', '/docs/guide/style'],
  feedback: ['Screens, navigation and dialogs', '/docs/guide/navigation'],
  navigation: ['Screens, navigation and dialogs', '/docs/guide/navigation'],
  scrolling: ['Lists and grids', '/docs/guide/lists'],
  animation: ['Animation', '/docs/guide/animation'],
  painting: ['Text, colour and the theme', '/docs/guide/style'],
  interaction: ['Taking input', '/docs/guide/input'],
  state: ['Starting a frus application', '/docs/getting-started'],
};

// ---- rustdoc ---------------------------------------------------------------------------------

const crates = ['frus_widgets', 'frus_shell', 'frus_core'].map((name) => {
  const json = JSON.parse(fs.readFileSync(path.join(rustdocDir, `${name}.json`), 'utf8'));
  return {name, index: json.index};
});

// Public items of the crates' own, by name, frus-widgets first.
const byName = new Map();
for (const krate of crates) {
  for (const item of Object.values(krate.index)) {
    if (item.crate_id !== 0 || item.visibility !== 'public' || !item.name || !item.span) continue;
    const kind = ['struct', 'enum', 'function', 'trait'].find((k) => item.inner[k]);
    if (!kind) continue;
    if (kind === 'function' && isMethod(krate, item)) continue;
    if (!byName.has(item.name)) byName.set(item.name, {krate, item, kind});
  }
}

function isMethod(krate, item) {
  // A free function's span is not inside an impl; rustdoc lists methods under impls only, so
  // a function reachable from an impl's items is a method.
  krate.methods ??= new Set(
    Object.values(krate.index)
      .filter((i) => i.inner.impl)
      .flatMap((i) => i.inner.impl.items),
  );
  return krate.methods.has(item.id);
}

const sources = new Map();
function sourceLines(span) {
  const file = span.filename.replaceAll('\\', '/');
  if (!sources.has(file)) sources.set(file, fs.readFileSync(path.join(frus, file), 'utf8').split(/\r?\n/));
  return sources.get(file);
}

// The item's declaration as written: from its first line to the `{` that opens its body.
function declaration(span, {body = false} = {}) {
  const lines = sourceLines(span);
  const begin = span.begin[0] - 1;
  if (body) return dedent(lines.slice(begin, span.end[0]));
  const taken = [];
  for (let i = begin; i < span.end[0]; i++) {
    const line = lines[i];
    taken.push(line);
    if (/[{;]\s*$/.test(line) && !/^\s*#\[/.test(line)) break;
  }
  return dedent(taken).replace(/\s*\{\s*$/, '');
}

function dedent(lines) {
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
}

function inherentMethods(krate, item) {
  const impls = (item.inner.struct ?? item.inner.enum)?.impls ?? [];
  return impls
    .map((id) => krate.index[id])
    .filter((impl) => impl && !impl.inner.impl.trait && !impl.inner.impl.blanket_impl)
    .flatMap((impl) => impl.inner.impl.items.map((id) => krate.index[id]))
    .filter((m) => m && m.visibility === 'public' && m.inner.function && m.span);
}

const takesSelf = (m) => m.inner.function.sig.inputs[0]?.[0] === 'self';
const returnsSelf = (m) => m.inner.function.sig.output?.generic === 'Self';

// The arguments of a method, as written, without `self`.
function argumentsOf(m) {
  const decl = declaration(m.span).replace(/\s+/g, ' ');
  const open = decl.indexOf('(', decl.indexOf(`fn ${m.name}`));
  let depth = 0;
  let close = open;
  for (; close < decl.length; close++) {
    if (decl[close] === '(') depth++;
    if (decl[close] === ')' && --depth === 0) break;
  }
  return decl
    .slice(open + 1, close)
    .replace(/^\s*(mut\s+)?self\s*(:[^,]*)?,?\s*/, '')
    .replace(/,\s*$/, '')
    .trim();
}

// ---- doc comments ----------------------------------------------------------------------------

// Public pages describe what a widget does, not where its design comes from.
const pedigree = /\breference\b|flutter|\.dart\b|\bdart:|\bdart\b/i;

// A paragraph's sentences. A sentence ends at `.`, `!` or `?` followed by a space, outside code
// spans, so `checkbox.rs` or `1.5` never split one.
function sentencesOf(text) {
  const spans = [];
  const masked = text.replace(/`[^`]*`/g, (m) => `\u0000${spans.push(m) - 1}\u0000`);
  return masked
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => spans[+i]));
}

function cleanDocs(docs) {
  if (!docs) return '';
  const blocks = [];
  let code = null;
  for (const line of docs.split('\n')) {
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      if (code === null) {
        const lang = fence[1].trim();
        code = [/^(|rust|ignore|no_run|should_panic|compile_fail|edition\d+)(,.*)?$/.test(lang) ? '```rust' : '```' + lang];
      } else {
        code.push('```');
        blocks.push({code: code.join('\n')});
        code = null;
      }
      continue;
    }
    if (code !== null) {
      if (/^\s*# /.test(line) || /^\s*#$/.test(line)) continue;
      code.push(line);
      continue;
    }
    blocks.push({text: line});
  }
  // Prose: paragraphs, then sentences.
  const out = [];
  let para = [];
  const flush = () => {
    if (!para.length) return;
    const text = para.join('\n');
    para = [];
    if (/^\s*([-*]|\d+\.)\s/.test(text) || /^\s*\|/.test(text)) {
      const kept = text.split('\n').filter((l) => !pedigree.test(l));
      if (kept.length) out.push(kept.join('\n'));
      return;
    }
    if (/^#+\s/.test(text)) {
      if (!pedigree.test(text)) out.push(text.replace(/^#+/, '###'));
      return;
    }
    const kept = sentencesOf(text.replace(/\n/g, ' '))
      .filter((s) => !pedigree.test(s))
      .join(' ')
      .trim();
    if (kept) out.push(kept);
  };
  for (const b of blocks) {
    if (b.code) {
      flush();
      out.push(b.code);
    } else if (!b.text.trim()) {
      flush();
    } else {
      para.push(b.text);
    }
  }
  flush();
  return links(out.join('\n\n'));
}

// Intra-doc links have no target outside rustdoc: keep their text.
function links(md) {
  return md
    .replace(/\[(`[^`\]]+`)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\((?:crate|self|super)::[^)]*\)/g, '$1')
    .replace(/\[(`[^`\]]+`)\](?!\()/g, '$1')
    .replace(/\[([^\]`]+)\]\[[^\]]*\]/g, '$1');
}

const firstSentence = (docs) => {
  const clean = cleanDocs((docs ?? '').split(/\n\s*\n/)[0]);
  return clean.replace(/\s+/g, ' ').trim() || '—';
};

// ---- the demo's types ------------------------------------------------------------------------

function primaryItems(demo) {
  const found = [];
  const add = (name) => {
    const hit = byName.get(name);
    if (hit && !found.some((f) => f.item.id === hit.item.id)) found.push(hit);
  };
  for (const token of demo.name.split(/[^A-Za-z0-9_:]+/)) add(token.split('::')[0]);
  if (!found.length) add(demo.id.split(/[-_]/).map((p) => p[0].toUpperCase() + p.slice(1)).join(''));
  if (!found.length) add(demo.id.replace(/-/g, '_'));
  return found;
}

function docsRs({krate, item, kind}) {
  const page = kind === 'function' ? `fn.${item.name}` : `${kind}.${item.name}`;
  return `https://docs.rs/frus/latest/frus/${page}.html`;
}

// The gallery's file for a demo, found by its contents.
const demoFiles = new Map();
for (const category of catalog) {
  const dir = path.join(frus, 'frus-examples/widgets/src/features', category.id, 'widgets');
  for (const file of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    demoFiles.set(text.replace(/\r\n/g, '\n'), `frus-examples/widgets/src/features/${category.id}/widgets/${file}`);
  }
}

// ---- pages -----------------------------------------------------------------------------------

const table = (s) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

function page(category, demo, position) {
  const items = primaryItems(demo);
  const file = demoFiles.get(demo.source.replace(/\r\n/g, '\n'));
  if (!file) throw new Error(`no gallery file has the source of ${demo.id}`);
  const title = items.length ? items.map((i) => `\`${i.item.name}\``).join(' and ') : demo.name;
  const lines = [
    '---',
    `title: ${JSON.stringify(demo.name)}`,
    `sidebar_label: ${JSON.stringify(demo.name)}`,
    `sidebar_position: ${position}`,
    `description: ${JSON.stringify(demo.summary)}`,
    'custom_edit_url: null',
    '---',
    '',
    `# ${title}`,
    '',
    '## Purpose',
    '',
    demo.summary,
    '',
    '## Signature',
    '',
  ];

  if (items.length) {
    for (const hit of items) {
      const {item, kind, krate} = hit;
      const parts = [];
      if (kind === 'function' || kind === 'trait') {
        parts.push(declaration(item.span) + (kind === 'trait' ? ' { .. }' : ''));
      } else {
        const header = declaration(item.span);
        const short = kind === 'enum' && item.span.end[0] - item.span.begin[0] < 30;
        parts.push(short ? declaration(item.span, {body: true}) : `${header}${/;$/.test(header) ? '' : ' { .. }'}`);
        const ctors = inherentMethods(krate, item).filter((m) => !takesSelf(m) && returnsSelf(m));
        if (ctors.length) {
          parts.push(`impl ${item.name} {\n${ctors.map((c) => indent(declaration(c.span) + ';')).join('\n')}\n}`);
        }
      }
      lines.push('```rust', parts.join('\n\n'), '```', '');
    }
  } else {
    lines.push(
      `This demo shows a pattern rather than one type. The names it uses are in the example below, and each one is in the [API reference](https://docs.rs/frus).`,
      '',
    );
  }

  lines.push('## Example', '');
  if (demo.preview) lines.push(`![Rendered preview of the ${demo.name} demo](/preview/${demo.id}.light.png)`, '');
  lines.push(`From [\`${file}\`](${github}/${file}):`, '', '```rust', demo.source.replace(/\r\n/g, '\n').trimEnd(), '```', '');

  const builders = items.flatMap((hit) =>
    hit.kind === 'struct' || hit.kind === 'enum'
      ? inherentMethods(hit.krate, hit.item)
          .filter((m) => takesSelf(m) && returnsSelf(m))
          .map((m) => ({owner: hit.item.name, m}))
      : [],
  );
  lines.push('## Properties', '');
  if (builders.length) {
    lines.push(items.length > 1 ? '| Type | Method | Argument | Effect |' : '| Method | Argument | Effect |');
    lines.push(items.length > 1 ? '| --- | --- | --- | --- |' : '| --- | --- | --- |');
    for (const {owner, m} of builders) {
      const args = argumentsOf(m);
      const row = [`\`.${m.name}()\``, args ? `\`${table(args)}\`` : '—', table(firstSentence(m.docs))];
      if (items.length > 1) row.unshift(`\`${owner}\``);
      lines.push(`| ${row.join(' | ')} |`);
    }
  } else {
    lines.push(items.length ? 'No builder methods: everything is set through the constructor.' : 'See the example.');
  }
  lines.push('');

  lines.push('## Behaviour', '');
  const behaviour = items.map((hit) => {
    const docs = cleanDocs(hit.item.docs);
    return items.length > 1 && docs ? `### \`${hit.item.name}\`\n\n${docs}` : docs;
  }).filter(Boolean);
  lines.push(behaviour.length ? behaviour.join('\n\n') : 'The example shows it at work; the API reference has every method.', '');

  lines.push('## See also', '');
  const siblings = category.demos.filter((d) => d.id !== demo.id);
  const at = category.demos.findIndex((d) => d.id === demo.id);
  const near = [...category.demos.slice(Math.max(0, at - 2), at), ...category.demos.slice(at + 1, at + 4)];
  for (const d of near.length ? near : siblings.slice(0, 5)) lines.push(`- [${d.name}](./${d.id}.md): ${lowerFirst(d.summary)}`);
  const [guideTitle, guideUrl] = guide[category.id];
  lines.push(`- The guide: [${guideTitle}](${guideUrl})`);
  for (const hit of items) lines.push(`- API reference: [\`${hit.item.name}\`](${docsRs(hit)})`);
  lines.push('');

  const sourced = items.length ? items : [];
  if (sourced.length) {
    const refs = sourced.map(({item}) => {
      const f = item.span.filename.replaceAll('\\', '/');
      return `[${f}](${github}/${f}#L${item.span.begin[0]}-L${item.span.end[0]})`;
    });
    lines.push(`Source: ${[...new Set(refs)].join(', ')} @ \`${short}\``);
  } else {
    lines.push(`Source: [${file}](${github}/${file}) @ \`${short}\``);
  }
  lines.push('');
  return {text: lines.join('\n'), typed: items.length > 0};
}

const indent = (s) => s.split('\n').map((l) => '    ' + l).join('\n');
const lowerFirst = (s) => s[0].toLowerCase() + s.slice(1);

// ---- write -----------------------------------------------------------------------------------

for (const entry of fs.existsSync(out) ? fs.readdirSync(out) : []) {
  if (entry !== 'index.md') fs.rmSync(path.join(out, entry), {recursive: true, force: true});
}
fs.mkdirSync(out, {recursive: true});

let total = 0;
let untyped = [];
catalog.forEach((category, i) => {
  const dir = path.join(out, category.id);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, '_category_.json'),
    JSON.stringify(
      {
        label: category.name,
        position: i + 1,
        link: {type: 'generated-index', description: `${category.summary}.`, slug: `/${category.id}`},
      },
      null,
      2,
    ) + '\n',
  );
  category.demos.forEach((demo, j) => {
    const {text, typed} = page(category, demo, j + 1);
    if (!typed) untyped.push(demo.id);
    fs.writeFileSync(path.join(dir, `${demo.id}.md`), text);
    total++;
  });
});

fs.writeFileSync(path.join(site, 'widgets/index.md'), landing(total));

console.log(`wrote ${total} widget pages from frus ${short}`);
if (untyped.length) console.log(`${untyped.length} without a single type (pattern demos): ${untyped.join(', ')}`);

function landing(count) {
  const rows = catalog
    .map((c) => `| [${c.name}](./${c.id}) | ${c.demos.length} | ${c.summary} |`)
    .join('\n');
  return `---
title: Widget catalog
sidebar_label: Widget catalog
sidebar_position: 0
slug: /
custom_edit_url: null
---

# Widget catalog

frus ships one widget library, \`frus-widgets\`. Its defaults come from the theme, and an
application can override every one of them. This catalog has **${count} pages as of
\`${short}\`**, one for each demo of frus's widget gallery, in twelve families.

Every page is written from the widget's own source and from the gallery's demo, at the revision
its source line names. The gallery also runs in the browser, at
<https://frus-rs.github.io/frus/>, if yours has WebGPU.

## The families

| Family | Pages | What is in it |
| --- | --- | --- |
${rows}

## How to read a widget page

| Part | What it is |
| --- | --- |
| Purpose | One sentence: what the widget is for. |
| Signature | The type and its constructors as they are spelled in the source, copied verbatim. |
| Example | The demo rendered, and the gallery's file that builds it. The gallery compiles that file, so it is never out of date. |
| Properties | The builder methods: each one's arguments as written, and what it changes. |
| Behaviour | The type's own documentation: layout, events, what screen readers are told, platform differences. |
| See also | The family's neighbouring widgets, the guide's page, and the API reference. |
| Source | A permalink to the file the page was written from, at the pinned revision. |

- **Every style can be overridden.** A widget takes its colours, type and shape from the theme,
  never from a constant. Restyle one instance with its builder methods, or every widget of a
  kind through the theme.
- **Interactive widgets are controlled.** A checkbox, a slider or a text field shows the value
  you give it, and tells you when the user changes it. The state stays yours.
`;
}
