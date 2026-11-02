---
title: "Pagination"
sidebar_label: "Pagination"
sidebar_position: 14
description: "A page picker: previous, page numbers, next."
custom_edit_url: null
---

# `Pagination`

## Purpose

A page picker: previous, page numbers, next.

## Signature

```rust
pub struct Pagination<Msg = crate::callback::Callback> { .. }

impl Pagination {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        current: usize,
        total: usize,
        on_select: impl Fn(usize) -> R1 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the Pagination demo](/preview/pagination.light.png)

From [`frus-examples/widgets/src/features/navigation/widgets/pagination.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/navigation/widgets/pagination.rs):

```rust
//! `Pagination` — a page picker: previous, a window of page numbers, next. Pages are
//! counted from 1, and the current page is the app's state.

use frus::{Align, Column, Pagination, Text, Widget};

use crate::common::shared::{section, sections};

const TOTAL: usize = 20;

pub fn example() -> Box<dyn Widget> {
    Box::new(frus::component(|cx| {
        let page = cx.use_state(|| 1usize);
        let few = cx.use_state(|| 2usize);

        // A picker reports the page clicked; the app stores it and shows that page.
        let go = page.clone();
        let many = Pagination::new(page.get(), TOTAL, move |p: usize| {
            let go = go.clone();
            frus::Callback::new(move || go.set(p))
        });

        let go_few = few.clone();
        let short = Pagination::new(few.get(), 3, move |p: usize| {
            let go = go_few.clone();
            frus::Callback::new(move || go.set(p))
        });

        let first = (page.get() - 1) * 10 + 1;
        sections(vec![
            Box::new(section(
                "Many pages",
                Column::new()
                    .spacing(8.0)
                    .cross_axis_alignment(Align::Start)
                    .child(many)
                    .child(
                        Text::new(format!("Showing results {first}–{}", first + 9))
                            .color(cx.theme().muted),
                    ),
            )),
            Box::new(section("Three pages", short)),
            // Disabled: still shows where you are, but nothing can be picked.
            Box::new(section(
                "Disabled",
                Pagination::new(4, 9, |_| frus::Callback::new(|| {})).enabled(false),
            )),
        ])
    }))
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.enabled()` | `enabled: bool` | Whether pages can be picked. Disabled the whole strip is **inert** - no arrow, no number - and it still shows which page you are on. |

## Behaviour

A controlled page picker; pages are **1-indexed**.

## See also

- [CollapsingHeader](./collapsing-header.md): a tall header that shrinks to a toolbar as the page under it scrolls.
- [Steps](./steps.md): the numbered step indicator of a wizard or multi-step form.
- [TabPageSelector](./tab-page-selector.md): dots that say which of several pages you are on.
- The guide: [Screens, navigation and dialogs](/docs/guide/navigation)
- API reference: [`Pagination`](https://docs.rs/frus/latest/frus/struct.Pagination.html)

Source: [crates/frus-widgets/src/pagination.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/pagination.rs#L52-L58) @ `4b802dae875c`
