---
title: "StatelessWidget & component"
sidebar_label: "StatelessWidget & component"
sidebar_position: 1
description: "A piece of interface built from its configuration, as a struct or a closure."
custom_edit_url: null
---

# `StatelessWidget` and `component`

## Purpose

A piece of interface built from its configuration, as a struct or a closure.

## Signature

```rust
pub trait StatelessWidget: 'static { .. }
```

```rust
pub fn component(build: impl Fn(&BuildContext) -> Box<dyn Widget> + 'static) -> Component
```

## Example

![Rendered preview of the StatelessWidget & component demo](/preview/stateless-widget.light.png)

From [`frus-examples/widgets/src/features/state/widgets/stateless_widget.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/state/widgets/stateless_widget.rs):

```rust
//! `StatelessWidget`, `component` and `Builder`: a piece of interface pulled out into a
//! widget of its own, built from its configuration and nothing else.
//!
//! A struct with `build`, made again (cheaply) on every rebuild of its parent; or, for a
//! one-off, a closure: `frus::component(|cx| ..)`, which can also keep state with hooks.

use frus::{
    component, Align, BuildContext, Builder, Column, Container, Row, StatelessWidget, Text, Widget,
};

use crate::common::shared::{section, sections};

/// A reusable badge: what it shows is its configuration.
struct StatusBadge {
    label: &'static str,
    ok: bool,
}

impl StatelessWidget for StatusBadge {
    fn build(&self, cx: &BuildContext) -> Box<dyn Widget> {
        // The context gives the theme it is built under.
        let scheme = &cx.theme().scheme;
        let (background, foreground) = if self.ok {
            (scheme.primary_container, scheme.on_primary_container)
        } else {
            (scheme.error_container, scheme.on_error_container)
        };
        Box::new(
            Container::new()
                .padding(8.0)
                .radius(16.0)
                .color(background)
                .child(Text::new(self.label).size(13.0).color(foreground)),
        )
    }
}

pub fn example() -> Box<dyn Widget> {
    sections(vec![
        // `.into_widget()` turns the struct into a widget for any child slot.
        Box::new(section(
            "A StatelessWidget struct, configured three times",
            Row::new()
                .spacing(8.0)
                .child(
                    StatusBadge {
                        label: "Build passing",
                        ok: true,
                    }
                    .into_widget(),
                )
                .child(
                    StatusBadge {
                        label: "Tests passing",
                        ok: true,
                    }
                    .into_widget(),
                )
                .child(
                    StatusBadge {
                        label: "Lint failing",
                        ok: false,
                    }
                    .into_widget(),
                ),
        )),
        // A closure is a component too. `Builder::new` is the same thing under another
        // name: a place in the tree with a context of its own.
        Box::new(section(
            "A closure: component(|cx| ..) / Builder::new(|cx| ..)",
            Column::new()
                .spacing(8.0)
                .cross_axis_alignment(Align::Start)
                .child(component(|cx| {
                    Box::new(Text::new("Built by a closure").color(cx.theme().primary))
                }))
                .child(Builder::new(|cx| {
                    Box::new(
                        Text::new(format!("Theme brightness: {:?}", cx.theme().brightness()))
                            .size(13.0),
                    )
                })),
        )),
    ])
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

### `StatelessWidget`

A widget with nothing to remember: it says what it looks like from what it is configured with, and from nothing else.

Any `Fn(&BuildContext) -> Box<dyn Widget>` is one, which is how a function becomes a component, and, with hooks, one that remembers.

### `component`

A component made of a function: `component(|cx| …)`. The closure is called whenever the tree is rebuilt, and may call hooks.

```rust
use frus_widgets::{component, text};

let clock = component(|cx| {
    let ticks = cx.use_state(|| 0);
    Box::new(text(format!("{} ticks", ticks.get())))
});
```

## See also

- [StatefulWidget & State](./stateful-widget.md): state kept between rebuilds, and its lifecycle: init, update, dispose.
- [use_state, use_ref & use_memo](./hooks.md): state kept by a function component, with no struct to declare.
- [use_effect](./use-effect.md): work done after a build, rerun when its dependencies change, with a cleanup.
- The guide: [Starting a frus application](/docs/getting-started)
- API reference: [`StatelessWidget`](https://docs.rs/frus/latest/frus/trait.StatelessWidget.html)
- API reference: [`component`](https://docs.rs/frus/latest/frus/fn.component.html)

Source: [crates/frus-widgets/src/component.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/component.rs#L1000-L1012), [crates/frus-widgets/src/component.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/component.rs#L1475-L1477) @ `e6fba33f5b42`
