import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import styles from './playground.module.css';

const examples = [
  {id: 'counter', label: 'Counter'},
  {id: 'profile', label: 'Profile card'},
  {id: 'form', label: 'Form'},
  {id: 'list', label: 'A list from a loop'},
];

type Failure = {line: number; column: number; message: string};
type Status =
  | {kind: 'loading'}
  | {kind: 'ok'; ms: number}
  | {kind: 'error'; failure: Failure}
  | {kind: 'crashed'; message: string}
  | {kind: 'unsupported'; message: string};

const DEBOUNCE_MS = 120;

export default function Playground(): ReactNode {
  const frame = useRef<HTMLIFrameElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const lastGood = useRef('');
  const sentId = useRef(0);
  const sent = useRef(new Map<number, string>());
  const crashed = useRef(false);
  const [code, setCode] = useState('');
  const [example, setExample] = useState(examples[0].id);
  const [status, setStatus] = useState<Status>({kind: 'loading'});
  const [frameKey, setFrameKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const examplesBase = useBaseUrl('/playground-app/examples/');
  const preview = useBaseUrl('/playground-app/');

  const send = useCallback((source: string) => {
    const target = frame.current?.contentWindow;
    if (!ready.current || !target) return;
    const id = ++sentId.current;
    sent.current.set(id, source);
    target.postMessage({type: 'source', id, code: source}, location.origin);
  }, []);

  const load = useCallback(
    async (id: string) => {
      const response = await fetch(`${examplesBase}${id}.rs`);
      setCode((await response.text()).replace(/\r\n/g, '\n'));
    },
    [examplesBase],
  );

  useEffect(() => {
    load(examples[0].id).catch(() => undefined);
  }, [load]);

  // Every edit, once the typing pauses.
  const latest = useRef(code);
  latest.current = code;
  useEffect(() => {
    if (!code) return undefined;
    const timer = setTimeout(() => {
      crashed.current = false;
      send(code);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code, send]);

  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      switch (data?.type) {
        case 'ready':
          if (ready.current) break;
          ready.current = true;
          // After a crash, come back on the last code that worked, not on the one that crashed.
          send(crashed.current ? lastGood.current : latest.current);
          break;
        case 'result': {
          const source = sent.current.get(data.id);
          sent.current.delete(data.id);
          if (data.error) {
            setStatus({kind: 'error', failure: data.error});
          } else {
            if (source !== undefined) lastGood.current = source;
            if (!crashed.current) setStatus({kind: 'ok', ms: data.ms});
          }
          break;
        }
        case 'late-error':
          setStatus({kind: 'error', failure: data.error});
          break;
        case 'crashed':
          crashed.current = true;
          ready.current = false;
          setStatus({kind: 'crashed', message: data.message});
          setFrameKey((k) => k + 1);
          break;
        case 'unsupported':
          setStatus({kind: 'unsupported', message: data.message});
          break;
        default:
      }
    };
    addEventListener('message', listen);
    // The frame may have spoken before this page was listening: ask it again.
    frame.current?.contentWindow?.postMessage({type: 'hello'}, location.origin);
    return () => removeEventListener('message', listen);
  }, [send]);

  const lines = code.split('\n').length;
  const failure = status.kind === 'error' ? status.failure : null;

  const goToFailure = () => {
    const area = editor.current;
    if (!area || !failure) return;
    const before = code.split('\n').slice(0, failure.line - 1).join('\n').length;
    const at = (failure.line > 1 ? before + 1 : 0) + failure.column;
    area.focus();
    area.setSelectionRange(at, at);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab' || event.shiftKey) return;
    event.preventDefault();
    const area = event.currentTarget;
    const {selectionStart: start, selectionEnd: end} = area;
    setCode(`${code.slice(0, start)}    ${code.slice(end)}`);
    requestAnimationFrame(() => area.setSelectionRange(start + 4, start + 4));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`${code}\nfrus::main!(frus::FrusApp::from_fn(app));\n`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Layout
      title="Playground"
      description="Write frus code in your browser, and see it rendered as you type."
      noFooter>
      <main className={styles.page}>
        <div className={styles.toolbar}>
          <h1 className={styles.title}>Playground</h1>
          <label className={styles.picker}>
            <span>Example</span>
            <select
              value={example}
              onChange={(event) => {
                setExample(event.target.value);
                load(event.target.value).catch(() => undefined);
              }}>
              {examples.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="button button--secondary button--sm" onClick={copy}>
            {copied ? 'Copied' : 'Copy as a project’s src/lib.rs'}
          </button>
          <span className={styles.status} role="status">
            {status.kind === 'loading' && 'Loading frus…'}
            {status.kind === 'ok' && `Rendered in ${Math.round(status.ms)} ms`}
            {status.kind === 'error' && 'Showing the last version that worked'}
            {status.kind === 'crashed' && 'Restarted'}
          </span>
        </div>

        <div className={styles.panes}>
          <div className={styles.left}>
            <div className={styles.editor}>
              <div className={styles.gutter} ref={gutter} aria-hidden>
                {Array.from({length: lines}, (_, i) => (
                  <div key={i} className={clsx(failure?.line === i + 1 && styles.gutterError)}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                ref={editor}
                className={styles.code}
                value={code}
                aria-label="Rust code"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={onKeyDown}
                onScroll={(event) => {
                  if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop;
                }}
              />
            </div>
            {failure && (
              <button type="button" className={styles.error} onClick={goToFailure}>
                <strong>Line {failure.line}.</strong> {failure.message}
              </button>
            )}
            {status.kind === 'crashed' && (
              <div className={styles.error}>
                <strong>This code stopped the preview,</strong> which started again on the last version
                that worked. {status.message}
              </div>
            )}
          </div>
          <div className={styles.right}>
            <iframe
              key={frameKey}
              ref={frame}
              className={styles.frame}
              src={preview}
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        <details className={styles.help}>
          <summary>What the playground understands</summary>
          <p>
            A subset of Rust, interpreted in your browser with no compiler: one function, usually{' '}
            <code>fn app(cx: &amp;BuildContext) -&gt; Box&lt;dyn Widget&gt;</code>, with <code>let</code>,{' '}
            <code>if</code>, <code>for</code>, <code>while</code>, arithmetic, <code>format!</code>,
            closures, <code>cx.use_state</code> and <code>cx.theme()</code>. The examples also compile as ordinary Rust. Code without its own{' '}
            <code>Scaffold</code> is shown centred on the theme’s surface; in a real project, write them yourself. Structs,
            traits, crates and the other hooks are not supported yet.
          </p>
          <p>
            <strong>Widgets:</strong> Text, Row, Column, Wrap, Container, Padding, Center, SizedBox, Spacer,
            Expanded, Stack, Card, Divider, Button, IconButton, Icon, Checkbox, Switch, Slider, TextField,
            Chip, CircleAvatar, ListTile, LinearProgressIndicator, CircularProgressIndicator, Scaffold and
            AppBar, with their most common methods. An unknown method’s error lists the ones available.
          </p>
        </details>
      </main>
    </Layout>
  );
}
