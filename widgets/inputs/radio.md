---
title: "RadioGroup & Radio"
sidebar_label: "RadioGroup & Radio"
sidebar_position: 8
description: "One choice out of a few, all visible at once."
custom_edit_url: null
---

# `RadioGroup` and `Radio`

## Purpose

One choice out of a few, all visible at once.

## Signature

```rust
pub struct RadioGroup<Msg = crate::callback::Callback> { .. }

impl RadioGroup {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        selected: usize,
        on_select: impl Fn(usize) -> R1 + 'static,
    ) -> Self;
}
```

```rust
pub struct Radio<Msg = crate::callback::Callback> { .. }

impl Radio {
    pub fn new(selected: bool) -> Self;
}
```

## Example

![Rendered preview of the RadioGroup & Radio demo](/preview/radio.light.png)

From [`frus-examples/widgets/src/features/inputs/widgets/radio.rs`](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/inputs/widgets/radio.rs):

```rust
//! `RadioGroup` and `Radio` — one choice out of a few, all visible at once. `RadioGroup`
//! lays out a labelled set; `Radio` is a single button for layouts of your own.

use frus::{Color, Radio, RadioGroup, Row, State, StateContext, StatefulWidget, Text, Widget};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(RadioDemo.into_widget())
}

const SHIPPING: [&str; 3] = ["Standard (5 days)", "Express (2 days)", "Pick up in store"];
const SIZES: [&str; 3] = ["S", "M", "L"];

struct RadioDemo;

struct RadioDemoState {
    shipping: usize,
    size: usize,
}

impl StatefulWidget for RadioDemo {
    type State = RadioDemoState;

    fn create_state(&self) -> RadioDemoState {
        RadioDemoState {
            shipping: 0,
            size: 1,
        }
    }
}

impl State for RadioDemoState {
    type Widget = RadioDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        // The group reports the index of the option picked.
        let group = SHIPPING.iter().fold(
            RadioGroup::new(
                self.shipping,
                cx.handler(|s: &mut RadioDemoState, i: usize| s.shipping = i),
            ),
            |group, option| group.option(*option),
        );

        // Single radios, laid out in a row: each is told whether it is the selected
        // one and what to send when chosen.
        let sizes = SIZES
            .iter()
            .enumerate()
            .fold(Row::new().spacing(16.0), |row, (i, size)| {
                row.child(
                    Radio::new(self.size == i)
                        .label(*size)
                        .selected_color(Color::hex("#DB2777"))
                        .on_select(cx.callback(move |s: &mut RadioDemoState| s.size = i)),
                )
            });

        sections(vec![
            Box::new(section("RadioGroup", group)),
            Box::new(Text::new(format!("Shipping: {}", SHIPPING[self.shipping]))),
            Box::new(section("Radio, in a row, custom colour", sizes)),
            Box::new(section(
                "Disabled",
                RadioGroup::new(0, cx.handler(|_: &mut RadioDemoState, _: usize| {}))
                    .option("Only option")
                    .option("Not available")
                    .enabled(false),
            )),
        ])
    }
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `RadioGroup` | `.selected_color()` | `color: Color` | The ring and the dot of the **chosen** option; the theme's `primary` otherwise. |
| `RadioGroup` | `.border_color()` | `color: Color` | The ring of an option that is not chosen, at rest. |
| `RadioGroup` | `.active_border_color()` | `color: Color` | That ring under a pointer, a finger or focus. |
| `RadioGroup` | `.label_color()` | `color: Color` | The labels' colour; the theme's `on_surface` otherwise. |
| `RadioGroup` | `.option()` | `label: impl Into<String>` | Adds an option, in order. |
| `RadioGroup` | `.enabled()` | `enabled: bool` | Whether the group can be chosen from. Disabled it is **inert** — no message, out of the tab order, announced as unavailable — and it still shows which option is chosen. |
| `RadioGroup` | `.tap_target()` | `target: TapTarget` | **How much room it reserves for a finger** (`TapTarget`). Unset, the theme's answer, which is `Padded` — at least 48 pixels either way, whatever this control paints in the middle of it. |
| `Radio` | `.label()` | `label: impl Into<String>` | The words beside it. Empty by default, which is what a radio in a row that has its own title wants — see `RadioListTile`. |
| `Radio` | `.label_size()` | `size: f32` | The label's size, in pixels. |
| `Radio` | `.on_select()` | `message: impl Into<Msg>` | What to say when it is pressed. A radio with no message is inert. |
| `Radio` | `.enabled()` | `enabled: bool` | Whether it can be pressed. |
| `Radio` | `.selected_color()` | `color: Color` | The ring and the dot while it is the chosen one, over the theme's and `primary`. |
| `Radio` | `.border_color()` | `color: Color` | The ring while it is not, at rest. |
| `Radio` | `.active_border_color()` | `color: Color` | And the ring while it is not, under a finger, a pointer or focus. |
| `Radio` | `.label_color()` | `color: Color` | The label's colour. |
| `Radio` | `.visual_density()` | `density: crate::VisualDensity` | — |
| `Radio` | `.splash_radius()` | `radius: f32` | **The halo's radius** under a pointer, the keyboard or a finger. Unset, the theme's, then 20. |
| `Radio` | `.tap_target()` | `target: TapTarget` | How much room it reserves for the finger that works it. |

## Behaviour

### `RadioGroup`

A single-selection group of radio buttons.

### `Radio`

One radio option, internal to the group. **One radio button.**

It existed before this, as a private `Radio` a `RadioGroup` built for each of its labels, and there was no way to have one on its own.

```rust
Radio::<Msg>::new(true).label("Every day").on_select(Msg::Pick);
```

So this reports one message when pressed and says nothing about what the answer becomes.

## See also

- [SearchAnchor](./search-anchor.md): a search bar that opens a search view with suggestions.
- [Checkbox](./checkbox.md): a yes/no choice with an optional label, and a three-state version.
- [Switch](./switch.md): an on/off toggle that takes effect at once.
- [CheckboxListTile, RadioListTile & SwitchListTile](./control-list-tiles.md): list rows whose whole width works one control, for settings screens.
- [Slider](./slider.md): a value picked by dragging along a track, continuous or in steps.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`RadioGroup`](https://docs.rs/frus/latest/frus/struct.RadioGroup.html)
- API reference: [`Radio`](https://docs.rs/frus/latest/frus/struct.Radio.html)

Source: [crates/frus-widgets/src/radio.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/radio.rs#L375-L388), [crates/frus-widgets/src/radio.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/radio.rs#L45-L61) @ `e6fba33f5b42`
