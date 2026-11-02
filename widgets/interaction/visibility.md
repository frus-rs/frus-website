---
title: "Visibility & Offstage"
sidebar_label: "Visibility & Offstage"
sidebar_position: 11
description: "Hide a child, keeping its box, its input, or nothing at all."
custom_edit_url: null
---

# `Visibility` and `Offstage`

## Purpose

Hide a child, keeping its box, its input, or nothing at all.

## Signature

```rust
pub struct Visibility<Msg = crate::callback::Callback> { .. }

impl Visibility {
    pub fn new(child: impl Widget<Msg> + 'static) -> Self;
}
```

```rust
pub struct Offstage<Msg = crate::callback::Callback> { .. }

impl Offstage {
    pub fn new(child: impl Widget<Msg> + 'static) -> Self;
}
```

## Example

![Rendered preview of the Visibility & Offstage demo](/preview/visibility.light.png)

From [`frus-examples/widgets/src/features/interaction/widgets/visibility.rs`](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/frus-examples/widgets/src/features/interaction/widgets/visibility.rs):

```rust
//! `Visibility` and `Offstage` — hide a child, and choose how much of it survives being
//! hidden: its box, its input, or nothing at all.

use frus::{component, Align, Column, Container, Offstage, Row, Switch, Text, Visibility, Widget};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        let shown = cx.use_state(|| true);
        let on = shown.get();
        let scheme = &cx.theme().scheme;

        // The same three boxes in each row; only the middle one is hidden.
        let block = |label: &str, highlighted: bool| {
            Container::new()
                .padding(10.0)
                .radius(8.0)
                .color(if highlighted {
                    scheme.primary_container
                } else {
                    scheme.surface_container_high
                })
                .child(Text::new(label).size(13.0))
        };
        let row = |middle: Box<dyn Widget>| {
            Row::new()
                .spacing(8.0)
                .cross_axis_alignment(Align::Center)
                .child(block("Left", false))
                .child_boxed(middle)
                .child(block("Right", false))
        };

        let flip = shown.clone();
        sections(vec![
            Box::new(section(
                "Middle box visible",
                Row::new()
                    .spacing(12.0)
                    .cross_axis_alignment(Align::Center)
                    .child(Switch::new(on).on_toggle(move |value| flip.set(value)))
                    .child(Text::new(if on { "Shown" } else { "Hidden" })),
            )),
            Box::new(section(
                "Visibility: hidden collapses the space",
                Column::new().child(row(Box::new(
                    Visibility::new(block("Middle", true)).visible(on),
                ))),
            )),
            // A spinner that comes and goes beside a label: keep its box so nothing moves.
            Box::new(section(
                "Visibility::maintain_size: hidden keeps the space",
                row(Box::new(
                    Visibility::new(block("Middle", true))
                        .visible(on)
                        .maintain_size(),
                )),
            )),
            Box::new(section(
                "Visibility::replacement: something else in its place",
                row(Box::new(
                    Visibility::new(block("Middle", true))
                        .visible(on)
                        .replacement(Text::new("…").size(13.0)),
                )),
            )),
            // Out of the layout entirely; its state is not kept while it is gone.
            Box::new(section(
                "Offstage: gone from layout, paint and input",
                row(Box::new(Offstage::new(block("Middle", true)).offstage(!on))),
            )),
        ])
    }))
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `Visibility` | `.visible()` | `visible: bool` | Whether the child is shown. |
| `Visibility` | `.maintain_size()` | — | Keeps the child's **box** while hidden: it is laid out and measured as usual, but not drawn, not clickable and not read out. |
| `Visibility` | `.maintain_interactivity()` | — | Keeps the child **taking input** while hidden. Only meaningful together with `maintain_size`, and rarely what you want: an invisible control that still reacts surprises everyone but its author. |
| `Visibility` | `.maintain_semantics()` | — | Keeps the child in the **accessibility tree** while hidden — for content that is visually redundant but should still be announced. |
| `Visibility` | `.replacement()` | `replacement: impl Widget<Msg> + 'static` | What to show in the child's place when it is hidden **and** its box is not maintained. |
| `Offstage` | `.offstage()` | `offstage: bool` | Turns it on or off from a condition; `false` lays the child out normally. |

## Behaviour

### `Visibility`

Shows or hides its child, with a say in **how much of it survives** being hidden.

The plain form collapses the child away entirely, as `Offstage` does:

```rust
Visibility::new(banner).visible(has_error)
```

`maintain_size` keeps the box — the child still measures and still takes its space, it is simply not drawn. That is what stops a row from twitching as a spinner comes and goes, and what lets two alternating labels of different widths hold a column steady:

```rust
Visibility::new(spinner).visible(loading).maintain_size()
```

`replacement` puts something else in the collapsed child's place instead — a spacer, a placeholder, a shorter message.

### `Offstage`

Takes its child **out of the layout entirely**: no box, no paint, no input, no accessibility. The surrounding row or column closes up as if the child were not written at all.

```rust
Offstage::new(panel).offstage(!expanded)
```

The child is not built into the tree while offstage, so it holds no retained state — a caret position, a scroll offset — and starts fresh when it comes back. That is the right trade for a branch that is genuinely gone; `Visibility::maintain_size` is the one to reach for when the box has to stay.

## See also

- [FocusableActionDetector & KeyboardListener](./focusable-action-detector.md): a custom control that answers the keyboard for itself.
- [IgnorePointer & AbsorbPointer](./ignore-pointer.md): switch off the pointer for a subtree: let taps through, or stop them.
- [Disabled state](./disabled.md): one enabled flag on every control: greyed out, inert, value kept.
- [Semantics](./semantics.md): what a screen reader is told about a widget, said from outside it.
- [Permission](./permissions.md): asking for the camera, the microphone, the location and notifications.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`Visibility`](https://docs.rs/frus/latest/frus/struct.Visibility.html)
- API reference: [`Offstage`](https://docs.rs/frus/latest/frus/struct.Offstage.html)

Source: [crates/frus-widgets/src/barrier.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/barrier.rs#L326-L335), [crates/frus-widgets/src/barrier.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/barrier.rs#L262-L265) @ `d7214f545435`
