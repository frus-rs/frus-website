import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

// Written by scripts/package-examples.mjs, with the archives in static/downloads/examples/.
import data from '@site/src/data/examples.json';

import styles from './examples.module.css';

const repo = 'https://github.com/frus-rs/frus';

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
  const archive = useBaseUrl(`/downloads/examples/${name}.zip`);
  return (
    <li className={styles.card}>
      <Heading as="h2" className={styles.name}>
        <code>{name}</code>
      </Heading>
      <p className={styles.teaches}>
        <Inline text={teaches.replace(/^(\**)(\w)/, (_, mark, first) => mark + first.toUpperCase())} />
      </p>
      <div className={styles.actions}>
        <a className="button button--primary button--sm" href={archive} download>
          Download .zip
        </a>
        <Link className={styles.source} href={`${repo}/tree/${data.tag}/frus-examples/${name}`}>
          Browse the source
        </Link>
        <span className={styles.meta}>
          {files} files · {size(bytes)}
        </span>
      </div>
    </li>
  );
}

export default function Examples(): ReactNode {
  return (
    <Layout title="Examples" description="Complete frus applications to download, run and copy from.">
      <main className="container margin-vert--lg">
        <header className={styles.header}>
          <Heading as="h1">Example applications</Heading>
          <p>
            Complete projects from frus {data.version}, each a standalone Cargo project that depends on
            the published crate. Read them in this order.
          </p>
        </header>

        <ol className={styles.list}>
          {data.examples.map((example) => (
            <Example key={example.name} {...example} />
          ))}
        </ol>

        <section className={styles.run}>
          <Heading as="h2">Running one</Heading>
          <p>Unzip it, then from its folder:</p>
          <CodeBlock language="sh">
            {[
              'cargo run                 # on the desktop: Windows, macOS, Linux',
              'cargo test                # its tests, without a window',
              'frus run -d web           # in the browser, with the frus command',
              'frus run -d android       # on the connected phone',
            ].join('\n')}
          </CodeBlock>
          <p>
            Every project is laid out the same way, described in{' '}
            <Link to="/docs/app-structure">App structure</Link>. The <code>frus</code> command is
            covered in <Link to="/docs/tooling/cli">The frus command</Link>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
