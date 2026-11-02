---
title: "FloatingActionButton"
sidebar_label: "FloatingActionButton"
sidebar_position: 3
description: "The screen's main action, floating above it: small, regular, large or extended."
custom_edit_url: null
---

# `FloatingActionButton`

## Purpose

The screen's main action, floating above it: small, regular, large or extended.

## Signature

```rust
pub struct FloatingActionButton<Msg = crate::callback::Callback> { .. }

impl FloatingActionButton {
    pub fn new(icon: IconData) -> Self;
    pub fn glyph(text: impl Into<String>) -> Self;
    pub fn extended(label: impl Into<String>) -> Self;
}
```

## Example

![Rendered preview of the FloatingActionButton demo](/preview/floating-action-button.light.png)

From [`frus-examples/widgets/src/features/buttons/widgets/fab.rs`](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/buttons/widgets/fab.rs):

```rust
//! `FloatingActionButton` — the one action a screen is for, floating above it. Put it in
//! a `Scaffold` with `.fab(..)`; here the buttons sit in the page so all sizes show.

use frus::{
    Align, Color, FloatingActionButton, Icons, Row, State, StateContext, StatefulWidget, Text,
    Widget, Wrap,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(FabDemo.into_widget())
}

struct FabDemo;

struct FabDemoState {
    created: u32,
}

impl StatefulWidget for FabDemo {
    type State = FabDemoState;

    fn create_state(&self) -> FabDemoState {
        FabDemoState { created: 0 }
    }
}

impl State for FabDemoState {
    type Widget = FabDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        let create = || cx.callback(|s: &mut FabDemoState| s.created += 1);

        sections(vec![
            Box::new(Text::new(format!("{} items created", self.created))),
            // Small for a secondary action next to another one, regular by default,
            // large when the screen is mostly empty and the action is everything.
            Box::new(section(
                "Sizes",
                Row::new()
                    .spacing(16.0)
                    .cross_axis_alignment(Align::Center)
                    .child(
                        FloatingActionButton::new(Icons::ADD)
                            .small()
                            .on_press(create()),
                    )
                    .child(FloatingActionButton::new(Icons::ADD).on_press(create()))
                    .child(
                        FloatingActionButton::new(Icons::ADD)
                            .large()
                            .on_press(create()),
                    ),
            )),
            // Extended: words when the icon alone would not say what happens.
            Box::new(section(
                "Extended",
                Wrap::new()
                    .gap(12.0)
                    .run_gap(12.0)
                    .child(
                        FloatingActionButton::extended("Compose")
                            .icon(Icons::EDIT)
                            .on_press(create()),
                    )
                    .child(FloatingActionButton::extended("New item").on_press(create())),
            )),
            // Colours, shape and elevation override the theme's.
            Box::new(section(
                "Custom colours and shape",
                Row::new()
                    .spacing(16.0)
                    .child(
                        FloatingActionButton::new(Icons::NAVIGATION)
                            .background(Color::hex("#1E3A8A"))
                            .foreground(Color::hex("#FFFFFF"))
                            .radius(28.0)
                            .elevation(6.0)
                            .on_press(create()),
                    )
                    .child(FloatingActionButton::new(Icons::DELETE).enabled(false)),
            )),
        ])
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.icon()` | `icon: IconData` | The glyph, over whatever was there. On an extended button it goes before the words. |
| `.small()` | — | **The smaller box**: 40 across, cornered at 12, with the same glyph. |
| `.large()` | — | **The larger box**: 96 across, cornered at 28, with a 36 glyph. |
| `.size()` | `size: FabSize` | Which of the four this is, said outright. |
| `.on_press()` | `message: impl Into<Msg>` | What it does. A button with no message is **inert**, which is not the same as disabled: see `enabled`. |
| `.enabled()` | `enabled: bool` | Whether it can be pressed. |
| `.background()` | `color: Color` | **The surface**, over the theme's and `primary_container`. |
| `.foreground()` | `color: Color` | **What is drawn on it**, over the theme's and `on_primary_container`. |
| `.elevation()` | `elevation: f32` | How far off the page it sits at rest, in pixels. Six by default. |
| `.hover_elevation()` | `elevation: f32` | — |
| `.shape()` | `shape: ShapeBorder` | **What shape it is**, over the theme's and the corner its size asks for. |
| `.radius()` | `radius: impl Into<BorderRadius>` | The shorthand for a rounded rectangle. `shape(ShapeBorder::stadium())` is the round button a docked one needs — see the note on `Self::shape_of`. |
| `.icon_size()` | `size: f32` | How big the glyph is, over the theme's and the size's own. |
| `.label_style()` | `style: TextStyle` | — |

## Behaviour

**The one action a screen is for.**

```rust
FloatingActionButton::<Msg>::new(Icons::ADD).on_press(Msg::Add);
FloatingActionButton::<Msg>::extended("New list").icon(Icons::ADD).on_press(Msg::Add);
```

This framework had no such widget. Two roles out, on the most prominent control on the screen.

## See also

- [Button](./button.md): the labelled button: filled, tonal, elevated, outlined or text, with an optional icon.
- [IconButton](./icon-button.md): a square button holding one icon, with four looks and a selected state.
- [SegmentedButton](./segmented-button.md): one outlined control with a few segments, exactly one of them chosen.
- [ToggleButtons](./toggle-buttons.md): a bank of buttons sharing their edges, each switched on or off on its own.
- [PopupMenuButton & MenuItem](./popup-menu-button.md): a list of actions floating over a button: icons, ticks, shortcuts and rules.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`FloatingActionButton`](https://docs.rs/frus/latest/frus/struct.FloatingActionButton.html)

Source: [crates/frus-widgets/src/fab.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/fab.rs#L92-L105) @ `e6fba33f5b42`
