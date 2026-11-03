---
title: "ConstrainedBox, LimitedBox & Intrinsic"
sidebar_label: "ConstrainedBox, LimitedBox & Intrinsic"
sidebar_position: 8
description: "Floors and ceilings on a child's size, or the size its content would like."
custom_edit_url: null
---

# `ConstrainedBox` and `LimitedBox` and `Intrinsic`

## Purpose

Floors and ceilings on a child's size, or the size its content would like.

## Signature

```rust
pub struct ConstrainedBox<Msg = crate::callback::Callback> { .. }

impl ConstrainedBox {
    pub fn new(child: impl Widget<Msg> + 'static) -> Self;
    pub fn new_boxed(child: Box<dyn Widget<Msg>>) -> Self;
    pub fn tight(width: f32, height: f32, child: impl Widget<Msg> + 'static) -> Self;
    pub fn loose(width: f32, height: f32, child: impl Widget<Msg> + 'static) -> Self;
}
```

```rust
pub struct LimitedBox<Msg = crate::callback::Callback> { .. }

impl LimitedBox {
    pub fn new(child: impl Widget<Msg> + 'static) -> Self;
}
```

```rust
pub struct Intrinsic<Msg = crate::callback::Callback> { .. }

impl Intrinsic {
    pub fn width(child: impl Widget<Msg> + 'static) -> Self;
    pub fn height(child: impl Widget<Msg> + 'static) -> Self;
}
```

## Example

![Rendered preview of the ConstrainedBox, LimitedBox & Intrinsic demo](/preview/constrained-box.light.png)

From [`frus-examples/widgets/src/features/layout/widgets/constrained_box.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/layout/widgets/constrained_box.rs):

```rust
//! `ConstrainedBox`, `LimitedBox`, `IntrinsicWidth` and `IntrinsicHeight` — change how
//! big a child is allowed to be, rather than setting its size outright.

use frus::{
    Align, Color, ColoredBox, Column, ConstrainedBox, Container, IntrinsicHeight, IntrinsicWidth,
    LimitedBox, Padding, Row, SizedBox, Text, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // A floor: the box is at least 120 px wide however short its label, the way
        // buttons keep a minimum width. The tint shows the box.
        Box::new(section(
            "Minimum width",
            Row::new()
                .spacing(8.0)
                .child(floor("OK"))
                .child(floor("A longer label")),
        )),
        // A ceiling: a paragraph never gets wider than 240 px, however wide the page — a
        // comfortable reading measure.
        Box::new(section(
            "Maximum width",
            ConstrainedBox::new(
                Text::new(
                    "This paragraph is capped at 240 px wide, so its lines stay short enough \
                     to read comfortably even on a wide window.",
                )
                .wrap(),
            )
            .max_width(240.0),
        )),
        // `tight` makes the box exactly that size, whatever the child would like.
        Box::new(section(
            "Tight",
            ConstrainedBox::tight(180.0, 48.0, pill("exactly 180 × 48")),
        )),
        // `LimitedBox` only caps an axis that has no end. This page scrolls, so its height
        // has none: a box that asks for all the room is held to 80 px. Where the room is
        // bounded the limit does nothing.
        Box::new(section(
            "LimitedBox in a scrolling page",
            LimitedBox::new(SizedBox::expand(
                Container::new()
                    .color(Color::hex("#C7D2FE"))
                    .child(Text::new("held to 80 px").color(Color::hex("#312E81"))),
            ))
            .max_height(80.0),
        )),
        // `IntrinsicWidth` sizes a column to its widest child, and the stretched children
        // all take that width: a menu whose items are all as wide as the longest one.
        Box::new(section(
            "IntrinsicWidth",
            IntrinsicWidth::width(
                Column::new()
                    .spacing(4.0)
                    .cross_axis_alignment(Align::Stretch)
                    .child(pill("Open"))
                    .child(pill("Save as…"))
                    .child(pill("Export to PDF")),
            ),
        )),
        // `IntrinsicHeight` does the same downwards: the side bar matches the height of
        // the text beside it, whatever that turns out to be.
        Box::new(section(
            "IntrinsicHeight",
            IntrinsicHeight::height(
                Row::new()
                    .spacing(8.0)
                    .cross_axis_alignment(Align::Stretch)
                    .child(Container::new().width(4.0).color(Color::hex("#6366F1")))
                    .child(
                        Text::new(
                            "A quoted line,\nas tall as it needs to be,\nwith a bar beside it.",
                        )
                        .wrap(),
                    ),
            ),
        )),
    ])
}

fn pill(label: &str) -> Container {
    Container::new()
        .padding(10.0)
        .radius(6.0)
        .color(Color::hex("#6366F1"))
        .child(Text::new(label).size(13.0).color(Color::hex("#FFFFFF")))
}

/// A label in a box with a 120 px floor; the tint is the box, not the label.
fn floor(label: &str) -> ColoredBox {
    ColoredBox::new(
        Color::hex("#C7D2FE"),
        ConstrainedBox::new(Padding::new(
            10.0,
            Text::new(label).size(13.0).color(Color::hex("#312E81")),
        ))
        .min_width(120.0),
    )
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `ConstrainedBox` | `.min_width()` | `width: f32` | The width the box never goes below. |
| `ConstrainedBox` | `.max_width()` | `width: f32` | The width the box never goes above. |
| `ConstrainedBox` | `.min_height()` | `height: f32` | The height the box never goes below. |
| `ConstrainedBox` | `.max_height()` | `height: f32` | The height the box never goes above. |
| `LimitedBox` | `.max_width()` | `max: f32` | The most the child may take across, where the room on offer has no end. |
| `LimitedBox` | `.max_height()` | `max: f32` | The most the child may take down, where the room on offer has no end. |
| `Intrinsic` | `.step()` | `step: f32` | Rounds the measured size **up** to a multiple of `step`. |

## Behaviour

### `ConstrainedBox`

Floors and ceilings on either axis, for a child that would otherwise be free to take any size.

A floor and a ceiling that are equal make the box **tight**: whatever the child or the space on offer says, that is the size. Set nothing and the box is transparent — it is the constraints that make it worth having, not the box.

### `LimitedBox`

A box that **caps its child only where nothing else does**: where the room on offer has no end — down a column's scroll, along a list — the child may take at most `max_width` or `max_height`; where it has one, the box changes nothing.

```rust
use frus_widgets::{LimitedBox, Text};

// A placeholder that asks for all the room, and is 120 px tall in a scrolling list.
let _row: LimitedBox<()> = LimitedBox::new(Text::new("Loading")).max_height(120.0);
```

Without a limit on an axis, that axis is left as it came. The child is never made bigger than it would be: a child that hugs its content still does.

### `Intrinsic`

A box sized to what its content would **like** to be.

The usual case: a column of buttons that should all be as wide as the widest label, and no wider. Stretching gives them the whole column; hugging gives each its own width; only an intrinsic width gives them all the widest one.

It is not free. The content is measured **once more**, unconstrained, before it is laid out for real — which is why it is a widget you reach for deliberately and not a property every box carries. Nested one inside another, the cost multiplies.

## See also

- [Expanded, Flexible & Spacer](./expanded.md): share the free room of a row or a column between some of its children.
- [SizedBox](./sized-box.md): a box of a given size: to size its child, or, empty, as a fixed gap.
- [UnconstrainedBox & OverflowBox](./overflow-box.md): let a child be a size its parent did not offer.
- [AspectRatio](./aspect-ratio.md): a box whose height follows from its width.
- [FittedBox](./fitted-box.md): scales its child to fit its box, following a BoxFit rule.
- The guide: [Laying out a screen](/docs/guide/layout)
- API reference: [`ConstrainedBox`](https://docs.rs/frus/latest/frus/struct.ConstrainedBox.html)
- API reference: [`LimitedBox`](https://docs.rs/frus/latest/frus/struct.LimitedBox.html)
- API reference: [`Intrinsic`](https://docs.rs/frus/latest/frus/struct.Intrinsic.html)

Source: [crates/frus-widgets/src/constraints.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/constraints.rs#L238-L244), [crates/frus-widgets/src/constraints.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/constraints.rs#L39-L42), [crates/frus-widgets/src/constraints.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/constraints.rs#L350-L354) @ `e6fba33f5b42`
