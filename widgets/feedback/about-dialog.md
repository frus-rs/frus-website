---
title: "AboutDialog, AboutListTile & LicensePage"
sidebar_label: "AboutDialog, AboutListTile & LicensePage"
sidebar_position: 4
description: "The \"about this app\" box, and the page listing the licences it ships."
custom_edit_url: null
---

# `AboutDialog` and `AboutListTile` and `LicensePage`

## Purpose

The "about this app" box, and the page listing the licences it ships.

## Signature

```rust
pub struct AboutDialog<Msg = crate::callback::Callback> { .. }

impl AboutDialog {
    pub fn new(open: bool) -> Self;
}
```

```rust
pub struct AboutListTile<Msg = crate::callback::Callback> { .. }

impl AboutListTile {
    pub fn new(on_tap: Msg) -> Self;
}
```

```rust
pub struct LicensePage<Msg = crate::callback::Callback> { .. }

impl LicensePage {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        selected: Option<usize>,
        on_select: impl Fn(Option<usize>) -> R1 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the AboutDialog, AboutListTile & LicensePage demo](/preview/about-dialog.light.png)

From [`frus-examples/widgets/src/features/feedback/widgets/about_dialog.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/feedback/widgets/about_dialog.rs):

```rust
//! `AboutDialog`, `AboutListTile` and `LicensePage` — the "about this app" box and the
//! page listing the licences of everything the app ships. Every distributed app owes
//! that page; `frus::licenses::add_all(include_str!(..))` fills it from a file generated
//! out of the app's real dependency graph.

use frus::{
    AboutDialog, AboutListTile, Align, Column, ConstrainedBox, Icon, Icons, LicenseNotice,
    LicensePage, Package, State, StateContext, StatefulWidget, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(AboutDemo.into_widget())
}

/// Notices of our own, so the page has something to show. A real app registers the
/// generated file at start-up instead, and `LicensePage::new` reads that registry.
fn sample_notices() -> Vec<LicenseNotice> {
    vec![
        LicenseNotice {
            packages: vec![
                Package::new("frus", "0.3.0"),
                Package::new("frus-widgets", "0.3.0"),
            ],
            text: "MIT License\n\nPermission is hereby granted, free of charge, to any person \
                   obtaining a copy of this software…"
                .into(),
        },
        LicenseNotice {
            packages: vec![Package::new("serde", "1.0.228")],
            text: "Apache License, Version 2.0…".into(),
        },
    ]
}

struct AboutDemo;

struct AboutDemoState {
    about_open: bool,
    showing_licences: bool,
    /// Which package's licence the page has open; `None` is the list.
    package: Option<usize>,
}

impl StatefulWidget for AboutDemo {
    type State = AboutDemoState;

    fn create_state(&self) -> AboutDemoState {
        AboutDemoState {
            about_open: false,
            showing_licences: false,
            package: None,
        }
    }
}

impl State for AboutDemoState {
    type Widget = AboutDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        let mut column = Column::new()
            .spacing(24.0)
            .cross_axis_alignment(Align::Stretch);

        // The row a settings screen or a drawer ends with. It only says "open"; the
        // application opens the box.
        column = column.child(section(
            "AboutListTile",
            AboutListTile::new(cx.callback(|s: &mut AboutDemoState| s.about_open = true))
                .application("frus widgets")
                .subtitle("Version 0.1.0")
                .build(),
        ));

        // The page is a column and does not scroll itself: in an app it goes in the
        // page's scroll view, usually on its own route.
        if self.showing_licences {
            column = column.child(section(
                "LicensePage",
                LicensePage::new(
                    self.package,
                    cx.handler(|s: &mut AboutDemoState, which: Option<usize>| s.package = which),
                )
                .notices(sample_notices())
                .application("frus widgets")
                .version("0.1.0")
                .legalese("The gallery itself is MIT OR Apache-2.0.")
                .build(),
            ));
        }

        let body = ConstrainedBox::new(column).max_width(480.0);

        // An alert dialog underneath: name, version, legal line, a way to the licences and
        // a way out. `on_close` also closes it on a tap outside.
        let about = AboutDialog::new(self.about_open)
            .application("frus widgets")
            .version("Version 0.1.0")
            .legalese("A gallery of every frus widget.")
            .icon(Icon::new(Icons::INFO))
            .on_licences(cx.callback(|s: &mut AboutDemoState| {
                s.about_open = false;
                s.showing_licences = true;
            }))
            .on_close(cx.callback(|s: &mut AboutDemoState| s.about_open = false))
            .body(body);

        sections(vec![Box::new(about)])
    }
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `AboutDialog` | `.application()` | `name: impl Into<String>` | The application's name. |
| `AboutDialog` | `.version()` | `version: impl Into<String>` | Its version. |
| `AboutDialog` | `.legalese()` | `legalese: impl Into<String>` | The legal line — a copyright, a notice of the application's own. |
| `AboutDialog` | `.icon()` | `icon: impl Widget<Msg> + 'static` | Its mark, beside the name. |
| `AboutDialog` | `.on_licences()` | `message: impl Into<Msg>` | The button through to the licences, and what it says. |
| `AboutDialog` | `.licences_label()` | `label: impl Into<String>` | Its label, for an application in another language. |
| `AboutDialog` | `.on_close()` | `message: impl Into<Msg>` | The button that closes it — which is also what a tap outside sends. |
| `AboutDialog` | `.close_label()` | `label: impl Into<String>` | Its label. |
| `AboutListTile` | `.application()` | `name: impl Into<String>` | The application's name, which the row's default title is *about*. |
| `AboutListTile` | `.title()` | `title: impl Into<String>` | A title of the caller's own, over the default `About <name>`. |
| `AboutListTile` | `.subtitle()` | `subtitle: impl Into<String>` | A second line under it — a version, usually. |
| `AboutListTile` | `.icon()` | `icon: Option<crate::IconData>` | The glyph at its leading edge, or `None` for a row with no icon at all. |
| `LicensePage` | `.notices()` | `notices: Vec<LicenseNotice>` | A page over notices of the caller's own, instead of the registry's. |
| `LicensePage` | `.application()` | `name: impl Into<String>` | The application's name, at the head of the page. |
| `LicensePage` | `.version()` | `version: impl Into<String>` | Its version, under the name. |
| `LicensePage` | `.legalese()` | `legalese: impl Into<String>` | The application's own legal line — a copyright, usually. |
| `LicensePage` | `.empty_message()` | `message: impl Into<String>` | What the page says when **nothing** is registered. There is a default, and it says what to do about it. |
| `LicensePage` | `.back_label()` | `label: impl Into<String>` | The label on the way back from a licence, for an application in another language. |
| `LicensePage` | `.text_style()` | `style: TextStyle` | The type the licence text is set in. |
| `LicensePage` | `.width()` | `width: f32` | An explicit width. |
| `LicensePage` | `.flex()` | `grow: f32` | The share of a parent flex's spare room the page takes. |

## Behaviour

### `AboutDialog`

**The box that says what this application is**, with a way through to the licences.

A name, a version, an icon, a legal line, and two buttons: one to the licences, one to close. It is an `crate::AlertDialog` underneath, so everything an alert dialog can be told, this can be told too.

### `AboutListTile`

**The row that opens the about box**, for a settings screen or a drawer.

### `LicensePage`

**The licences of everything an application links**, as a page.

A list of packages, each with the licences covering it; selecting one shows the text. The selection is the **application's**, like every other piece of state here, so the page fits a route as easily as a panel: `on_select(Some(i))` on a row, and `on_select(None)` from the way back.

It does not scroll itself, and it does not guess how tall it is: put it in a `crate::SingleChildScrollView`, or in a scaffold's scrolling body, which is where a page belongs anyway.

```rust
LicensePage::new(app.licence_open, Msg::OpenLicence)
    .application("Tasks")
    .version("1.4.0")
    .legalese("© 2026 Someone")
    .build()
```

## See also

- [Dialog](./dialog.md): the modal surface on its own, with any content in it.
- [SimpleDialog](./simple-dialog.md): a modal list of choices, answered by picking one.
- [SnackBar & ScaffoldMessenger](./snack-bar.md): a short message at the bottom of the screen that goes away by itself.
- [BottomSheet](./bottom-sheet.md): a modal panel sliding up from the bottom, for contextual actions.
- [DraggableScrollableSheet](./draggable-scrollable-sheet.md): a panel along the bottom that follows the finger between resting heights.
- The guide: [Screens, navigation and dialogs](/docs/guide/navigation)
- API reference: [`AboutDialog`](https://docs.rs/frus/latest/frus/struct.AboutDialog.html)
- API reference: [`AboutListTile`](https://docs.rs/frus/latest/frus/struct.AboutListTile.html)
- API reference: [`LicensePage`](https://docs.rs/frus/latest/frus/struct.LicensePage.html)

Source: [crates/frus-widgets/src/licenses.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/licenses.rs#L516-L526), [crates/frus-widgets/src/licenses.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/licenses.rs#L651-L657), [crates/frus-widgets/src/licenses.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/licenses.rs#L283-L295) @ `4b802dae875c`
