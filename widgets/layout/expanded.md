---
title: "Expanded, Flexible & Spacer"
sidebar_label: "Expanded, Flexible & Spacer"
sidebar_position: 6
description: "Share the free room of a row or a column between some of its children."
custom_edit_url: null
---

# `Expanded` and `Flexible` and `Spacer`

## Purpose

Share the free room of a row or a column between some of its children.

## Signature

```rust
pub struct Expanded<Msg = crate::callback::Callback> { .. }

impl Expanded {
    pub fn new(inner: impl Widget<Msg> + 'static) -> Self;
}
```

```rust
pub struct Flexible<Msg = crate::callback::Callback> { .. }

impl Flexible {
    pub fn new(inner: impl Widget<Msg> + 'static) -> Self;
}
```

```rust
pub struct Spacer { .. }

impl Spacer {
    pub fn new() -> Self;
}
```

## Example

![Rendered preview of the Expanded, Flexible & Spacer demo](/preview/expanded.light.png)

From [`frus-examples/widgets/src/features/layout/widgets/expanded.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/layout/widgets/expanded.rs):

```rust
//! `Expanded`, `Flexible` and `Spacer`: share the free room of a `Row` or a `Column`
//! between some of its children.

use frus::{Alignment, Color, Container, Expanded, Flexible, Row, Spacer, Text, Widget};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // `Expanded` takes whatever room the fixed children leave: the classic "label
        // fills, button keeps its size" row.
        Box::new(section(
            "Expanded fills the rest",
            Row::new()
                .spacing(8.0)
                .child(fixed("fixed"))
                .child(Expanded::new(filler("Expanded", "#6366F1")))
                .child(fixed("fixed")),
        )),
        // Several expanded children split the room by their `flex` factors: 1 : 2 : 1.
        Box::new(section(
            "Flex factors",
            Row::new()
                .spacing(8.0)
                .child(Expanded::new(filler("1", "#818CF8")))
                .child(Expanded::new(filler("2", "#6366F1")).flex(2.0))
                .child(Expanded::new(filler("1", "#818CF8"))),
        )),
        // `Flexible` may take up to its share but does not have to: a short child keeps
        // its own width. `Expanded` beside it gets what the flexible one did not use.
        Box::new(section(
            "Flexible keeps its own size",
            Row::new()
                .spacing(8.0)
                .child(Flexible::new(
                    Container::new()
                        .padding(8.0)
                        .color(Color::hex("#F59E0B"))
                        .child(Text::new("Flexible").color(Color::hex("#FFFFFF"))),
                ))
                .child(Expanded::new(filler("Expanded", "#6366F1"))),
        )),
        // A long text in a `Flexible` wraps instead of pushing its neighbours off the
        // row: the usual cure for a row that overflows.
        Box::new(section(
            "Flexible wraps long text",
            Row::new()
                .spacing(8.0)
                .child(fixed("icon"))
                .child(Flexible::new(
                    Text::new(
                        "A long description that would run past the edge of the row if it \
                         were not allowed to wrap inside a Flexible.",
                    )
                    .wrap(),
                )),
        )),
        // `Spacer` is an empty `Expanded`: it pushes what follows it to the end.
        Box::new(section(
            "Spacer",
            Container::new()
                .padding(8.0)
                .color(Color::hex("#EEF2FF"))
                .child(
                    Row::new()
                        .child(fixed("left"))
                        .child(Spacer::new())
                        .child(fixed("right")),
                ),
        )),
    ])
}

fn fixed(label: &str) -> Container {
    Container::new()
        .width(64.0)
        .height(40.0)
        .radius(6.0)
        .color(Color::hex("#10B981"))
        .alignment(Alignment::CENTER)
        .child(Text::new(label).size(13.0).color(Color::hex("#FFFFFF")))
}

fn filler(label: &str, color: &str) -> Container {
    Container::new()
        .height(40.0)
        .radius(6.0)
        .color(Color::hex(color))
        .alignment(Alignment::CENTER)
        .child(Text::new(label).size(13.0).color(Color::hex("#FFFFFF")))
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `Expanded` | `.loose()` |  |  |
| `Expanded` | `.flex()` | `flex: f32` | The share of the spare room, when several children expand: two children at `flex(2.0)` and `flex(1.0)` split it two to one. |
| `Flexible` | `.flex()` | `flex: f32` | The share of the spare room, when several children are flexible: two children at `flex(2.0)` and `flex(1.0)` split it two to one. |
| `Flexible` | `.tight()` |  | A **tight** fit: the child takes its whole share whether it asked for it or not. The same box as `Expanded::new`. |
| `Flexible` | `.fit()` | `fit: FlexFit` |  |
| `Spacer` | `.flex()` | `flex: f32` |  |

## Behaviour

### `Expanded`

Wraps a child so it takes the spare room along its parent's main axis.

Three properties at once (a basis of zero, a grow factor, and no automatic minimum) because a bare grow factor does nothing for the case this exists for: a flex item's automatic minimum size is its own content, so `flex: 1` on a long label grows it and still lets it refuse to be narrower than its text.

### `Flexible`

That is the widget for a label that should stay its natural width in a wide row and ellipsise in a narrow one. Reach for `Expanded` (or `Flexible::new(child).tight()`, the same box) when the child should fill its share whether it wanted to or not.

### `Spacer`

Flexible empty space along a row's or a column's main axis.

## See also

- [Row & Column](./row.md): children in a line, across or down, with alignment on both axes and spacing.
- [Flex](./flex.md): the flexbox line under Row and Column: shrink-wraps, stretches, wraps, reverses.
- [SizedBox](./sized-box.md): a box of a given size: to size its child, or, empty, as a fixed gap.
- [ConstrainedBox, LimitedBox & Intrinsic](./constrained-box.md): floors and ceilings on a child's size, or the size its content would like.
- [UnconstrainedBox & OverflowBox](./overflow-box.md): let a child be a size its parent did not offer.
- The guide: [Laying out a screen](/docs/guide/layout)
- API reference: [`Expanded`](https://docs.rs/frus/latest/frus/struct.Expanded.html)
- API reference: [`Flexible`](https://docs.rs/frus/latest/frus/struct.Flexible.html)
- API reference: [`Spacer`](https://docs.rs/frus/latest/frus/struct.Spacer.html)

Source: [crates/frus-widgets/src/expanded.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/expanded.rs#L65-L71), [crates/frus-widgets/src/expanded.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/expanded.rs#L171-L175), [crates/frus-widgets/src/spacer.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/spacer.rs#L35-L37) @ `e6fba33f5b42`
