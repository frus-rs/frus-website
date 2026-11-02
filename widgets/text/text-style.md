---
title: "TextStyle & DefaultTextStyle"
sidebar_label: "TextStyle & DefaultTextStyle"
sidebar_position: 2
description: "A style as a value: shared, merged, or given to a whole subtree."
custom_edit_url: null
---

# `TextStyle` and `DefaultTextStyle`

## Purpose

A style as a value: shared, merged, or given to a whole subtree.

## Signature

```rust
pub struct TextStyle { .. }

impl TextStyle {
    pub const fn new(size: f32) -> Self;
}
```

```rust
pub struct DefaultTextStyle { .. }

impl DefaultTextStyle {
    pub const fn from_text_style(style: TextStyle) -> Self;
}
```

## Example

![Rendered preview of the TextStyle & DefaultTextStyle demo](/preview/text-style.light.png)

From [`frus-examples/widgets/src/features/text/widgets/text_style.rs`](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/text/widgets/text_style.rs):

```rust
//! `TextStyle` — a style as a value: define it once, share it, merge it, and hand it to
//! `Text::styled`, a `TextSpan` or a whole subtree with `DefaultTextStyle`.
//!
//! Every field of a style is optional. A style that only says "size 20" leaves the
//! weight and colour to whatever is around it — which is what makes styles layer.

use frus::{
    Align, Color, Column, DefaultTextStyle, FontWeight, Text, TextAlign, TextStyle, Widget,
};

use crate::common::shared::{section, sections};

/// A style shared by several texts: a `const`, since every builder is `const fn`.
const LABEL: TextStyle = TextStyle::new(12.0)
    .weight(FontWeight::SemiBold)
    .letter_spacing(1.2)
    .color(Color::rgb(0.39, 0.40, 0.95));

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // `Text::styled` takes a whole style at once.
        Box::new(section(
            "A shared style",
            Column::new()
                .cross_axis_alignment(Align::Start)
                .spacing(4.0)
                .child(Text::styled("SECTION ONE", LABEL))
                .child(Text::styled("SECTION TWO", LABEL)),
        )),
        // `merge` lays one style over another: what the second says wins, what it leaves
        // open is kept. Here, the label made bigger and red.
        Box::new(section(
            "Merging",
            Text::styled(
                "OVERRIDDEN",
                LABEL.merge(TextStyle::new(18.0).color(Color::hex("#DC2626"))),
            ),
        )),
        // Letter spacing and line height are part of the style.
        Box::new(section(
            "Letter spacing",
            Column::new()
                .cross_axis_alignment(Align::Start)
                .spacing(4.0)
                .child(Text::styled(
                    "tight",
                    TextStyle::new(18.0).letter_spacing(-1.0),
                ))
                .child(Text::styled("normal", TextStyle::new(18.0)))
                .child(Text::styled(
                    "wide",
                    TextStyle::new(18.0).letter_spacing(4.0),
                )),
        )),
        // `DefaultTextStyle::around` gives every text in a subtree a default — the way a
        // card or a toolbar styles all its text at once. A text's own settings still win.
        Box::new(section(
            "DefaultTextStyle for a subtree",
            DefaultTextStyle {
                style: TextStyle::new(15.0).italic().color(Color::hex("#0F766E")),
                align: Some(TextAlign::Start),
                ..DefaultTextStyle::NONE
            }
            .around(
                Column::new()
                    .cross_axis_alignment(Align::Start)
                    .spacing(4.0)
                    .child(Text::new("Inherits the italic teal default."))
                    .child(Text::new("So does this one."))
                    .child(Text::new("This one asks for bold.").weight(FontWeight::Bold)),
            ),
        )),
    ])
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `TextStyle` | `.weight()` | `weight: FontWeight` | Sets the weight. |
| `TextStyle` | `.italic()` | — | Switches to italic. |
| `TextStyle` | `.size()` | `size: f32` | Sets the size. |
| `TextStyle` | `.color()` | `color: Color` | Sets the colour. |
| `TextStyle` | `.decoration()` | `decoration: TextDecoration` | Sets the decoration lines. |
| `TextStyle` | `.underline()` | — | Adds an underline, combining with any other decoration **this style** already carries — never with an inherited one, which this style cannot see. |
| `TextStyle` | `.strikethrough()` | — | Adds a strikethrough, combining with any other decoration this style carries. |
| `TextStyle` | `.decoration_color()` | `color: Color` | Sets the decoration colour; otherwise the text's colour is used. |
| `TextStyle` | `.height()` | `height: f32` | Sets the line's height, as a **multiple of the font size** — `2.0` is double leading, not two pixels. See the [field](Self::height) for why it is a ratio. |
| `TextStyle` | `.family()` | `family: FontFamily` | Names the font family. See the [field](Self::family) for the one case where a named family does not get the last word. |
| `TextStyle` | `.letter_spacing()` | `spacing: f32` | Sets the room added after every character, in logical pixels; negative draws them closer. See the [field](Self::letter_spacing). |
| `TextStyle` | `.clamp_scale()` | `max_scale: f32` | Every question answered: the framework's own default wherever nothing in the chain said anything, and **the reader's font size applied**. |
| `DefaultTextStyle` | `.merge()` | `over: Self` | This style with `over`'s answers laid on top, **field by field**: where `over` said nothing, this one's answer survives. |

## Behaviour

### `TextStyle`

The typographic attributes of a single line of text — **every field optional**.

`None` is not a missing value but an answer: *this style does not say*.

It matters more than it looks. `TextStyle::new(20.0)` says a size and **nothing else**, so a text wearing it still takes its weight from whatever subtree it is in. Before this was optional, a style named all three at once and *size 20, inherit the weight* was simply not expressible.

Ask `TextStyle::resolved` for the concrete numbers to measure and draw with.

### `DefaultTextStyle`

It carried its own copy of every typographic field until `TextStyle` learned to say *unset*; now the style is just a style.

A `Text` resolves `what the caller said ?? what this says ?? what the framework ships`, field by field, and **a default the caller did not choose does not count as having said something** — which is what an `Option` per field means and what `TextStyle::new(16.0)` could not express.

`DefaultTextStyle::around` wraps a subtree with one, and that is how `AppBar::toolbar_text_style` delivers its own.

## See also

- [Text](./text.md): a run of text: size, weight, colour, decoration, alignment, wrapping, line limits.
- [RichText & TextSpan](./rich-text.md): one paragraph in several styles, from a tree of spans.
- [Text theme](./text-theme.md): the app's type scale, from display_large to label_small, and headings.
- [FontFamily](./font-family.md): sans-serif, serif, monospace, or a font registered by name.
- The guide: [Text, colour and the theme](/docs/guide/style)
- API reference: [`TextStyle`](https://docs.rs/frus/latest/frus/struct.TextStyle.html)
- API reference: [`DefaultTextStyle`](https://docs.rs/frus/latest/frus/struct.DefaultTextStyle.html)

Source: [crates/frus-core/src/text_style.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-core/src/text_style.rs#L220-L261), [crates/frus-widgets/src/widgettheme.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/widgettheme.rs#L424-L440) @ `e6fba33f5b42`
