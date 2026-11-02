---
title: "Dialog"
sidebar_label: "Dialog"
sidebar_position: 2
description: "The modal surface on its own, with any content in it."
custom_edit_url: null
---

# `Dialog`

## Purpose

The modal surface on its own, with any content in it.

## Signature

```rust
pub struct Dialog<Msg = crate::callback::Callback> { .. }

impl Dialog {
    pub fn new(open: bool) -> Self;
}
```

## Example

![Rendered preview of the Dialog demo](/preview/dialog.light.png)

From [`frus-examples/widgets/src/features/feedback/widgets/dialog.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/feedback/widgets/dialog.rs):

```rust
//! `Dialog` — the modal surface on its own: rounded, raised, held off the window's edges,
//! with **any content** in it. For what is not a title-and-buttons question: a small form,
//! a picture, a progress report.

use frus::{
    Align, Button, Column, Dialog, FontWeight, Insets, Justify, Padding, Row, State, StateContext,
    StatefulWidget, Text, TextField, Variant, Widget,
};

use crate::common::shared::section;

pub fn example() -> Box<dyn Widget> {
    Box::new(DialogDemo.into_widget())
}

pub struct DialogDemo;

pub struct DialogDemoState {
    pub open: bool,
    /// What is being typed in the dialog, kept apart from the saved value so that
    /// Cancel can throw it away.
    pub draft: String,
    pub name: String,
}

impl DialogDemoState {
    pub fn open(&mut self) {
        self.draft = self.name.clone();
        self.open = true;
    }

    pub fn save(&mut self) {
        self.name = self.draft.trim().to_string();
        self.open = false;
    }

    pub fn cancel(&mut self) {
        self.open = false;
    }
}

impl StatefulWidget for DialogDemo {
    type State = DialogDemoState;

    fn create_state(&self) -> DialogDemoState {
        DialogDemoState {
            open: false,
            draft: String::new(),
            name: "My playlist".into(),
        }
    }
}

impl State for DialogDemoState {
    type Widget = DialogDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        let body = section(
            "A form in a dialog",
            Column::new()
                .spacing(12.0)
                .cross_axis_alignment(Align::Start)
                .child(Text::new(format!("Playlist: {}", self.name)))
                .child(Button::new("Rename").on_press(cx.callback(DialogDemoState::open))),
        );

        // The content is ours to lay out: a heading, a field, a row of buttons.
        let content = Column::new()
            .spacing(16.0)
            .cross_axis_alignment(Align::Stretch)
            .child(
                Text::new("Rename playlist")
                    .size(20.0)
                    .weight(FontWeight::SemiBold),
            )
            .child(
                TextField::new(&self.draft)
                    .label("Name")
                    .on_input(cx.handler(|s: &mut DialogDemoState, t: String| s.draft = t))
                    .on_submit(cx.callback(DialogDemoState::save)),
            )
            .child(
                Row::new()
                    .spacing(8.0)
                    .main_axis_alignment(Justify::End)
                    .child(
                        Button::new("Cancel")
                            .variant(Variant::Text)
                            .on_press(cx.callback(DialogDemoState::cancel)),
                    )
                    .child(
                        Button::new("Save")
                            .enabled(!self.draft.trim().is_empty())
                            .on_press(cx.callback(DialogDemoState::save)),
                    ),
            );

        // Corners, widths and the room around it override the defaults (a 28-radius
        // surface at least 280 wide); `background` and `elevation` work the same way.
        let dialog = Dialog::new(self.open)
            .child(Padding::new(24.0, content))
            .radius(16.0)
            .max_width(360.0)
            .inset_padding(Insets::symmetric(16.0, 24.0))
            .on_dismiss(cx.callback(DialogDemoState::cancel))
            .body(body);

        Box::new(dialog)
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.on_dismiss()` | `message: impl Into<Msg>` | What a click on the scrim sends. |
| `.child()` | `content: impl Widget<Msg> + 'static` | What the dialog holds. |
| `.background()` | `color: Color` | The surface's colour. |
| `.elevation()` | `elevation: f32` | How far off the page it sits. |
| `.shadow_color()` | `color: Color` | The shadow's colour. |
| `.surface_tint()` | `color: Color` | The colour the surface is tinted towards for its elevation. |
| `.shape()` | `shape: ShapeBorder` | A 28-radius rounded rectangle by default. |
| `.radius()` | `radius: impl Into<BorderRadius>` | **Its corners**, as a shorthand for a rounded rectangle of that radius. The last of this and `shape` to be called is the one that counts. |
| `.inset_padding()` | `padding: Insets` | How far the dialog is held off the window's edges. |
| `.min_width()` | `width: f32` | The narrowest it gets, whatever its content. |
| `.max_width()` | `width: f32` | The widest it gets. |
| `.body()` | `body: impl Widget<Msg> + 'static` | Sets the screen behind it and finalises the dialog. |

## Behaviour

A **modal surface** over the screen: rounded, elevated, held off the window's edges.

Controlled, like every overlay here: `open` says whether it is showing, and `Dialog::on_dismiss` is what a click on the scrim sends. The screen behind stays built and visible.

## See also

- [AlertDialog](./alert-dialog.md): a modal box that asks a question and waits for the answer.
- [SimpleDialog](./simple-dialog.md): a modal list of choices, answered by picking one.
- [AboutDialog, AboutListTile & LicensePage](./about-dialog.md): the "about this app" box, and the page listing the licences it ships.
- [SnackBar & ScaffoldMessenger](./snack-bar.md): a short message at the bottom of the screen that goes away by itself.
- The guide: [Screens, navigation and dialogs](/docs/guide/navigation)
- API reference: [`Dialog`](https://docs.rs/frus/latest/frus/struct.Dialog.html)

Source: [crates/frus-widgets/src/dialog.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/dialog.rs#L204-L218) @ `4b802dae875c`
