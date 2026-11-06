import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js: no browser APIs or JSX here.

const repo = 'https://github.com/frus-rs/frus';
const baseUrl = process.env.BASE_URL ?? '/';

// The site is built once per language; this is the one being built.
const locale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'en';
const fr = locale === 'fr';
// Where a page of this language starts: `/` in English, `/fr/` in French.
const localeBase = fr ? `${baseUrl}fr/` : baseUrl;

const config: Config = {
  title: 'frus',
  tagline: fr ? 'Un seul code Rust. Tous les écrans.' : 'One Rust codebase. Every screen.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Where the site is served. Set by the deployment; the defaults suit a domain of its own.
  url: process.env.SITE_URL ?? 'https://frus.dev',
  baseUrl,

  organizationName: 'KalybosPro',
  projectName: 'frus',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en'},
      fr: {label: 'Français', htmlLang: 'fr'},
    },
  },

  markdown: {
    // The repository's `.md` pages are CommonMark, written for GitHub; only `.mdx` is MDX.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
  ],

  themes: [
    [
      // Search built into the site at build time: no account, no outside service.
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'fr'],
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: ['/docs', '/widgets'],
        docsPluginIdForPreferredVersion: 'default',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  plugins: [
    [
      // The widget catalog: one page per widget, written by scripts/gen-widgets.mjs.
      '@docusaurus/plugin-content-docs',
      {
        id: 'widgets',
        path: 'widgets',
        routeBasePath: 'widgets',
        sidebarPath: './sidebars-widgets.ts',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: false,
        },
        blog: {
          showReadingTime: true,
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'pre-alpha',
      content: fr
        ? `frus est en pré-alpha : l'API change d'une version à l'autre. <a href="${localeBase}docs/getting-started">Essayez-le</a> et dites-nous ce qui casse.`
        : `frus is pre-alpha: the API changes between releases. <a href="${localeBase}docs/getting-started">Try it</a> and tell us what breaks.`,
      backgroundColor: '#1a120b',
      textColor: '#ffd2a8',
      isCloseable: true,
    },
    navbar: {
      title: 'frus',
      logo: {
        alt: 'frus',
        src: 'img/mark.png',
      },
      items: [
        {
          type: 'html',
          position: 'left',
          value: `<span class="badge badge--prealpha">${fr ? 'pré-alpha' : 'pre-alpha'}</span>`,
        },
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
        {to: '/docs/guide', label: 'Guide', position: 'left'},
        {to: '/widgets', label: 'Widgets', position: 'left'},
        {to: '/playground', label: 'Playground', position: 'left'},
        {to: '/examples', label: 'Examples', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {href: 'https://docs.rs/frus', label: 'API', position: 'right', className: 'navbar-api'},
        {type: 'localeDropdown', position: 'right'},
        // GitHub's mark, not its name: the bar is full at a laptop's width (src/css/custom.css).
        {href: repo, position: 'right', className: 'navbar-github', 'aria-label': 'GitHub'},
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'frus',
        src: 'img/mark.png',
        width: 40,
        height: 40,
      },
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Get started', to: '/docs/getting-started'},
            {label: 'The guide', to: '/docs/guide'},
            {label: 'Widget gallery', href: 'https://frus-rs.github.io/frus/'},
            {label: 'Example applications', to: '/examples'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'The frus command', to: '/docs/tooling/cli'},
            {label: 'VS Code extension', to: '/docs/tooling/vscode'},
            {label: 'Architecture', to: '/docs/internals/architecture'},
            {label: 'API reference', href: 'https://docs.rs/frus'},
            {label: 'crates.io', href: 'https://crates.io/crates/frus'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: repo},
            {label: 'Issues', href: `${repo}/issues`},
            {label: 'Discussions', href: `${repo}/discussions`},
            {label: 'Roadmap', href: `${repo}/blob/master/ROADMAP.md`},
            {label: 'Blog', to: '/blog'},
          ],
        },
      ],
      copyright: `frus contributors, MIT OR Apache-2.0`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['rust', 'toml', 'bash', 'powershell'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
