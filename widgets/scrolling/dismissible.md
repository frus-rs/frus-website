---
title: "Dismissible"
sidebar_label: "Dismissible"
sidebar_position: 7
description: "Swipe a row aside to archive or delete it."
custom_edit_url: null
---

# `Dismissible`

## Purpose

Swipe a row aside to archive or delete it.

## Signature

```rust
pub struct Dismissible<Msg = crate::callback::Callback> { .. }

impl Dismissible {
    pub fn new(child: impl Widget<Msg> + 'static) -> Self;
}
```

## Example

![Rendered preview of the Dismissible demo](/preview/dismissible.light.png)

From [`frus-examples/widgets/src/features/scrolling/widgets/dismissible.rs`](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/frus-examples/widgets/src/features/scrolling/widgets/dismissible.rs):

```rust
//! `Dismissible` — swipe a row aside to remove it (or archive it). The row slides out,
//! its gap closes, then the app is told and drops the item from its list.

use frus::{
    keyed, Align, Button, Color, Colors, Column, Container, Icon, Icons, Justify, ListTile, Row,
    Text, Variant, Widget,
};

use crate::common::shared::{section, sections};

const INBOX: [&str; 5] = [
    "Lunch on Friday?",
    "Your invoice is ready",
    "Weekly report",
    "New comment on your post",
    "Password changed",
];

pub fn example() -> Box<dyn Widget> {
    Box::new(frus::component(|cx| {
        // Indices into `INBOX` still shown, and what happened last.
        let mail = cx.use_state(|| (0..INBOX.len()).collect::<Vec<usize>>());
        let last = cx.use_state(|| "Swipe a message left or right".to_string());

        let rows = mail.get().into_iter().fold(
            Column::new().cross_axis_alignment(Align::Stretch),
            |column, id| {
                let (archive, delete) = (mail.clone(), mail.clone());
                let (said_archive, said_delete) = (last.clone(), last.clone());
                // One message per direction. Swiping towards the end (rightwards here)
                // shows `background`; the other way shows `secondary_background`.
                let row = frus::Dismissible::new(
                    Container::new().color(Colors::WHITE).child(
                        ListTile::new()
                            .leading(Icon::new(Icons::MAIL))
                            .title(INBOX[id]),
                    ),
                )
                .width(320.0)
                .height(56.0)
                .background(strip(Icons::ARCHIVE, "Archive", "#16A34A", Justify::Start))
                .secondary_background(strip(Icons::DELETE, "Delete", "#DC2626", Justify::End))
                .on_dismiss_to_end(move || {
                    archive.update(|m| m.retain(|&i| i != id));
                    said_archive.set(format!("Archived “{}”", INBOX[id]));
                })
                .on_dismiss_to_start(move || {
                    delete.update(|m| m.retain(|&i| i != id));
                    said_delete.set(format!("Deleted “{}”", INBOX[id]));
                });
                // A key per item: when a row goes, the ones after it move up, and the key
                // keeps each row's swipe state with its own message.
                column.child(keyed(id, row))
            },
        );

        let restore = mail.clone();
        sections(vec![
            Box::new(section("Inbox", Container::new().width(320.0).child(rows))),
            Box::new(Text::new(last.get()).color(cx.theme().muted)),
            Box::new(
                Button::new("Restore all")
                    .variant(Variant::Outlined)
                    .on_press(move || restore.set((0..INBOX.len()).collect())),
            ),
        ])
    }))
}

/// What shows behind a row as it slides: a colour, an icon and a word.
fn strip(icon: frus::IconData, label: &str, hex: &str, side: Justify) -> Container {
    Container::new()
        .color(Color::hex(hex))
        .padding_each(0.0, 16.0, 0.0, 16.0)
        .child(
            Row::new()
                .main_axis_alignment(side)
                .spacing(8.0)
                .child(Icon::new(icon).color(Colors::WHITE))
                .child(Text::new(label).color(Colors::WHITE)),
        )
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.on_dismiss()` | `message: impl Into<Msg>` | The message dispatched once the item has flown out **and** its gap has closed, whichever way it went. |
| `.on_dismiss_to_start()` | `message: impl Into<Msg>` | The message for a swipe towards the reading start, overriding `on_dismiss` for that direction. |
| `.on_dismiss_to_end()` | `message: impl Into<Msg>` | The message for a swipe towards the reading end. |
| `.axis()` | `axis: DismissAxis` | Which ways the item may be swiped; horizontal by default. |
| `.threshold()` | `threshold: f32` | Fraction of the extent a drag must cover to dismiss on release. |
| `.background()` | `background: impl Widget<Msg> + 'static` | What shows behind the item as it slides away. |
| `.secondary_background()` | `background: impl Widget<Msg> + 'static` | What shows behind the item when it goes the **other** way. Requires a `background` first, which covers the first direction. |
| `.width()` | `width: f32` | Sets the width, in logical pixels. |
| `.height()` | `height: f32` | Sets the height, in logical pixels. |
| `.flex()` | `grow: f32` | Flex growth factor along the parent's main axis. |

## Behaviour

Swipe an item aside to remove it.

```rust
Dismissible::new(row)
    .height(56.0)
    .on_dismiss(Msg::Delete(id))
    .background(Container::new().color(theme.error))
```

The background is revealed as the item slides off it. Give a `secondary_background` to show something different in each direction — the usual "archive one way, delete the other".

Wrap each item in a `crate::Keyed` when the list can reorder: the retained dismissal state is keyed by identity, and positional identity would hand a half-swiped state to whichever row moved into that slot.

## See also

- [CarouselView](./carousel-view.md): one slide at a time between arrows, controlled by the app.
- [ReorderableList](./reorderable-list.md): a list whose rows can be dragged into a new order.
- [ExpansionTile](./expansion-tile.md): a list row that opens to show more; several make an accordion.
- [ExpansionPanelList](./expansion-panel-list.md): panels drawn as one surface that splits apart as one opens.
- [StickyHeader](./sticky-header.md): section headers that stay at the top while their section is in view.
- The guide: [Lists and grids](/docs/guide/lists)
- API reference: [`Dismissible`](https://docs.rs/frus/latest/frus/struct.Dismissible.html)

Source: [crates/frus-widgets/src/dismiss.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/dismiss.rs#L366-L379) @ `d7214f545435`
