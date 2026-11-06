# Contributing to the frus website

Thanks for looking. This repository is the site at <https://frus.dev>: the home page, the
documentation, the widget catalog, the playground, the examples and the blog. frus itself, the
framework, is <https://github.com/frus-rs/frus>.

Questions and ideas are welcome in English or in French.

## Where a change belongs

Most of the site's text is not written here. Find where it comes from first:

| You want to change | Where |
| --- | --- |
| A documentation page (getting started, the guide, the `frus` command, architecture) | The [frus repository](https://github.com/frus-rs/frus), under `docs/`, or the file the page's "Edit this page" link opens. The site copies it at build time. |
| A widget catalog page's description | The widget's doc comment, in frus. The pages in `widgets/` are generated. |
| A translation | Here: see [TRANSLATING.md](TRANSLATING.md). |
| The home, Examples or Playground page, the navigation, the footer, the look | Here: `src/pages/`, `docusaurus.config.ts`, `src/css/custom.css`. |
| The introduction to the documentation (`/docs`) | Here: `docs/intro.md`, and `i18n/fr/.../intro.md` in French. |
| The playground (what it understands, its examples) | Here: `playground/`. See the README. |
| A blog post | Here: `blog/`. |
| A bug in frus, or something frus should do | [frus's issues](https://github.com/frus-rs/frus/issues). |

A typo in a documentation page is a pull request to frus, not here: a fix here would be
overwritten at the next build.

## Setting up

You need Node 20 or newer and Git. Rust is needed only for the playground and the picture tools.

```sh
git clone https://github.com/frus-rs/frus-website.git
cd frus-website
npm ci
npm start          # http://localhost:3000, in English, reloads on change
npm run start:fr   # the same, in French
```

The first `npm start` copies frus's documentation into `docs/`. It reads a frus checkout beside
this one (`../frus`) if there is one, so you can see a change to frus's docs before it is
merged; otherwise it clones frus into `.frus/`. The README says more.

`npm start` serves one language, so its language menu leads to "Page Not Found". To try the
menu, `npm run build` then `npm run serve`.

## Before you open a pull request

```sh
npm run build        # both languages; fails on a broken link or an em dash
npm run typecheck    # after the build, which writes src/data/examples.json
```

For the playground, also `cargo test --manifest-path playground/Cargo.toml` (see the README).

CI runs the build and the type check on every pull request.

In the pull request, say what changed and why, and add a screenshot for anything you can see:
before and after, at a phone's width too if the layout moved.

## Writing for the site

- **English** in the code, comments, commit messages and English pages. French goes in
  `i18n/fr/`.
- **Plain and direct.** Short sentences, the reader addressed as "you", no marketing words. Say
  what something does, and how to do it.
- **No em dashes.** The build stops on one. Use a colon, a comma or parentheses.
- **Describe what frus does, not where its design comes from.** Pages do not compare frus with
  other frameworks by name.
- **Every visible string is translatable.** In a page, wrap it in `translate()` or
  `<Translate>`, give it an id (`home.section.what`), and add its French to
  `i18n/fr/code.json`. If you do not write French, say so in the pull request and someone will.
- **Pictures stay small.** Many readers are on slow connections: prefer WebP, sized for how
  large it is shown.

## Commits

One concern per pull request. Commit messages in English: a short first line that says what
changed (`Examples: a picture of each application`), then why, if it is not obvious.

## Licence

By contributing, you agree that your contribution is dual-licensed under MIT or Apache-2.0,
like the rest of the site (see [NOTICE](NOTICE)).

## Conduct

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).
