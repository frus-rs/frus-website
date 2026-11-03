# frus-website

The frus website: a home page, the documentation, the widget catalog and the blog, built with
[Docusaurus](https://docusaurus.io/). This repository is private; frus itself is
<https://github.com/frus-rs/frus>.

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

## The widget catalog

`widgets/` holds one page per demo of frus's widget gallery, with Purpose, Signature, Example,
Properties, Behaviour, See also and Source. Each page is written from the source at a pinned
frus revision, and the pages are committed. To bring them to a newer frus, from a `../frus`
checkout that sits on the commit you want (pushed, since the Source links point at it):

```sh
# 1. The gallery's catalog, and a PNG of every demo (needs a GPU).
cargo run --release --manifest-path tools/widget-shots/Cargo.toml -- static/preview tools/widget-shots/catalog.json

# 2. rustdoc JSON for the three crates whose types the pages name.
cd ../frus
for c in frus-widgets frus-core frus-shell; do
  cargo +nightly rustdoc -p $c --all-features -- -Z unstable-options --output-format json
done
cd -

# 3. The pages.
RUSTDOC_JSON=../frus/target/doc node scripts/gen-widgets.mjs
```

The generator drops every doc-comment sentence that speaks of where a design comes from
(`reference`, `.dart`, ...). Public pages describe what a widget does, not its pedigree. A demo
whose name matches no single type, such as `hooks`, gets a page without Signature or
Properties.

## The playground

`/playground` lets a visitor write frus code and see it rendered as they type, with no compiler
and no server. `playground/` is a frus application, built for the browser, that parses the source
with `syn` and interprets a subset of Rust against a table of real widgets (`src/widgets.rs`).
`static/playground-app/index.html` hosts it in a frame, and `src/pages/playground.tsx` is the
page around it.

```sh
npm run build:playground    # needs ../frus, the wasm32 target and wasm-bindgen 0.2.129
cargo test --manifest-path playground/Cargo.toml
```

The wasm in `static/playground-app/pkg` is not committed, so a deployment must build it; CI does
not. The tests compile each example in `playground/examples-src` with rustc and run the same file
through the interpreter, so an example always works in a real project too.

The editor is CodeMirror. It completes from `src/data/playground-api.json`, which the interpreter's
own table writes, so it never offers what the preview would refuse. A new widget or method is one
line in `playground/src/widgets.rs`, and then:

```sh
cd playground && cargo run --example dump_api > api.json && cd ..
RUSTDOC_JSON=../frus/target/doc node scripts/gen-playground-api.mjs   # adds each one's doc comment
```

A test fails if `api.json` is out of step with the table.


## The rest

The rest is the site's own:

- `src/pages/index.tsx`: the home page.
- `blog/`: the posts.
- `src/css/custom.css`: the palette, taken from the frus mark.

Search is built at build time by `@easyops-cn/docusaurus-search-local`: no account and no
outside service.

Docusaurus builds with `@docusaurus/faster`, which `future.v4` requires since 3.10.

## Deployment

Not wired yet. `SITE_URL` and `BASE_URL` set where the site is served (defaults:
`https://frus.dev`, a placeholder, and `/`):

```sh
SITE_URL=https://example.org BASE_URL=/ npm run build
```

CI (`.github/workflows/build.yml`) builds the site on every push and pull request, against
frus's `master`. It does not publish the site.
