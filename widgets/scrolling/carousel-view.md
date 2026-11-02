---
title: "CarouselView"
sidebar_label: "CarouselView"
sidebar_position: 5
description: "One slide at a time between arrows, controlled by the app."
custom_edit_url: null
---

# `CarouselView`

## Purpose

One slide at a time between arrows, controlled by the app.

## Signature

```rust
pub struct CarouselView<Msg = crate::callback::Callback> { .. }

impl CarouselView {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        index: usize,
        count: usize,
        on_change: impl Fn(usize) -> R1 + 'static,
        slide: impl Widget<Msg> + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the CarouselView demo](/preview/carousel-view.light.png)

From [`frus-examples/widgets/src/features/scrolling/widgets/carousel.rs`](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/frus-examples/widgets/src/features/scrolling/widgets/carousel.rs):

```rust
//! `CarouselView` — one slide at a time between ‹ and › arrows. It is controlled: the
//! app keeps the index and supplies the slide for it, so only one slide is ever built.

use frus::{CarouselView, Center, Color, Colors, Container, Text, Widget};

use crate::common::shared::{section, sections};

const SLIDES: [(&str, &str); 4] = [
    ("Mountains", "#0F766E"),
    ("Desert", "#B45309"),
    ("Forest", "#15803D"),
    ("Ocean", "#1D4ED8"),
];

pub fn example() -> Box<dyn Widget> {
    Box::new(frus::component(|cx| {
        let index = cx.use_state(|| 0usize);

        // The arrows report the index to go to (an arrow at an end is disabled); the
        // slide is whatever the app builds for the current index.
        let go = index.clone();
        let (name, hue) = SLIDES[index.get()];
        let carousel = CarouselView::new(
            index.get(),
            SLIDES.len(),
            move |i: usize| {
                let go = go.clone();
                frus::Callback::new(move || go.set(i))
            },
            Container::new()
                .height(160.0)
                .radius(12.0)
                .color(Color::hex(hue))
                .child(Center::new(Text::new(name).size(22.0).color(Colors::WHITE))),
        );

        sections(vec![
            Box::new(section(
                "Controlled carousel",
                Container::new().width(320.0).child(carousel),
            )),
            Box::new(Text::new(format!(
                "Slide {} of {}",
                index.get() + 1,
                SLIDES.len()
            ))),
        ])
    }))
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

A controlled carousel.

## See also

- [GridView](./grid-view.md): cells in equal columns: a fixed count, as many as fit, or virtualised.
- [PageView](./page-view.md): a scrollable that always comes to rest on a page.
- [ReorderableList](./reorderable-list.md): a list whose rows can be dragged into a new order.
- [Dismissible](./dismissible.md): swipe a row aside to archive or delete it.
- [ExpansionTile](./expansion-tile.md): a list row that opens to show more; several make an accordion.
- The guide: [Lists and grids](/docs/guide/lists)
- API reference: [`CarouselView`](https://docs.rs/frus/latest/frus/struct.CarouselView.html)

Source: [crates/frus-widgets/src/carousel.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/carousel.rs#L26-L28) @ `d7214f545435`
