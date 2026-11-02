// Autocompletion for the playground's editor. What exists comes from `api.json`, which the
// interpreter's own table writes, so the editor never offers what the preview would refuse.

import {snippetCompletion, type Completion, type CompletionContext, type CompletionResult} from '@codemirror/autocomplete';

import api from '@site/src/data/playground-api.json';

type Member = {name: string; args: string[]; returns?: string; doc?: string};
type Api = {
  types: Record<string, {constructors: Member[]; methods: Member[]}>;
  functions: Member[];
  macros: Member[];
  constants: Record<string, string[]>;
};

const table = api as unknown as Api;

// What the interpreter offers on values that are not widgets.
const builtins: Record<string, Member[]> = {
  BuildContext: [
    {name: 'use_state', args: ['closure'], returns: 'State', doc: 'A value kept between rebuilds.'},
    {name: 'theme', args: [], returns: 'Theme', doc: 'The colours of the current theme.'},
  ],
  State: [
    {name: 'get', args: [], doc: 'A copy of the current value.'},
    {name: 'set', args: ['value'], doc: 'Replaces the value, and rebuilds.'},
    {name: 'update', args: ['closure'], doc: 'Changes the value in place, and rebuilds.'},
    {name: 'clone', args: [], returns: 'State', doc: 'Another handle to the same value, to move into a closure.'},
  ],
};
const themeFields = ['background', 'scheme', 'surface', 'on_surface', 'primary', 'on_primary', 'secondary', 'outline'];

const isWord = (c: string | undefined) => !!c && /[A-Za-z0-9_]/.test(c);

function skipSpace(doc: string, at: number): number {
  let i = at;
  while (i >= 0 && /\s/.test(doc[i])) i--;
  return i;
}

// The opening bracket of the closing one at `at`, counting nested ones and skipping strings.
function matching(doc: string, at: number): number {
  const open: Record<string, string> = {')': '(', ']': '[', '}': '{'};
  const stack = [doc[at]];
  let i = at - 1;
  while (i >= 0) {
    const c = doc[i];
    if (c === '"') {
      i--;
      while (i >= 0 && !(doc[i] === '"' && doc[i - 1] !== '\\')) i--;
    } else if (c in open) {
      stack.push(c);
    } else if (c === '(' || c === '[' || c === '{') {
      if (open[stack[stack.length - 1]] !== c) return -1;
      stack.pop();
      if (stack.length === 0) return i;
    }
    i--;
  }
  return -1;
}

function constructorType(type: string, name: string): string | null {
  const member = table.types[type]?.constructors.find((c) => c.name === name);
  if (member) return member.returns ?? type;
  return table.constants[type] ? type : null;
}

// The type of the expression that ends at `end`, walking back along a chain of calls. A builder
// method returns its own type, so a chain's type is the type of its head.
export function typeEndingAt(doc: string, end: number, depth = 0): string | null {
  if (depth > 8) return null;
  let i = skipSpace(doc, end);
  while (i >= 0) {
    let bracket = '';
    if (doc[i] === ')' || doc[i] === ']') {
      bracket = doc[i];
      i = skipSpace(doc, matching(doc, i) - 1);
      if (i < 0) return null;
    }
    if (bracket === ']' && doc[i] === '!') {
      i--;
    } else if (bracket === ']') {
      return null;
    }
    const last = i;
    while (i >= 0 && isWord(doc[i])) i--;
    const word = doc.slice(i + 1, last + 1);
    if (!word) return null;
    if (bracket === ']') return table.macros.find((m) => m.name === word)?.returns ?? null;

    const before = skipSpace(doc, i);
    if (doc[before] === '.') {
      if (bracket === ')') {
        const receiver = typeEndingAt(doc, before - 1, depth + 1);
        const custom = receiver && builtins[receiver]?.find((m) => m.name === word);
        return custom ? custom.returns ?? null : receiver;
      }
      // A field: `theme.scheme`.
      return typeEndingAt(doc, before - 1, depth + 1) === 'Theme' && word === 'scheme' ? 'Theme' : null;
    }
    if (doc[before] === ':' && doc[before - 1] === ':') {
      let j = before - 2;
      const typeEnd = j;
      while (j >= 0 && isWord(doc[j])) j--;
      return constructorType(doc.slice(j + 1, typeEnd + 1), word);
    }
    if (bracket === ')') {
      return table.functions.find((f) => f.name === word)?.returns ?? null;
    }
    return variableType(doc, word, i, depth);
  }
  return null;
}

// A variable's type: that of what its last `let`, or the parameter of its name, gave it.
function variableType(doc: string, name: string, before: number, depth: number): string | null {
  if (new RegExp(`\\b${name}\\s*:\\s*&\\s*BuildContext`).test(doc)) return 'BuildContext';
  const pattern = new RegExp(`\\blet\\s+(?:mut\\s+)?${name}\\b[^=;]*=(?!=)`, 'g');
  let found: RegExpExecArray | null = null;
  for (let m = pattern.exec(doc); m && m.index < before; m = pattern.exec(doc)) found = m;
  if (!found) return null;
  // The end of the statement: the first `;` outside any bracket.
  let depthHere = 0;
  let i = found.index + found[0].length;
  for (; i < doc.length; i++) {
    const c = doc[i];
    if (c === '"') {
      i++;
      while (i < doc.length && !(doc[i] === '"' && doc[i - 1] !== '\\')) i++;
    } else if ('([{'.includes(c)) depthHere++;
    else if (')]}'.includes(c)) depthHere--;
    else if (c === ';' && depthHere === 0) break;
  }
  return typeEndingAt(doc, i - 1, depth + 1);
}

const label = (args: string[]) => `(${args.join(', ')})`;

function member(m: Member, type: Completion['type']): Completion {
  const info = m.doc || undefined;
  if (!m.args.length) return {label: m.name, type, detail: '()', info, apply: `${m.name}()`};
  const slots = m.args.map((arg, i) => `\${${i + 1}:${arg}}`).join(', ');
  return snippetCompletion(`${m.name}(${slots})`, {label: m.name, type, detail: label(m.args), info});
}

function locals(doc: string, before: number): Completion[] {
  const names = new Set<string>();
  for (const m of doc.slice(0, before).matchAll(/\blet\s+(?:mut\s+)?([a-z_][A-Za-z0-9_]*)/g)) names.add(m[1]);
  return [...names].map((name) => ({label: name, type: 'variable'}));
}

export function completions(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[A-Za-z0-9_]*/);
  if (!word) return null;
  const doc = context.state.doc.toString();
  const before = skipSpace(doc, word.from - 1);

  if (doc[before] === '.') {
    const type = typeEndingAt(doc, before - 1);
    if (type === 'Theme') return {from: word.from, options: themeFields.map((label) => ({label, type: 'property'}))};
    const methods = type ? builtins[type] ?? table.types[type]?.methods : undefined;
    if (methods) return {from: word.from, options: methods.map((m) => member(m, 'method')), validFor: /^\w*$/};
    // A type this cannot work out: every method there is, rather than nothing.
    const all = new Map<string, Completion>();
    for (const t of Object.values(table.types)) for (const m of t.methods) all.set(m.name, member(m, 'method'));
    return {from: word.from, options: [...all.values()], validFor: /^\w*$/};
  }

  if (doc[before] === ':' && doc[before - 1] === ':') {
    let j = before - 2;
    const end = j;
    while (j >= 0 && isWord(doc[j])) j--;
    const owner = doc.slice(j + 1, end + 1);
    const options: Completion[] = [
      ...(table.types[owner]?.constructors ?? []).map((c) => member(c, 'function')),
      ...(table.constants[owner] ?? []).map((name) => ({label: name, type: 'constant'})),
    ];
    return options.length ? {from: word.from, options, validFor: /^\w*$/} : null;
  }

  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    validFor: /^\w*$/,
    options: [
      ...Object.keys(table.types).map((name) => ({label: name, type: 'class'})),
      ...Object.keys(table.constants).map((name) => ({label: name, type: 'namespace'})),
      ...table.functions.map((f) => member(f, 'function')),
      ...table.macros.map((m) => ({label: `${m.name}!`, type: 'keyword', detail: '[..]', apply: `${m.name}![]`})),
      ...locals(doc, word.from),
    ],
  };
}
