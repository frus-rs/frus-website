import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

// Written by scripts/package-examples.mjs, with the archives in static/downloads/examples/.
import data from '@site/src/data/examples.json';

import styles from './examples.module.css';

const repo = 'https://github.com/frus-rs/frus';

// The examples pictured by tools/example-shots, in static/examples/. One without a picture
// still gets its card.
const pictured = new Set([
  'hello_world',
  'counter',
  'widgets',
  'forms',
  'navigation',
  'http',
  'websocket',
  'authentication',
]);

// The descriptions come from the examples' README table: `code` and **bold** only.
function Inline({text}: {text: string}): ReactNode {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

const size = (bytes: number) =>
  bytes < 1e6 ? `${Math.round(bytes / 1e3)} KB` : `${(bytes / 1e6).toFixed(1)} MB`;

function Example({name, teaches, files, bytes}: (typeof data.examples)[number]): ReactNode {
  // The home page links to each card by its name.
  useBrokenLinks().collectAnchor(name);
  const archive = useBaseUrl(`/downloads/examples/${name}.zip`);
  const picture = useBaseUrl(`/examples/${name}.webp`);
  // The README's words, unless this language has its own (i18n/<locale>/code.json).
  const described = translate({id: `examples.teaches.${name}`, message: teaches});
  return (
    <li className={styles.card} id={name}>
      {pictured.has(name) && (
        <a className={styles.screen} href={picture} target="_blank" rel="noopener">
          <img
            src={picture}
            alt={translate(
              {id: 'examples.screen.alt', message: 'The {name} example, as it first opens'},
              {name},
            )}
            loading="lazy"
            width={540}
            height={1169}
          />
        </a>
      )}
      <div className={styles.body}>
        <Heading as="h2" className={styles.name}>
          <code>{name}</code>
        </Heading>
        <p className={styles.teaches}>
          <Inline text={described.replace(/^(\**)(\p{L})/u, (_, mark, first) => mark + first.toUpperCase())} />
        </p>
        <div className={styles.actions}>
          <a className="button button--primary button--sm" href={archive} download>
            <Translate id="examples.download">Download .zip</Translate>
          </a>
          <Link className={styles.source} href={`${repo}/tree/${data.tag}/frus-examples/${name}`}>
            <Translate id="examples.source">Browse the source</Translate>
          </Link>
          <span className={styles.meta}>
            <Translate id="examples.meta" values={{files, size: size(bytes)}}>
              {'{files} files · {size}'}
            </Translate>
          </span>
        </div>
      </div>
    </li>
  );
}

export default function Examples(): ReactNode {
  return (
    <Layout
      title={translate({id: 'examples.meta.title', message: 'Examples'})}
      description={translate({
        id: 'examples.meta.description',
        message: 'Complete frus applications to download, run and copy from.',
      })}>
      <main className="container margin-vert--lg">
        <header className={styles.header}>
          <Heading as="h1">
            <Translate id="examples.title">Example applications</Translate>
          </Heading>
          <p>
            <Translate id="examples.lead" values={{version: data.version}}>
              {'Complete projects from frus {version}, each a standalone Cargo project that depends on the published crate. Read them in this order. Each picture is the application as it first opens, drawn by frus.'}
            </Translate>
          </p>
        </header>

        <ol className={styles.list}>
          {data.examples.map((example) => (
            <Example key={example.name} {...example} />
          ))}
        </ol>

        <section className={styles.run}>
          <Heading as="h2">
            <Translate id="examples.run.title">Running one</Translate>
          </Heading>
          <p>
            <Translate
              id="examples.run.lead"
              values={{frus: <code>frus</code>, install: <code>cargo install frus-cli</code>}}>
              {'Unzip it, then from its folder (the {frus} command comes from {install}):'}
            </Translate>
          </p>
          <CodeBlock language="sh">
            {[
              `frus run                  # ${translate({id: 'examples.run.desktop', message: 'on the desktop: Windows, macOS, Linux'})}`,
              `frus run -d web           # ${translate({id: 'examples.run.web', message: 'in the browser'})}`,
              `frus run -d android       # ${translate({id: 'examples.run.android', message: 'on the connected phone, or an emulator'})}`,
              `frus test                 # ${translate({id: 'examples.run.test', message: 'its tests, without a window'})}`,
            ].join('\n')}
          </CodeBlock>
          <p>
            <Translate
              id="examples.run.structure"
              values={{
                structure: (
                  <Link to="/docs/app-structure">
                    <Translate id="examples.run.structure.link">App structure</Translate>
                  </Link>
                ),
                frus: <code>frus</code>,
                cli: (
                  <Link to="/docs/tooling/cli">
                    <Translate id="examples.run.cli.link">The frus command</Translate>
                  </Link>
                ),
              }}>
              {'Every project is laid out the same way, described in {structure}. The {frus} command is covered in {cli}.'}
            </Translate>
          </p>
        </section>
      </main>
    </Layout>
  );
}
