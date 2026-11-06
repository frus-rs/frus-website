import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, {translate} from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import type {EditorHandle, Failure} from '@site/src/components/Playground/Editor';

import api from '@site/src/data/playground-api.json';

import styles from './playground.module.css';

const examples = [
  {id: 'counter', label: translate({id: 'playground.example.counter', message: 'Counter'})},
  {id: 'profile', label: translate({id: 'playground.example.profile', message: 'Profile card'})},
  {id: 'form', label: translate({id: 'playground.example.form', message: 'Form'})},
  {id: 'list', label: translate({id: 'playground.example.list', message: 'A list from a loop'})},
  {id: 'shop', label: translate({id: 'playground.example.shop', message: 'Shop: grid, tabs and navigation'})},
];

type Status =
  | {kind: 'loading'}
  | {kind: 'ok'; ms: number}
  | {kind: 'error'; failure: Failure}
  | {kind: 'crashed'; message: string}
  | {kind: 'unsupported'; message: string};

const DEBOUNCE_MS = 120;
const widgetNames = Object.keys(api.types).filter((name) => !['Color', 'Insets', 'BottomNavigationBarItem'].includes(name));

export default function Playground(): ReactNode {
  const frame = useRef<HTMLIFrameElement>(null);
  const editor = useRef<EditorHandle>(null);
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

  const failure = status.kind === 'error' ? status.failure : null;

  const copy = async () => {
    await navigator.clipboard.writeText(`${code}\nfrus::main!(frus::FrusApp::from_fn(app));\n`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Layout
      title={translate({id: 'playground.meta.title', message: 'Playground'})}
      description={translate({
        id: 'playground.meta.description',
        message: 'Write frus code in your browser, and see it rendered as you type.',
      })}
      noFooter>
      <main className={styles.page}>
        <div className={styles.toolbar}>
          <h1 className={styles.title}>
            <Translate id="playground.title">Playground</Translate>
          </h1>
          <label className={styles.picker}>
            <span>
              <Translate id="playground.picker">Example</Translate>
            </span>
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
            {copied
              ? translate({id: 'playground.copied', message: 'Copied'})
              : translate({id: 'playground.copy', message: 'Copy as a project’s src/lib.rs'})}
          </button>
          <span className={styles.status} role="status">
            {status.kind === 'loading' && translate({id: 'playground.status.loading', message: 'Loading frus…'})}
            {status.kind === 'ok' &&
              translate({id: 'playground.status.ok', message: 'Rendered in {ms} ms'}, {ms: Math.round(status.ms)})}
            {status.kind === 'error' &&
              translate({id: 'playground.status.error', message: 'Showing the last version that worked'})}
            {status.kind === 'crashed' && translate({id: 'playground.status.crashed', message: 'Restarted'})}
            {status.kind === 'unsupported' &&
              translate({id: 'playground.status.unsupported', message: 'No preview in this browser'})}
          </span>
        </div>

        <div className={styles.panes}>
          <div className={styles.left}>
            <div className={styles.editor}>
              <BrowserOnly>
                {() => {
                  // CodeMirror reads the page as it loads, so it only exists in the browser.
                  const Editor = require('@site/src/components/Playground/Editor').default;
                  return <Editor ref={editor} value={code} failure={failure} onChange={setCode} />;
                }}
              </BrowserOnly>
            </div>
            {failure && (
              <button type="button" className={styles.error} onClick={() => editor.current?.goTo(failure)}>
                <strong>
                  <Translate id="playground.error.line" values={{line: failure.line}}>
                    {'Line {line}.'}
                  </Translate>
                </strong>{' '}
                {failure.message}
              </button>
            )}
            {status.kind === 'crashed' && (
              <div className={styles.error}>
                <Translate
                  id="playground.crashed"
                  values={{
                    stopped: (
                      <strong>
                        <Translate id="playground.crashed.stopped">This code stopped the preview,</Translate>
                      </strong>
                    ),
                  }}>
                  {'{stopped} which started again on the last version that worked.'}
                </Translate>{' '}
                {status.message}
              </div>
            )}
          </div>
          <div className={styles.right}>
            <iframe
              key={frameKey}
              ref={frame}
              className={styles.frame}
              src={preview}
              title={translate({id: 'playground.preview', message: 'Preview'})}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        <details className={styles.help}>
          <summary>
            <Translate id="playground.help.title">What the playground understands</Translate>
          </summary>
          <p>
            <Translate
              id="playground.help.subset"
              values={{
                signature: <code>fn app(cx: &amp;BuildContext) -&gt; Box&lt;dyn Widget&gt;</code>,
                syntax: (
                  <>
                    <code>let</code>, <code>if</code>, <code>for</code>, <code>while</code>
                  </>
                ),
                format: <code>format!</code>,
                useState: <code>cx.use_state</code>,
                theme: <code>cx.theme()</code>,
                scaffold: <code>Scaffold</code>,
              }}>
              {'A subset of Rust, interpreted in your browser with no compiler: one function, usually {signature}, with {syntax}, arithmetic, {format}, closures, {useState} and {theme}. The examples also compile as ordinary Rust. Code without its own {scaffold} is centred on the theme’s surface while it fits, and scrolls when it does not; in a real project, write that yourself, as the examples do. Structs, traits, crates and the other hooks are not supported yet.'}
            </Translate>
          </p>
          <p>
            <Translate
              id="playground.help.widgets"
              values={{
                widgets: (
                  <strong>
                    <Translate id="playground.help.widgets.label">Widgets:</Translate>
                  </strong>
                ),
                names: widgetNames.join(', '),
              }}>
              {'{widgets} {names}, with their most common methods. The editor completes from the same list (Ctrl+Space, or after a dot), and an unknown method’s error names the ones available.'}
            </Translate>
          </p>
        </details>
      </main>
    </Layout>
  );
}
