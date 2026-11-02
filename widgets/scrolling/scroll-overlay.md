---
title: "ScrollOverlay"
sidebar_label: "ScrollOverlay"
sidebar_position: 15
description: "Something drawn over a scroll region, rebuilt from its offset."
custom_edit_url: null
---

# `ScrollOverlay`

## Purpose

Something drawn over a scroll region, rebuilt from its offset.

## Signature

```rust
pub struct ScrollOverlay<Msg = crate::callback::Callback> { .. }

impl ScrollOverlay {
    pub fn new<W: Widget<Msg> + 'static>(
        body: impl Widget<Msg> + 'static,
        build: impl Fn((f32, f32), Size) -> W + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the ScrollOverlay demo](/preview/scroll-overlay.light.png)

From [`frus-examples/widgets/src/features/scrolling/widgets/scrolloverlay.rs`](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/frus-examples/widgets/src/features/scrolling/widgets/scrolloverlay.rs):

```rust
//! `ScrollOverlay` — something drawn over a scroll region and rebuilt from its offset in
//! the same frame: a shadow under a header once content slides beneath it, a rule that
//! fills as you read. (For state that must change — loading more — use `on_scroll`.)

use frus::{Color, Column, Container, ListTile, ListView, ScrollOverlay, Text, Widget};

use crate::common::shared::{section, sections};

const HEADER: f32 = 40.0;

pub fn example() -> Box<dyn Widget> {
    // The list leaves room at its top for the header drawn over it.
    let list = ListView::new(40, 48.0, |i| {
        ListTile::new().title(format!("Chapter {}", i + 1))
    })
    .padding_each(HEADER, 0.0, 0.0, 0.0)
    .width(320.0)
    .height(300.0);

    // The builder gets the offset `(x, y)` and the overlay's box. It runs every frame the
    // list moves, so keep it cheap and give it no state of its own.
    let overlay = ScrollOverlay::new(list, |(_, y), area| {
        let shadow = (y / 24.0).clamp(0.0, 1.0) * 0.25;
        let header = Container::new()
            .width(area.width)
            .height(HEADER)
            .color(Color::hex("#F4F4F5"))
            .padding_each(10.0, 16.0, 0.0, 16.0)
            .shadows([frus::BoxShadow::new(
                0.0,
                2.0,
                6.0,
                Color::rgba(0.0, 0.0, 0.0, shadow),
            )])
            .child(Text::new(format!("Contents — {y:.0} px down")));
        Column::new().child(header)
    });

    sections(vec![Box::new(section(
        "A header whose shadow appears as the list scrolls",
        Container::new()
            .border(1.0, Color::hex("#A1A1AA"))
            .child(overlay),
    ))])
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

A scroll region with something drawn over it that knows where it has got to.

The region is the **child**, which is the whole of the identity design: the offset this reads is its own child's, so nothing has to be named, looked up, or kept in step. A builder floating free of the region it watches would need one of those three, and each of them can go stale without saying so.

## See also

- [RefreshIndicator](./refresh-indicator.md): pull a list down past its top to refresh it.
- [Programmatic scrolling](./scroll-to.md): read where a list is with on_scroll, and move it with scroll_to.
- [Scroll physics & scrollbars](./scroll-behavior.md): edge physics, scrollbars and overscroll, per scrollable or per subtree.
- The guide: [Lists and grids](/docs/guide/lists)
- API reference: [`ScrollOverlay`](https://docs.rs/frus/latest/frus/struct.ScrollOverlay.html)

Source: [crates/frus-widgets/src/scrolloverlay.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/scrolloverlay.rs#L77-L82) @ `d7214f545435`
