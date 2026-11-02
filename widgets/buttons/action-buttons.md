---
title: "BackButton, CloseButton & DrawerButton"
sidebar_label: "BackButton, CloseButton & DrawerButton"
sidebar_position: 11
description: "Icon buttons whose meaning is fixed: back, close, and the two drawers."
custom_edit_url: null
---

# `BackButton` and `CloseButton` and `DrawerButton`

## Purpose

Icon buttons whose meaning is fixed: back, close, and the two drawers.

## Signature

```rust
pub struct BackButton<Msg = crate::callback::Callback>(Action<Msg>);

impl BackButton {
    pub fn new() -> Self;
}
```

```rust
pub struct CloseButton<Msg = crate::callback::Callback>(Action<Msg>);

impl CloseButton {
    pub fn new() -> Self;
}
```

```rust
pub struct DrawerButton<Msg = crate::callback::Callback>(Action<Msg>);

impl DrawerButton {
    pub fn new() -> Self;
}
```

## Example

![Rendered preview of the BackButton, CloseButton & DrawerButton demo](/preview/action-buttons.light.png)

From [`frus-examples/widgets/src/features/buttons/widgets/action_buttons.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/buttons/widgets/action_buttons.rs):

```rust
//! `BackButton`, `CloseButton`, `DrawerButton` and `EndDrawerButton` — icon buttons
//! whose meaning is fixed. They know their icon and their accessible name (translated
//! by the framework), so an app bar never spells them out by hand.

use frus::{
    BackButton, CloseButton, Color, DrawerButton, EndDrawerButton, State, StateContext,
    StatefulWidget, Text, Widget, Wrap,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(ActionButtonsDemo.into_widget())
}

struct ActionButtonsDemo;

struct ActionButtonsDemoState {
    last: &'static str,
}

impl StatefulWidget for ActionButtonsDemo {
    type State = ActionButtonsDemoState;

    fn create_state(&self) -> ActionButtonsDemoState {
        ActionButtonsDemoState {
            last: "nothing yet",
        }
    }
}

impl State for ActionButtonsDemoState {
    type Widget = ActionButtonsDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        let say =
            |what: &'static str| cx.callback(move |s: &mut ActionButtonsDemoState| s.last = what);

        sections(vec![
            // In a real page: `BackButton` pops the route (`cx.router().pop()`),
            // `CloseButton` dismisses a full-screen dialog, and the drawer buttons open
            // the scaffold's drawers. An `AppBar` adds the right one by itself.
            Box::new(section(
                "The four of them",
                Wrap::new()
                    .gap(16.0)
                    .run_gap(8.0)
                    .child(BackButton::new().on_press(say("Back")))
                    .child(CloseButton::new().on_press(say("Close")))
                    .child(DrawerButton::new().on_press(say("Open drawer")))
                    .child(EndDrawerButton::new().on_press(say("Open end drawer"))),
            )),
            Box::new(Text::new(format!("Pressed: {}", self.last))),
            Box::new(section(
                "Custom colour and size, and disabled",
                Wrap::new()
                    .gap(16.0)
                    .run_gap(8.0)
                    .child(
                        BackButton::new()
                            .color(Color::hex("#DC2626"))
                            .icon_size(32.0)
                            .on_press(say("Big back")),
                    )
                    .child(CloseButton::new().enabled(false)),
            )),
        ])
    }
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `BackButton` | `.on_press()` | `message: impl Into<Msg>` | What it does. Without a message it is **inert**: it draws, it is named, and it answers nothing. Disabled is the other thing, and says so. |
| `BackButton` | `.color()` | `color: Color` | The glyph's colour. |
| `BackButton` | `.icon_size()` | `size: f32` | The glyph's size. |
| `BackButton` | `.enabled()` | `enabled: bool` | Whether it can be pressed. |
| `CloseButton` | `.on_press()` | `message: impl Into<Msg>` | What it does. Without a message it is **inert**: it draws, it is named, and it answers nothing. Disabled is the other thing, and says so. |
| `CloseButton` | `.color()` | `color: Color` | The glyph's colour. |
| `CloseButton` | `.icon_size()` | `size: f32` | The glyph's size. |
| `CloseButton` | `.enabled()` | `enabled: bool` | Whether it can be pressed. |
| `DrawerButton` | `.on_press()` | `message: impl Into<Msg>` | What it does. Without a message it is **inert**: it draws, it is named, and it answers nothing. Disabled is the other thing, and says so. |
| `DrawerButton` | `.color()` | `color: Color` | The glyph's colour. |
| `DrawerButton` | `.icon_size()` | `size: f32` | The glyph's size. |
| `DrawerButton` | `.enabled()` | `enabled: bool` | Whether it can be pressed. |

## Behaviour

### `BackButton`

**The back arrow**, named in the reader's language.

### `CloseButton`

**The cross that dismisses something**, named in the reader's language.

### `DrawerButton`

**The bars that open the panel on the leading edge**, named in the reader's language.

## See also

- [DropdownButton](./dropdown-button.md): a button showing the current choice, whose options float below it.
- [DropdownMenu](./dropdown-menu.md): a dropdown that looks like a text field and filters its choices as you type.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`BackButton`](https://docs.rs/frus/latest/frus/struct.BackButton.html)
- API reference: [`CloseButton`](https://docs.rs/frus/latest/frus/struct.CloseButton.html)
- API reference: [`DrawerButton`](https://docs.rs/frus/latest/frus/struct.DrawerButton.html)

Source: [crates/frus-widgets/src/actionbutton.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/actionbutton.rs#L147-L147), [crates/frus-widgets/src/actionbutton.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/actionbutton.rs#L211-L211), [crates/frus-widgets/src/actionbutton.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/actionbutton.rs#L276-L276) @ `4b802dae875c`
