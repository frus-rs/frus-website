---
title: "UnconstrainedBox & OverflowBox"
sidebar_label: "UnconstrainedBox & OverflowBox"
sidebar_position: 9
description: "Let a child be a size its parent did not offer."
custom_edit_url: null
---

# `UnconstrainedBox` and `OverflowBox`

## Purpose

Let a child be a size its parent did not offer.

## Signature

```rust
pub struct UnconstrainedBox;
```

```rust
pub struct OverflowBox<Msg = crate::callback::Callback> { .. }

impl OverflowBox {
    pub fn new(child: impl Widget<Msg> + 'static) -> Self;
    pub fn unconstrained(child: impl Widget<Msg> + 'static) -> Self;
}
```

## Example

![Rendered preview of the UnconstrainedBox & OverflowBox demo](/preview/overflow-box.light.png)

From [`frus-examples/widgets/src/features/layout/widgets/overflow_box.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/layout/widgets/overflow_box.rs):

```rust
//! `UnconstrainedBox`, `OverflowBox`, `SizedOverflowBox` and `ConstraintsTransformBox` —
//! let a child be a size its parent did not offer.

use frus::{
    Alignment, AxisConstraint, Color, ConstraintsTransformBox, Container, MainAxisSize,
    OverflowBox, Row, SizedOverflowBox, Text, UnconstrainedBox, Widget, Wrap,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // A fixed-size container stretches its child to fill it (left). Wrapped in an
        // `UnconstrainedBox`, the child keeps its natural size instead (right).
        Box::new(section(
            "UnconstrainedBox",
            Wrap::new()
                .gap(12.0)
                .run_gap(12.0)
                .child(frame(tag("stretched")))
                .child(frame(UnconstrainedBox::new(tag("natural size")))),
        )),
        // `OverflowBox` lays its child out at a size of its own and lets it spill past
        // the box without moving anything around it. It does not clip.
        Box::new(section(
            "OverflowBox",
            Container::new().padding(24.0).child(
                Container::new()
                    .width(80.0)
                    .height(40.0)
                    .color(Color::hex("#C7D2FE"))
                    .child(
                        OverflowBox::new(
                            Container::new()
                                .radius(8.0)
                                .border(2.0, Color::hex("#4F46E5")),
                        )
                        .width(120.0)
                        .height(72.0),
                    ),
            ),
        )),
        // `SizedOverflowBox` takes a stated size in the layout (a 24 px slot here) and
        // shows a bigger child in it, anchored by its alignment.
        Box::new(section(
            "SizedOverflowBox",
            Container::new().padding(16.0).child(
                Row::new()
                    .main_axis_size(MainAxisSize::Min)
                    .child(tag("before"))
                    .child(
                        SizedOverflowBox::new(
                            24.0,
                            24.0,
                            Container::new()
                                .width(40.0)
                                .height(40.0)
                                .radius(20.0)
                                .color(Color::hex("#F59E0B")),
                        )
                        .alignment(Alignment::CENTER),
                    )
                    .child(tag("after")),
            ),
        )),
        // The general form: say per axis what the child is given. Here the child gets a
        // fixed 140 px across, whatever the page offers, and its natural height down.
        Box::new(section(
            "ConstraintsTransformBox",
            ConstraintsTransformBox::new(
                Container::new()
                    .padding(8.0)
                    .color(Color::hex("#E0E7FF"))
                    .child(Text::new("Laid out at exactly 140 px wide, wrapping.").wrap()),
            )
            .width(AxisConstraint::Fixed(140.0))
            .height(AxisConstraint::Unbounded)
            .alignment(Alignment::TOP_LEFT),
        )),
    ])
}

fn frame(child: impl Widget + 'static) -> Container {
    Container::new()
        .width(160.0)
        .height(72.0)
        .border(1.0, Color::hex("#A5B4FC"))
        .child(child)
}

fn tag(label: &str) -> Container {
    Container::new()
        .padding(8.0)
        .color(Color::hex("#6366F1"))
        .child(Text::new(label).size(13.0).color(Color::hex("#FFFFFF")))
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `OverflowBox` | `.width()` | `width: f32` | The width to lay the child out at. |
| `OverflowBox` | `.height()` | `height: f32` | The height to lay the child out at. |
| `OverflowBox` | `.natural_height()` | — | Lays the child out at the box's width and **the height it asks for**, however tall or short the box is (milestone 595). |
| `OverflowBox` | `.alignment()` | `alignment: Alignment` | Where the child sits in the box — and so which edges it spills past. |

## Behaviour

### `UnconstrainedBox`

Lets its child be its **natural size** even where the parent offers less — and says so when that does not fit.

The child is laid out as if nothing were constraining it, and the box is as big as the child, up to the space it was itself offered. Where the child fits, nothing is unusual — the box is simply the child's size, hugging it in a place that would have stretched it. Where it does not, the child is painted past the edges and a band says by how much, in debug builds.

```rust
// A row of chips that must not be squashed: too many, and the overflow is visible.
UnconstrainedBox::new(Flex::row().child(chip_a).child(chip_b))
```

That visible failure is the point, and the difference between this and `OverflowBox`, which spills on purpose and quietly. It is `ConstraintsTransformBox` with the constraint taken away, and nothing more.

`UnconstrainedBox::axis` frees **one** axis and leaves the other as it was, which is usually what is wanted: a paragraph that may be as tall as it likes is still as wide as its column.

### `OverflowBox`

A child laid out to constraints of **its own**, free to be bigger than the box that holds it, and painted over whatever is around it.

The box itself takes the size it would have taken with no child at all, so nothing around it moves. What changes is the child: it is laid out separately — at a size given here, or at the size it asks for (`OverflowBox::unconstrained`) — then anchored in the box and allowed to spill past its edges.

This is the escape hatch for a background that should bleed past its slot, or a decoration wider than the row it belongs to. It does **not** clip: put a `crate::ClipRRect` above it if the spill should stop somewhere.

## See also

- [SizedBox](./sized-box.md): a box of a given size: to size its child, or, empty, as a fixed gap.
- [ConstrainedBox, LimitedBox & Intrinsic](./constrained-box.md): floors and ceilings on a child's size, or the size its content would like.
- [AspectRatio](./aspect-ratio.md): a box whose height follows from its width.
- [FittedBox](./fitted-box.md): scales its child to fit its box, following a BoxFit rule.
- [FractionallySizedBox](./fractionally-sized-box.md): a box sized as a fraction of the room its parent offers.
- The guide: [Laying out a screen](/docs/guide/layout)
- API reference: [`UnconstrainedBox`](https://docs.rs/frus/latest/frus/struct.UnconstrainedBox.html)
- API reference: [`OverflowBox`](https://docs.rs/frus/latest/frus/struct.OverflowBox.html)

Source: [crates/frus-widgets/src/constraints.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/constraints.rs#L907-L907), [crates/frus-widgets/src/constraints.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/constraints.rs#L455-L458) @ `4b802dae875c`
