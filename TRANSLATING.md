# Translating the site

The site is written in English and built once per language. Each language lives under
`i18n/<locale>/`, and the language switcher in the navigation bar lists every one of them.
French (`fr`) is the first. A page nobody has translated yet is shown in English, so a
translation can grow one page at a time.

## What there is to translate

| What | Where the translation goes |
| --- | --- |
| The words of the home, Examples and Playground pages | `i18n/<locale>/code.json` |
| The navigation bar and the footer | `i18n/<locale>/docusaurus-theme-classic/` |
| The documentation's sidebar | `i18n/<locale>/docusaurus-plugin-content-docs/current.json` |
| A documentation page | `i18n/<locale>/docusaurus-plugin-content-docs/current/<the page's path>` |
| A widget catalog page | `i18n/<locale>/docusaurus-plugin-content-docs-widgets/current/<the page's path>` |
| A blog post | `i18n/<locale>/docusaurus-plugin-content-blog/<the post's file name>` |

The documentation pages are copied from the [frus repository](https://github.com/frus-rs/frus)
when the site is built, into `docs/` (run `npm run sync` to get them). A page's path under
`docs/` is its path in the translation: `docs/guide/layout.md` is translated in
`i18n/fr/docusaurus-plugin-content-docs/current/guide/layout.md`.

## How to translate a page

1. Say which page you are taking in the [translation issue](https://github.com/frus-rs/frus-website/issues/2),
   so that two people do not translate the same one.
2. Run `npm run sync`, and copy the English page from `docs/` to its place under `i18n/<locale>/`.
3. Translate the prose. Leave as they are:
   - the code blocks, and the names in backticks (`Scaffold`, `frus run`, `use_state`);
   - the links' targets, so `[the guide](guide/README.md)` keeps `guide/README.md`;
   - the headings' meaning: a link to `#the-tray` from another page follows the English
     heading, so translate the heading and add the English anchor after it:
     `## La zone de notification {#the-tray}`.
4. Look at it: `npm run start -- --locale fr` serves the site in that language.
5. Open a pull request with one page, or a few. A reviewer reads it for meaning and for the
   terms below.

## Style

- Write as the English does: short sentences, the reader addressed directly, no marketing.
- No em dashes. The build stops on one (`npm run check:dashes`). Use a colon, a comma or
  parentheses.
- In French, use the formal *vous*, and the terms already in use on the site: *widget*,
  *thème*, *mise en page*, *rechargement à chaud*, *bac à sable* (the Playground), *l'état*
  (state), *crate*.

## When the English page changes

A translated page does not follow its English page by itself. When a page in frus changes a
lot, its translation is out of date until someone updates it: the translation issue lists the
pages and who looks after each.
