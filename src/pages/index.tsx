import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const repo = 'https://github.com/frus-rs/frus';
const gallery = 'https://frus-rs.github.io/frus/';

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden />
      <div className="container">
        <img className={styles.heroLogo} src={useBaseUrl('/img/logo.png')} alt="" width={176} height={176} />
        <Heading as="h1" className={styles.heroTitle}>
          <Translate id="home.hero.title1">One Rust codebase.</Translate>
          <br />
          <span className="frus-gradient-text">
            <Translate id="home.hero.title2">Every screen.</Translate>
          </span>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="home.hero.subtitle">
            frus is a UI framework written entirely in Rust. Build an application from components,
            and run it on Windows, Linux, macOS, Android and the web, drawn on the GPU by frus itself.
          </Translate>
        </p>
        <div className={styles.heroButtons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            <Translate id="home.hero.start">Get started</Translate>
          </Link>
          <Link className="button button--secondary button--outline button--lg" href={gallery}>
            <Translate id="home.hero.gallery">Widget gallery</Translate>
          </Link>
        </div>
        <code className={styles.install}>cargo install frus-cli</code>
      </div>
    </header>
  );
}

const c = (name: string) => <code>{name}</code>;

const features: {title: string; body: ReactNode}[] = [
  {
    title: translate({id: 'home.features.components.title', message: 'Components and hooks'}),
    body: (
      <Translate
        id="home.features.components.body"
        values={{
          statefulWidget: c('StatefulWidget'),
          useState: c('use_state'),
          useMemo: c('use_memo'),
          useEffect: c('use_effect'),
        }}>
        {'A widget is what it builds. Keep state with a {statefulWidget}, or in a plain function with {useState}, {useMemo} and {useEffect}.'}
      </Translate>
    ),
  },
  {
    title: translate({id: 'home.features.rust.title', message: 'Rust from the app to the pixels'}),
    body: (
      <Translate id="home.features.rust.body">
        Layout, text, widgets, gestures, theming and the renderer are all Rust. No VM, no second
        language, no bridge in the hot path.
      </Translate>
    ),
  },
  {
    title: translate({id: 'home.features.gpu.title', message: 'GPU rendering on wgpu'}),
    body: (
      <Translate id="home.features.gpu.body">
        Vulkan, Metal, DX12, OpenGL ES and WebGPU from one backend. Paths are tessellated with
        lyon, and text is shaped by cosmic-text.
      </Translate>
    ),
  },
  {
    title: translate({id: 'home.features.platforms.title', message: 'Desktop, Android and web'}),
    body: (
      <Translate id="home.features.platforms.body" values={{main: c('frus::main!')}}>
        {'One {main} wires every entry point. Screen readers, IME, insets and notifications work on each platform.'}
      </Translate>
    ),
  },
  {
    title: translate({id: 'home.features.restyle.title', message: 'Every widget restyles'}),
    body: (
      <Translate id="home.features.restyle.body">
        Light and dark themes are generated from a seed colour. Every widget takes its colours
        from the theme, so you can restyle one widget, or every widget of a kind.
      </Translate>
    ),
  },
  {
    title: translate({id: 'home.features.command.title', message: 'A command for the whole loop'}),
    body: (
      <Translate
        id="home.features.command.body"
        values={{
          create: c('frus create'),
          run: c('run'),
          build: c('build'),
          test: c('test'),
          doctor: c('doctor'),
        }}>
        {'{create}, {run}, {build}, {test} and {doctor}, with hot reload that keeps the state. Whatever a command needs, it installs first.'}
      </Translate>
    ),
  },
];

function Features(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.featureGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.card}>
              <Heading as="h3">{f.title}</Heading>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Numbers(): ReactNode {
  const stats = [
    {value: '~2,180', label: translate({id: 'home.numbers.tests', message: 'tests in the repository, run on every change'})},
    {value: '184', label: translate({id: 'home.numbers.goldens', message: 'golden reference images, compared pixel by pixel'})},
    {value: '170+', label: translate({id: 'home.numbers.demos', message: 'widget demos, each one shown with its code'})},
    {
      value: translate({id: 'home.numbers.startup.value', message: '0.6–0.8 s'}),
      label: translate({id: 'home.numbers.startup', message: 'Windows cold start, down from 1.3–2.0 s in 0.4'}),
    },
  ];
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.numbers.title">Tested like it means it</Translate>
        </Heading>
        <p className={styles.sectionLead}>
          <Translate id="home.numbers.lead">
            Components run with no window and no GPU, so frus tests the whole lifecycle in plain
            Rust tests. Rendering is checked against reference images. Every example in the guide
            is compiled by the test suite.
          </Translate>
        </p>
        <div className={styles.statGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={clsx(styles.statValue, 'frus-gradient-text')}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
        <p className={styles.caveat}>
          <Translate id="home.numbers.caveat">
            These figures come from the repository and the changelog. frus does not publish
            side-by-side benchmarks against other toolkits yet: that comes once the numbers have
            been measured on real devices, with the method written down.
          </Translate>
        </p>
      </div>
    </section>
  );
}

const counter = `use frus::{button, column, row, text, Align, BuildContext, FrusApp, Variant, Widget};

// A widget is what it builds. One that has something to remember keeps it with a hook.
fn counter(cx: &BuildContext) -> Box<dyn Widget> {
    let count = cx.use_state(|| 0);
    let (up, down) = (count.clone(), count.clone());
    Box::new(column![
        text(format!("{}", count.get())).size(48.0),
        row![
            button("+", move || up.update(|n| *n += 1)).variant(Variant::Filled),
            button("−", move || down.update(|n| *n -= 1)).variant(Variant::Outlined),
        ].gap(20.0),
    ].gap(16.0).align(Align::Center))
}

// One declaration wires up desktop, Android and web entry points.
frus::main!(FrusApp::from_fn(counter));`;

function Counter(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.split)}>
        <div className={styles.splitText}>
          <Heading as="h2" className={styles.sectionTitle}>
            <Translate id="home.counter.title">A counter, in full</Translate>
          </Heading>
          <p>
            <Translate
              id="home.counter.body1"
              values={{useState: c('cx.use_state'), main: c('frus::main!')}}>
              {'That is a complete, runnable application. {useState} keeps the count between rebuilds, and the buttons update it. {main} declares the entry points for every platform at once.'}
            </Translate>
          </p>
          <p>
            <Translate
              id="home.counter.body2"
              values={{
                run: c('frus run'),
                android: c('frus run -d android'),
                web: c('frus run -d web'),
              }}>
              {'{run} starts it on the desktop. {android} and {web} start it on a phone and in a browser. The source stays the same.'}
            </Translate>
          </p>
          <Link to="/docs/getting-started">
            <Translate id="home.counter.link">Write your first application →</Translate>
          </Link>
        </div>
        <div className={styles.splitCode}>
          <CodeBlock language="rust" title="src/lib.rs">
            {counter}
          </CodeBlock>
        </div>
      </div>
    </section>
  );
}

function Platforms(): ReactNode {
  const targets = [
    {
      title: translate({id: 'home.platforms.desktop', message: 'Desktop'}),
      note: translate({id: 'home.platforms.desktop.note', message: 'Windows, Linux and macOS: a window from winit, drawn with wgpu.'}),
      command: 'frus run',
    },
    {
      title: 'Android',
      note: translate({id: 'home.platforms.android.note', message: 'A phone or an emulator. The first run installs the SDK, the NDK and Java.'}),
      command: 'frus run -d android',
    },
    {
      title: 'Web',
      note: translate({id: 'home.platforms.web.note', message: 'Built to wasm, served, and opened in a WebGPU browser.'}),
      command: 'frus run -d web',
    },
    {
      title: translate({id: 'home.platforms.simulated', message: 'Any phone, on any computer'}),
      note: translate({
        id: 'home.platforms.simulated.note',
        message: 'A debug build shown in a phone’s frame, with its safe areas, cutout and keyboard.',
      }),
      command: 'frus run -d iphone-15',
    },
  ];
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.platforms.title">Build for every screen</Translate>
        </Heading>
        <div className={styles.targetGrid}>
          {targets.map((t) => (
            <div key={t.command} className={styles.card}>
              <Heading as="h3">{t.title}</Heading>
              <p>{t.note}</p>
              <CodeBlock language="bash">{t.command}</CodeBlock>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HotReload(): ReactNode {
  const keys = [
    ['r', translate({id: 'home.reload.key.r', message: 'reload, keeping the state'})],
    ['R', translate({id: 'home.reload.key.R', message: 'restart afresh'})],
    ['i', translate({id: 'home.reload.key.i', message: 'the widget inspector'})],
    ['P', translate({id: 'home.reload.key.P', message: 'a performance panel with graphs'})],
    ['b', translate({id: 'home.reload.key.b', message: 'light or dark'})],
    ['T', translate({id: 'home.reload.key.T', message: 'the text size'})],
    ['o', translate({id: 'home.reload.key.o', message: 'another platform’s behaviour'})],
    ['s', translate({id: 'home.reload.key.s', message: 'a screenshot'})],
  ];
  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.split)}>
        <div className={styles.splitText}>
          <Heading as="h2" className={styles.sectionTitle}>
            <Translate id="home.reload.title">Change the code. Keep the state.</Translate>
          </Heading>
          <p>
            <Translate id="home.reload.body" values={{hot: c('frus run --hot')}}>
              {'{hot} patches each saved change into the running application, on the desktop, Android and the web. The log of every platform shows in your terminal, and single keys drive the application while it runs.'}
            </Translate>
          </p>
          <ul className={styles.keys}>
            {keys.map(([k, what]) => (
              <li key={k}>
                <kbd>{k}</kbd> {what}
              </li>
            ))}
          </ul>
          <p>
            <Translate id="home.reload.vscode">
              In VS Code, the frus extension does the same from the editor: a device picker in the
              status bar, F5 with the log in the Debug Console, reload on save with the state kept,
              and the inspector and the trees in the command palette.
            </Translate>
          </p>
          <div className={styles.links}>
            <Link className="button button--primary" href="https://marketplace.visualstudio.com/items?itemName=kalybospro.frus">
              <Translate id="home.reload.install">Install for VS Code</Translate>
            </Link>
            <Link to="/docs/tooling/vscode">
              <Translate id="home.reload.extension">The extension →</Translate>
            </Link>
            <Link to="/docs/tooling/cli">
              <Translate id="home.reload.cli">The frus command →</Translate>
            </Link>
          </div>
        </div>
        <div className={styles.splitMedia}>
          <img
            src={useBaseUrl('/media/tour.gif')}
            alt={translate({
              id: 'home.reload.tour.alt',
              message: "Four screens of the demo application, entered and left through frus's spring route transitions",
            })}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

// Screens of the example applications, rendered by tools/example-shots from the applications
// themselves: the same code a reader downloads from the Examples page.
function Showcase(): ReactNode {
  const base = useBaseUrl('/');
  const apps = [
    {
      file: 'navigation',
      example: 'navigation',
      title: translate({id: 'home.showcase.shop', message: 'A shop'}),
      alt: translate({id: 'home.showcase.shop.alt', message: 'The Corner Shop example: a grid of products under a search field, with a navigation bar'}),
    },
    {
      file: 'navigation-product',
      example: 'navigation',
      title: translate({id: 'home.showcase.product', message: 'Its product page'}),
      alt: translate({id: 'home.showcase.product.alt', message: 'A product page of the shop example, with sizes and an add-to-cart button'}),
    },
    {
      file: 'forms',
      example: 'forms',
      title: translate({id: 'home.showcase.forms', message: 'A sign-up form'}),
      alt: translate({id: 'home.showcase.forms.alt', message: 'The forms example: text fields, choices and pickers'}),
    },
    {
      file: 'authentication',
      example: 'authentication',
      title: translate({id: 'home.showcase.auth', message: 'Signing in'}),
      alt: translate({id: 'home.showcase.auth.alt', message: 'The authentication example: a sign-in screen'}),
    },
    {
      file: 'http',
      example: 'http',
      title: translate({id: 'home.showcase.http', message: 'A JSON API'}),
      alt: translate({id: 'home.showcase.http.alt', message: 'The http example: posts loaded from a web API'}),
    },
    {
      file: 'widgets',
      example: 'widgets',
      title: translate({id: 'home.showcase.gallery', message: 'The widget gallery'}),
      alt: translate({id: 'home.showcase.gallery.alt', message: 'The widget gallery example: its families of widgets'}),
    },
  ];
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.showcase.title">What it looks like</Translate>
        </Heading>
        <p className={styles.sectionLead}>
          <Translate id="home.showcase.lead">
            These are the example applications, each pictured by frus itself from the code you can
            download. Every one runs on the desktop, on Android and in the browser.
          </Translate>
        </p>
        <div className={styles.appGrid}>
          {apps.map((a) => (
            <Link key={a.file} to={`/examples#${a.example}`} className={styles.app}>
              <span className={styles.appScreen}>
                <img src={`${base}examples/${a.file}.webp`} alt={a.alt} loading="lazy" width={540} height={1169} />
              </span>
              <span className={styles.appTitle}>{a.title}</span>
            </Link>
          ))}
        </div>
        <div className={styles.phoneRow}>
          <img
            src={base + 'media/android.png'}
            alt={translate({id: 'home.showcase.android.alt', message: 'A frus application running on an Android phone'})}
            loading="lazy"
          />
          <div>
            <Heading as="h3">
              <Translate id="home.showcase.android.title">The same code on a phone</Translate>
            </Heading>
            <p>
              <Translate id="home.showcase.android.body">
                Android is a first-class target, not a port: a native activity, Vulkan, a real IME
                with composition and swipe typing, system insets, and the lifecycle. This picture
                is a photograph of a device.
              </Translate>
            </p>
            <div className={styles.links}>
              <Link to="/examples">
                <Translate id="home.showcase.examples">Download the examples →</Translate>
              </Link>
              <Link href={gallery}>
                <Translate id="home.showcase.gallery.link">Open the widget gallery in your browser →</Translate>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhereNext(): ReactNode {
  const next = [
    {
      title: translate({id: 'home.next.start', message: 'Get started'}),
      to: '/docs/getting-started',
      body: translate({id: 'home.next.start.body', message: 'Install the command, make a project, run it on three platforms.'}),
    },
    {
      title: translate({id: 'home.next.guide', message: 'The guide'}),
      to: '/docs/guide',
      body: translate({id: 'home.next.guide.body', message: 'Layout, style, input, lists, navigation, network, animation, testing.'}),
    },
    {
      title: translate({id: 'home.next.widgets', message: 'Widget catalog'}),
      to: '/widgets',
      body: translate({id: 'home.next.widgets.body', message: 'Twelve families of widgets, each demo shown with the code that builds it.'}),
    },
    {
      title: translate({id: 'home.next.architecture', message: 'Architecture'}),
      to: '/docs/internals/architecture',
      body: translate({id: 'home.next.architecture.body', message: 'Four layers, and where each kind of code belongs.'}),
    },
  ];
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.next.title">Where to next</Translate>
        </Heading>
        <div className={styles.nextGrid}>
          {next.map((n) => (
            <Link key={n.to} to={n.to} className={clsx(styles.card, styles.nextCard)}>
              <Heading as="h3">{n.title} →</Heading>
              <p>{n.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Status(): ReactNode {
  return (
    <section className={clsx(styles.section, styles.status)}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.status.title">frus is pre-alpha</Translate>
        </Heading>
        <p className={styles.sectionLead}>
          <Translate id="home.status.body">
            The core is real, and the example applications exercise it. The API is not stable,
            though, and any release may break it. Two gaps are known: there are no iOS or native
            macOS shells yet, and text rendering still has edge cases. At this stage, one pull
            request can shape a whole subsystem.
          </Translate>
        </p>
        <div className={styles.heroButtons}>
          <Link className="button button--secondary button--outline" href={`${repo}/blob/master/ROADMAP.md`}>
            <Translate id="home.status.roadmap">Read the roadmap</Translate>
          </Link>
          <Link className="button button--secondary button--outline" href={`${repo}/issues`}>
            <Translate id="home.status.issues">Open issues</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({id: 'home.meta.title', message: 'One Rust codebase. Every screen.'})}
      description={translate({
        id: 'home.meta.description',
        message:
          'frus is a cross-platform UI framework written entirely in Rust: desktop, Android and the web, GPU-rendered, built from components.',
      })}>
      <Hero />
      <main>
        <Features />
        <Numbers />
        <Counter />
        <Platforms />
        <HotReload />
        <Showcase />
        <WhereNext />
        <Status />
      </main>
    </Layout>
  );
}
