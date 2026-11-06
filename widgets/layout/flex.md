---
title: "Flex"
sidebar_label: "Flex"
sidebar_position: 5
description: "The flexbox line under Row and Column: shrink-wraps, stretches, wraps, reverses."
custom_edit_url: null
---

# `Flex`

## Purpose

The flexbox line under Row and Column: shrink-wraps, stretches, wraps, reverses.

## Signature

```rust
pub struct Flex<Msg = crate::callback::Callback> { .. }

impl Flex {
    pub fn row() -> Self;
    pub fn column() -> Self;
}
```

## Example

![Rendered preview of the Flex demo](/preview/flex.light.png)

From [`frus-examples/widgets/src/features/layout/widgets/flex.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/layout/widgets/flex.rs):

```rust
//! `Flex`: the flexbox container under `Row` and `Column`: a line of children that
//! shrink-wraps, stretches them across, and can wrap or run in reverse.
//!
//! Reach for `Row`/`Column` first. `Flex` is for when you want flexbox's own rules: a
//! container as big as its content, children stretched across it, `gap` and padding
//! built in.

use frus::{Align, Color, Container, Flex, Justify, Text, Widget};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // A flex row is as wide as its children; `gap` spaces them and `padding` pads the
        // whole line.
        Box::new(section(
            "Row with gap and padding",
            tinted(
                Flex::row()
                    .gap(8.0)
                    .padding(8.0)
                    .child(chip("one"))
                    .child(chip("two"))
                    .child(chip("three")),
            ),
        )),
        // Children are stretched across the line by default: here, to the tallest one.
        // `align` picks another cross-axis position.
        Box::new(section(
            "Stretched across (the default) and centred",
            Flex::row()
                .gap(24.0)
                .child(tinted(
                    Flex::row().gap(4.0).child(chip("short")).child(tall_chip()),
                ))
                .child(tinted(
                    Flex::row()
                        .gap(4.0)
                        .align(Align::Center)
                        .child(chip("short"))
                        .child(tall_chip()),
                )),
        )),
        // With a fixed width, `justify` distributes the spare room along the line.
        Box::new(section(
            "Fixed width, justified",
            tinted(
                Flex::row()
                    .width(300.0)
                    .justify(Justify::SpaceBetween)
                    .padding(8.0)
                    .child(chip("left"))
                    .child(chip("middle"))
                    .child(chip("right")),
            ),
        )),
        // `reverse` lays the children out from the far end: a chat transcript that
        // grows upwards is a reversed column.
        Box::new(section(
            "Reversed column",
            tinted(
                Flex::column()
                    .reverse()
                    .gap(4.0)
                    .padding(8.0)
                    .child(chip("first child"))
                    .child(chip("second child"))
                    .child(chip("third child")),
            ),
        )),
        // `wrap` moves what does not fit onto a new line; `run_gap` spaces the lines.
        Box::new(section(
            "Wrapping",
            tinted(
                (1..=12).fold(
                    Flex::row()
                        .wrap()
                        .width(280.0)
                        .gap(6.0)
                        .run_gap(6.0)
                        .padding(8.0),
                    |flex, i| flex.child(chip(&format!("item {i}"))),
                ),
            ),
        )),
    ])
}

fn tinted(child: impl Widget + 'static) -> Container {
    Container::new()
        .radius(8.0)
        .color(Color::hex("#E0E7FF"))
        .child(child)
}

fn chip(label: &str) -> Container {
    Container::new()
        .padding_each(6.0, 10.0, 6.0, 10.0)
        .radius(6.0)
        .color(Color::hex("#6366F1"))
        .child(Text::new(label).size(13.0).color(Color::hex("#FFFFFF")))
}

fn tall_chip() -> Container {
    Container::new()
        .padding(10.0)
        .height(72.0)
        .radius(6.0)
        .color(Color::hex("#4338CA"))
        .child(Text::new("tall").size(13.0).color(Color::hex("#FFFFFF")))
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.width()` | `width: f32` | Sets the width, in logical pixels. |
| `.height()` | `height: f32` | Sets the height, in logical pixels. |
| `.width_fraction()` | `fraction: f32` | Sets the width as a **fraction of the space the parent offers**: `1.0` fills it. |
| `.flex()` | `grow: f32` | The flex grow factor along the parent's main axis. |
| `.shrink()` | `shrink: f32` | How much of a row's deficit this box absorbs. |
| `.no_shrink()` |  | This box never shrinks: the default said out loud, kept because a layout that depends on it reads better for saying so. See `Self::shrink`. |
| `.reverse()` |  | Lays the children out from the **far end** of the axis: a column from the bottom up, a row from the end of the line back. Their order is unchanged: the first child is simply placed last. |
| `.justify()` | `justify: Justify` | How the children are distributed along the main axis. |
| `.align()` | `align: Align` | How the children are aligned on the cross axis. |
| `.padding()` | `padding: f32` | Uniform padding, in logical pixels. |
| `.padding_insets()` | `padding: impl Into<frus_core::InsetsGeometry>` | Sets the padding from any insets: one number, physical `Insets` (whose left stays on the left in a right-to-left script) or `InsetsDirectional`, whose start is the right there. |
| `.padding_each()` | `top: f32, right: f32, bottom: f32, left: f32` | Padding per side: top, right, bottom, left, physical: the left stays on the left in a right-to-left script. `padding_insets` takes a start and an end. |
| `.gap()` | `gap: f32` | Spacing between children, in logical pixels. |
| `.run_gap()` | `gap: f32` |  |
| `.align_lines()` | `align: AlignContent` |  |
| `.wrap()` |  | Turns **wrapping** on: children that overflow the main axis move to a new line, a responsive reflow. See also `Wrap` as a named entry point. |
| `.child()` | `child: impl Widget<Msg> + 'static` | Adds a child. |
| `.child_boxed()` | `child: Box<dyn Widget<Msg>>` | Adds an **already boxed** child: useful when children are built dynamically, in a `Vec<Box<dyn Widget>>`, and already erased to the dynamic type. |

## Behaviour

A flex container, row or column. It paints no decoration of its own.

## See also

- [Center & Aligned](./center.md): places one child somewhere inside the room it is given.
- [Row & Column](./row.md): children in a line, across or down, with alignment on both axes and spacing.
- [Expanded, Flexible & Spacer](./expanded.md): share the free room of a row or a column between some of its children.
- [SizedBox](./sized-box.md): a box of a given size: to size its child, or, empty, as a fixed gap.
- [ConstrainedBox, LimitedBox & Intrinsic](./constrained-box.md): floors and ceilings on a child's size, or the size its content would like.
- The guide: [Laying out a screen](/docs/guide/layout)
- API reference: [`Flex`](https://docs.rs/frus/latest/frus/struct.Flex.html)

Source: [crates/frus-widgets/src/flex.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/flex.rs#L15-L31) @ `e6fba33f5b42`
