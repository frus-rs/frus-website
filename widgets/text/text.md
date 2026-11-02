---
title: "Text"
sidebar_label: "Text"
sidebar_position: 1
description: "A run of text: size, weight, colour, decoration, alignment, wrapping, line limits."
custom_edit_url: null
---

# `Text`

## Purpose

A run of text: size, weight, colour, decoration, alignment, wrapping, line limits.

## Signature

```rust
pub struct Text { .. }

impl Text {
    pub fn new(content: impl Into<String>) -> Self;
    pub fn styled(content: impl Into<String>, style: TextStyle) -> Self;
}
```

## Example

![Rendered preview of the Text demo](/preview/text.light.png)

From [`frus-examples/widgets/src/features/text/widgets/text.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/text/widgets/text.rs):

```rust
//! `Text` — a run of text in one style: size, weight, colour, slant, decoration,
//! alignment, wrapping and line limits are all set on the widget.

use frus::{
    Align, Color, Column, Container, FontWeight, Row, Text, TextAlign, TextDecoration,
    TextOverflow, Widget, Wrap,
};

use crate::common::shared::{section, sections};

const LONG: &str = "Text wraps at the width it is given. This sentence is long enough to need \
                    several lines in a narrow box, which is where alignment, line limits and \
                    ellipses start to matter.";

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // Unstyled, a text takes the theme's body style and colour, so it reads right in
        // light and dark mode without any setting.
        Box::new(section("Default", Text::new("Hello, frus!"))),
        // Sizes are logical pixels; they grow with the reader's system font size.
        Box::new(section(
            "Sizes",
            Wrap::new()
                .gap(16.0)
                .run_gap(8.0)
                .align(Align::Baseline)
                .child(Text::new("12 px").size(12.0))
                .child(Text::new("16 px").size(16.0))
                .child(Text::new("24 px").size(24.0))
                .child(Text::new("32 px").size(32.0)),
        )),
        Box::new(section(
            "Weights and italic",
            Wrap::new()
                .gap(16.0)
                .run_gap(8.0)
                .child(Text::new("Regular").weight(FontWeight::Regular))
                .child(Text::new("Medium").weight(FontWeight::Medium))
                .child(Text::new("SemiBold").weight(FontWeight::SemiBold))
                .child(Text::new("Bold").weight(FontWeight::Bold))
                .child(Text::new("Italic").italic()),
        )),
        // A fixed colour does not follow the theme: keep it for meaning (errors,
        // success), and let ordinary text inherit.
        Box::new(section(
            "Colours",
            Wrap::new()
                .gap(16.0)
                .run_gap(8.0)
                .child(Text::new("Indigo").color(Color::hex("#4F46E5")))
                .child(Text::new("Error").color(Color::hex("#DC2626")))
                .child(Text::new("Success").color(Color::hex("#16A34A"))),
        )),
        // Lines under, through or over the text; the line can have its own colour.
        Box::new(section(
            "Decoration",
            Wrap::new()
                .gap(16.0)
                .run_gap(8.0)
                .child(Text::new("Underline").underline())
                .child(Text::new("Strikethrough").strikethrough())
                .child(Text::new("Overline").decoration(TextDecoration::OVERLINE))
                .child(
                    Text::new("Red underline")
                        .underline()
                        .decoration_color(Color::hex("#DC2626")),
                ),
        )),
        // Alignment places the lines inside the text's box, so it shows when the box is
        // wider than the text: here, 300 px.
        Box::new(section(
            "Alignment",
            Column::new()
                .spacing(6.0)
                .child(boxed(Text::new("Start").align(TextAlign::Start)))
                .child(boxed(Text::new("Center").align(TextAlign::Center)))
                .child(boxed(Text::new("End").align(TextAlign::End)))
                .child(boxed(Text::new(LONG).align(TextAlign::Justify))),
        )),
        // A line limit, and what happens to the rest: an ellipsis, a fade, or a hard cut.
        Box::new(section(
            "Line limits",
            Column::new()
                .spacing(8.0)
                .child(boxed(Text::new(LONG).max_lines(2).ellipsis()))
                .child(boxed(
                    Text::new(LONG).max_lines(1).overflow(TextOverflow::Fade),
                ))
                .child(boxed(
                    Text::new(LONG).no_wrap().overflow(TextOverflow::Clip),
                )),
        )),
        // `height` sets the line height as a multiple of the size: 1.6 airs a paragraph
        // out, 1.0 packs it.
        Box::new(section(
            "Line height",
            Row::new()
                .spacing(12.0)
                .cross_axis_alignment(Align::Start)
                .child(
                    Container::new()
                        .width(150.0)
                        .child(Text::new(LONG).size(13.0).height(1.0)),
                )
                .child(
                    Container::new()
                        .width(150.0)
                        .child(Text::new(LONG).size(13.0).height(1.6)),
                ),
        )),
    ])
}

/// A 300 px box with a faint outline, so you can see the text's room.
fn boxed(text: Text) -> Container {
    Container::new()
        .width(300.0)
        .padding(6.0)
        .border(1.0, Color::hex("#CBD5E1"))
        .child(text)
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.selectable()` | — | Makes this text **selectable**: a press, a drag, a double click or a long press selects words in it, and Ctrl+C, or the bar that opens over the selection, copies them. Ordinary text is not — it is drawn, and there is nothing under the pointer to select — and choosing which of an application's texts a reader may copy from is the application's business: an order number, an address, a code, an error message. |
| `.selection_toolbar()` | `build: impl Fn(&ToolbarContext, Vec<ToolbarItem<Msg>>) -> Vec<ToolbarItem<Msg>> + 'static` | Changes what the bar over a selectable text's selection offers — the application's say, as `TextField::selection_toolbar` is for a field. `build` is given the context and the default list (Copy when something is selected, Select all unless everything is) and answers with the list to show; an empty one shows no bar. |
| `.heading()` | — | Wraps at the width the parent offers. This is the default, and the call is kept because saying so at the call site is not redundant when it is the whole point of the widget being there. Marks this text as a **heading**: a landmark assistive technology can jump between, instead of one more run of prose. |
| `.wrap()` | — | Wraps the text at the width it is given: `soft_wrap(true)`. It is what an unset text does already; this says so, and undoes a `no_wrap` further up a chain. |
| `.no_wrap()` | — | Keeps the text on **one line**, explicit newlines aside. It then runs past its box rather than folding, and `Text::overflow` decides what becomes of the part that hangs over. |
| `.soft_wrap()` | `soft_wrap: bool` | Whether the text wraps at the width it is given. `wrap()` is `soft_wrap(true)`. |
| `.align()` | `align: TextAlign` | Where the lines sit **inside the box** the text was given. |
| `.max_lines()` | `max_lines: usize` | At most `max_lines` lines; what is past them is dropped, and `Text::overflow` decides how the last one ends. |
| `.overflow()` | `overflow: TextOverflow` | What becomes of text that does not fit: cut, cut with an ellipsis, faded out, or drawn past the box. |
| `.ellipsis()` | — | — |
| `.size()` | `size: f32` | Sets the font size, in pixels. |
| `.weight()` | `weight: FontWeight` | Sets the weight. |
| `.italic()` | — | Switches to italic. |
| `.family()` | `family: frus_core::FontFamily` | — |
| `.height()` | `height: f32` | — |
| `.color()` | `color: Color` | Sets the text color (otherwise the theme's). |
| `.underline()` | — | Underlines the text. |
| `.strikethrough()` | — | Strikes the text through. |
| `.decoration()` | `decoration: frus_core::TextDecoration` | Sets the decoration lines (freely combined). |
| `.decoration_color()` | `color: Color` | Sets the decoration color (otherwise the text's). |

## Behaviour

A single-line text widget.

Its layout size comes from a **styled** measurement (`frus-text`, weight and italic included); it pushes a text primitive into the scene when painting. The `TextStyle`'s color is inherited from the theme when absent.

## See also

- [TextStyle & DefaultTextStyle](./text-style.md): a style as a value: shared, merged, or given to a whole subtree.
- [RichText & TextSpan](./rich-text.md): one paragraph in several styles, from a tree of spans.
- [Text theme](./text-theme.md): the app's type scale, from display_large to label_small, and headings.
- The guide: [Text, colour and the theme](/docs/guide/style)
- API reference: [`Text`](https://docs.rs/frus/latest/frus/struct.Text.html)

Source: [crates/frus-widgets/src/text.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/text.rs#L32-L77) @ `4b802dae875c`
