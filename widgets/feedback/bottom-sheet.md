---
title: "BottomSheet"
sidebar_label: "BottomSheet"
sidebar_position: 6
description: "A modal panel sliding up from the bottom, for contextual actions."
custom_edit_url: null
---

# `BottomSheet`

## Purpose

A modal panel sliding up from the bottom, for contextual actions.

## Signature

```rust
pub struct BottomSheet<Msg = crate::callback::Callback> { .. }

impl BottomSheet {
    pub fn new(open: bool) -> Self;
}
```

## Example

![Rendered preview of the BottomSheet demo](/preview/bottom-sheet.light.png)

From [`frus-examples/widgets/src/features/feedback/widgets/bottom_sheet.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/feedback/widgets/bottom_sheet.rs):

```rust
//! `BottomSheet` — a modal panel that slides up from the bottom of the window, over a
//! scrim, for a few contextual actions or a short form. A tap on the scrim closes it.
//!
//! In a page with a `Scaffold`, `Scaffold::bottom_sheet(panel, open, toggle)` does the
//! same in one call; here the sheet is built around the demo itself.

use frus::{
    Align, BottomSheet, Button, Column, FontWeight, Icon, Icons, Insets, ListTile, Padding, State,
    StateContext, StatefulWidget, Text, Widget,
};

use crate::common::shared::section;

pub fn example() -> Box<dyn Widget> {
    Box::new(BottomSheetDemo.into_widget())
}

struct BottomSheetDemo;

struct BottomSheetDemoState {
    /// The sheet is controlled: open while this says so.
    open: bool,
    last: &'static str,
}

impl BottomSheetDemoState {
    fn choose(&mut self, what: &'static str) {
        self.last = what;
        self.open = false;
    }
}

impl StatefulWidget for BottomSheetDemo {
    type State = BottomSheetDemoState;

    fn create_state(&self) -> BottomSheetDemoState {
        BottomSheetDemoState {
            open: false,
            last: "nothing yet",
        }
    }
}

impl State for BottomSheetDemoState {
    type Widget = BottomSheetDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        let choose =
            |what: &'static str| cx.callback(move |s: &mut BottomSheetDemoState| s.choose(what));

        // What the sheet holds: a heading and a few actions as list rows.
        let actions = Column::new()
            .cross_axis_alignment(Align::Stretch)
            .child(
                Text::new("Share photo")
                    .size(16.0)
                    .weight(FontWeight::SemiBold),
            )
            .child(
                ListTile::new()
                    .leading(Icon::new(Icons::LINK))
                    .title("Copy link")
                    .on_tap(choose("Copy link")),
            )
            .child(
                ListTile::new()
                    .leading(Icon::new(Icons::EMAIL))
                    .title("Send by email")
                    .on_tap(choose("Send by email")),
            )
            .child(
                ListTile::new()
                    .leading(Icon::new(Icons::DOWNLOAD))
                    .title("Save to device")
                    .on_tap(choose("Save to device")),
            );
        let actions = Padding::new(Insets::new(16.0, 8.0, 24.0, 8.0), actions);

        // What stays behind the sheet.
        let body = section(
            "Contextual actions",
            Column::new()
                .spacing(12.0)
                .cross_axis_alignment(Align::Start)
                .child(
                    Button::new("Share")
                        .icon(Icon::new(Icons::SHARE))
                        .on_press(cx.callback(|s: &mut BottomSheetDemoState| s.open = true)),
                )
                .child(Text::new(format!("Chosen: {}", self.last))),
        );

        // `sheet` sets the content and `body` finishes the widget, so say everything
        // else before `body`.
        let sheet = BottomSheet::new(self.open)
            .on_dismiss(cx.callback(|s: &mut BottomSheetDemoState| s.open = false))
            .sheet(actions)
            .body(body);

        Box::new(sheet)
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.background()` | `color: Color` | The sheet's surface. Unset, the theme's, then the scheme's `surface_container_low`. |
| `.shape()` | `shape: ShapeBorder` | — |
| `.on_dismiss()` | `message: impl Into<Msg>` | Message emitted on a click on the scrim (outside the sheet) — to close it. |
| `.sheet()` | `content: impl Widget<Msg> + 'static` | Sets the **sheet's content** (actions, a short form…). |
| `.body()` | `body: impl Widget<Msg> + 'static` | Sets the **background body** (always visible) and finalises the sheet. |

## Behaviour

A modal sheet sliding up from the bottom: a background body + a retractable panel.

## See also

- [AboutDialog, AboutListTile & LicensePage](./about-dialog.md): the "about this app" box, and the page listing the licences it ships.
- [SnackBar & ScaffoldMessenger](./snack-bar.md): a short message at the bottom of the screen that goes away by itself.
- [DraggableScrollableSheet](./draggable-scrollable-sheet.md): a panel along the bottom that follows the finger between resting heights.
- [MaterialBanner](./material-banner.md): a message across the top of the content that stays until it is answered.
- [Alert](./alert.md): a message box in the flow of the page: info, success, warning or error.
- The guide: [Screens, navigation and dialogs](/docs/guide/navigation)
- API reference: [`BottomSheet`](https://docs.rs/frus/latest/frus/struct.BottomSheet.html)

Source: [crates/frus-widgets/src/bottomsheet.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/bottomsheet.rs#L131-L144) @ `e6fba33f5b42`
