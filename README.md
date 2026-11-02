# frus-website

The frus website: a home page, the documentation, the widget catalog and the blog, built with
[Docusaurus](https://docusaurus.io/). This repository is private; frus itself is
<https://github.com/KalybosPro/frus>.

```sh
npm install
npm start          # http://localhost:3000, reloads on change
npm run build      # the static site, in build/
```

## Where the pages come from

The documentation is written once, in the frus repository, where GitHub shows it and frus's
test suite compiles its examples. `npm start` and `npm run build` first run
`scripts/sync-docs.mjs`, which copies these files into `docs/` and points every link that
leaves them at GitHub:

| frus repository | Site |
| --- | --- |
| `docs/getting-started.md` | `/docs/getting-started` |
| `docs/guide/*.md` | `/docs/guide/...` |
| `docs/app-structure.md` | `/docs/app-structure` |
| `crates/frus-cli/README.md` | `/docs/tooling/cli` |
| `ARCHITECTURE.md`, `CONTRIBUTING.md` | `/docs/internals/...` |
| `docs/media/*` (home page pictures) | `/media/...` |

The script finds frus at `FRUS_REPO` if set, else in a `../frus` checkout beside this one,
else it clones the public repository into `.frus/` (`FRUS_UPDATE=1` pulls that clone first).
A checkout's working tree is read as it is, uncommitted edits included.

**Edit the originals, not the copies:** `docs/` here is ignored by git, except `docs/intro.md`,
which belongs to the site. A new page needs an entry in the script and in `sidebars.ts`. The
copied pages' "Edit this page" links open the original in the frus repository.

The rest is the site's own:

- `src/pages/index.tsx`: the home page.
- `src/pages/widgets.tsx`: the widget catalog. It mirrors frus's
  `frus-examples/widgets/src/common/catalog.rs` by hand, so keep the two in step.
- `blog/`: the posts.
- `src/css/custom.css`: the palette, taken from the frus mark.

Search is built at build time by `@easyops-cn/docusaurus-search-local`: no account and no
outside service.

webpack is pinned to 5.99.9 (`overrides` in `package.json`), because 5.112 rejects
webpackbar's options under Docusaurus 3.9.

## Deployment

Not wired yet. `SITE_URL` and `BASE_URL` set where the site is served (defaults:
`https://frus.dev`, a placeholder, and `/`):

```sh
SITE_URL=https://example.org BASE_URL=/ npm run build
```

CI (`.github/workflows/build.yml`) builds the site on every push and pull request, against
frus's `master`. It does not publish the site.
