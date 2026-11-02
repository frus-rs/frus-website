---
title: "ListView"
sidebar_label: "ListView"
sidebar_position: 2
description: "A virtualised list: only the visible rows are built."
custom_edit_url: null
---

# `ListView`

## Purpose

A virtualised list: only the visible rows are built.

## Signature

```rust
pub struct ListView<Msg = crate::callback::Callback> { .. }

impl ListView {
    pub fn new<W: Widget<Msg> + 'static>(
        count: usize,
        item_extent: f32,
        build: impl Fn(usize) -> W + 'static,
    ) -> Self;
    pub fn builder<W: Widget<Msg> + 'static>(
        count: usize,
        build: impl Fn(usize) -> W + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the ListView demo](/preview/list-view.light.png)

From [`frus-examples/widgets/src/features/scrolling/widgets/listview.rs`](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/frus-examples/widgets/src/features/scrolling/widgets/listview.rs):

```rust
//! `ListView` — a virtualised list: only the rows on screen are built, laid out and
//! painted, so ten thousand rows cost what ten do. Every row has the same extent.

use frus::{
    Axis, CircleAvatar, Color, Column, Container, Icon, Icons, ListTile, ListView, Text, Widget,
};

use crate::common::shared::{section, sections};

const COUNT: usize = 10_000;

pub fn example() -> Box<dyn Widget> {
    Box::new(frus::component(|cx| {
        let tapped = cx.use_state(|| None::<usize>);

        // `ListView::new(count, extent, build)`: `build(index)` is called only for the
        // rows in view, every frame they are in view. So a row is a plain widget made
        // from the index — not a component with hooks of its own; state that a row
        // shows lives above the list, like `tapped` here.
        let on_tap = tapped.clone();
        let selected = tapped.get();
        let long_list = ListView::new(COUNT, 56.0, move |i| {
            let on_tap = on_tap.clone();
            ListTile::new()
                .leading(Icon::new(Icons::RECEIPT))
                .title(format!("Invoice #{}", i + 1))
                .subtitle(format!("{:.2} €", (i as f32 * 7.31) % 500.0))
                .selected(selected == Some(i))
                .on_tap(move || on_tap.set(Some(i)))
        })
        // A list is 200 px tall unless told otherwise; inside a scrolling page it must
        // have a bounded height.
        .height(280.0)
        .width(320.0);

        // `axis(Axis::Horizontal)` turns it on its side: the extent becomes a width.
        let shelf = ListView::new(50, 72.0, |i| {
            Container::new().padding(4.0).child(
                Column::new()
                    .spacing(4.0)
                    .child(CircleAvatar::initials(format!("User {}", i + 1)))
                    .child(Text::new(format!("#{}", i + 1)).size(12.0)),
            )
        })
        .axis(Axis::Horizontal)
        .height(80.0)
        .width(320.0);

        // `reverse()` starts at the end — the newest message at the bottom of a chat.
        let chat = ListView::new(30, 40.0, |i| {
            Container::new()
                .padding_each(4.0, 12.0, 4.0, 12.0)
                .child(Text::new(format!("Message {}", 30 - i)))
        })
        .reverse()
        .height(160.0)
        .width(320.0);

        sections(vec![
            Box::new(section("10 000 rows", framed(long_list))),
            Box::new(Text::new(match tapped.get() {
                Some(i) => format!("Tapped invoice #{}", i + 1),
                None => "Tap a row".to_string(),
            })),
            Box::new(section("Horizontal", framed(shelf))),
            Box::new(section("Reversed (starts at the end)", framed(chat))),
        ])
    }))
}

/// A thin outline, so the list's bounds show.
fn framed(list: ListView) -> Container {
    Container::new()
        .border(1.0, Color::hex("#A1A1AA"))
        .child(list)
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.estimated_extent()` | `extent: f32` | The extent to count an item at before any has been measured, for a list made by `ListView::builder`. 56 unless told; a guess close to the real rows keeps the scrollbar from changing its mind as they are measured. |
| `.axis()` | `axis: Axis` | Which way the list runs: down the screen (the default) or across it. |
| `.reverse()` | — | Builds **from the far end**: item 0 sits at the end the axis finishes at — the bottom of a vertical list, the trailing edge of a horizontal one — item 1 before it, and the list starts resting there. |
| `.padding()` | `padding: f32` | Insets the content, **inside** the viewport: the padding scrolls with what it surrounds rather than shrinking the window onto it. |
| `.padding_each()` | `top: f32, right: f32, bottom: f32, left: f32` | The same, one side at a time. |
| `.physics()` | `physics: ScrollPhysics` | Overrides how the list behaves at its edges and after a fling; see `crate::scroll::SingleChildScrollView::physics`. |
| `.primary()` | `primary: bool` | A primary view is always scrollable unless `physics` says otherwise: a drag moves it, and bounces or glows at its edge, even when everything is in sight, so a page that fits still answers the finger as a page. |
| `.width()` | `width: f32` | Sets the viewport width, in logical pixels. |
| `.height()` | `height: f32` | Sets the viewport height, in logical pixels. |
| `.flex()` | `grow: f32` | Flex growth factor along the parent's main axis. |
| `.on_scroll()` | `on_scroll: impl Fn(crate::ScrollPosition) -> R + 'static` | **Says where this list is** whenever it moves — a "back to top" button that appears once it has gone down, a "row 1 240 of 5 000", a load-more when the end comes into view. |
| `.notify_every()` | `px: f32` | Reports no more often than every `px` of movement — and **always** reports where it comes to rest, however short the last step was. |

## Behaviour

A virtualised list with a fixed item extent.

## See also

- [SingleChildScrollView](./single-child-scroll-view.md): makes one child scrollable: down, across or both ways.
- [GridView](./grid-view.md): cells in equal columns: a fixed count, as many as fit, or virtualised.
- [PageView](./page-view.md): a scrollable that always comes to rest on a page.
- [CarouselView](./carousel-view.md): one slide at a time between arrows, controlled by the app.
- The guide: [Lists and grids](/docs/guide/lists)
- API reference: [`ListView`](https://docs.rs/frus/latest/frus/struct.ListView.html)

Source: [crates/frus-widgets/src/list.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/list.rs#L165-L188) @ `d7214f545435`
