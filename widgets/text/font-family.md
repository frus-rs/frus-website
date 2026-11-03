---
title: "FontFamily"
sidebar_label: "FontFamily"
sidebar_position: 5
description: "Sans-serif, serif, monospace, or a font registered by name."
custom_edit_url: null
---

# `FontFamily`

## Purpose

Sans-serif, serif, monospace, or a font registered by name.

## Signature

```rust
pub enum FontFamily {
    /// The application's default sans-serif — what text gets when it says nothing.
    SansSerif,
    /// A serif face, if the platform or the application has one.
    Serif,
    /// The registered monospaced family: code, keys, anything whose columns must line up.
    Monospace,
    /// A family **by name**, as registered with `frus_text::add_font`.
    Named(&'static str),
}
```

## Example

![Rendered preview of the FontFamily demo](/preview/font-family.light.png)

From [`frus-examples/widgets/src/features/text/widgets/font_family.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/text/widgets/font_family.rs):

```rust
//! `FontFamily` — which typeface a text is set in: the default sans-serif, a serif, the
//! monospace face, or a font you registered by name.

use frus::{Align, Column, FontFamily, Text, TextStyle, Widget};

use crate::common::shared::{section, sections};

const SAMPLE: &str = "The quick brown fox jumps over the lazy dog";

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // What text gets when it says nothing.
        Box::new(section(
            "SansSerif (the default)",
            Text::new(SAMPLE).family(FontFamily::SansSerif),
        )),
        // A serif face, where the platform or the application has one; otherwise the
        // default is used.
        Box::new(section(
            "Serif",
            Text::new(SAMPLE).family(FontFamily::Serif),
        )),
        // Monospace: every character the same width, so columns line up — code, keys,
        // tables of numbers.
        Box::new(section(
            "Monospace",
            Column::new()
                .cross_axis_alignment(Align::Start)
                .spacing(2.0)
                .child(Text::new("fn main() {").family(FontFamily::Monospace))
                .child(Text::new("    println!(\"hi\");").family(FontFamily::Monospace))
                .child(Text::new("}").family(FontFamily::Monospace))
                .child(Text::new("1 111.00").family(FontFamily::Monospace))
                .child(Text::new("   42.50").family(FontFamily::Monospace)),
        )),
        // Your own font: register its bytes once at start-up with
        // `frus::fonts::add_font(include_bytes!("../res/fonts/Brand.ttf").to_vec())`, then
        // name its family. A name that matches no font falls back to the default rather
        // than showing nothing — as this one does.
        Box::new(section(
            "Named (falls back when missing)",
            Text::styled(
                SAMPLE,
                TextStyle::NONE.family(FontFamily::Named("Brand Sans")),
            ),
        )),
    ])
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

A **font family**, as a style names it.

`Copy`, and `Named` holds a `&'static str`, so that a `TextStyle` stays `Copy` and can be handed down a subtree by value like every other field. Family names come from `frus_text::add_font`, which registers them for the life of the program, so a borrowed name outliving the style is the normal case rather than a restriction.

## See also

- [RichText & TextSpan](./rich-text.md): one paragraph in several styles, from a tree of spans.
- [Text theme](./text-theme.md): the app's type scale, from display_large to label_small, and headings.
- [Selectable text & SelectionArea](./selection-area.md): text the reader can select and copy, alone or across several texts.
- [Kbd](./kbd.md): a keyboard key cap, for showing shortcuts.
- The guide: [Text, colour and the theme](/docs/guide/style)
- API reference: [`FontFamily`](https://docs.rs/frus/latest/frus/enum.FontFamily.html)

Source: [crates/frus-core/src/text_style.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-core/src/text_style.rs#L190-L199) @ `e6fba33f5b42`
