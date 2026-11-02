---
title: "use_effect"
sidebar_label: "use_effect"
sidebar_position: 4
description: "Work done after a build, rerun when its dependencies change, with a cleanup."
custom_edit_url: null
---

# use_effect

## Purpose

Work done after a build, rerun when its dependencies change, with a cleanup.

## Signature

This demo shows a pattern rather than one type. The names it uses are in the example below, and each one is in the [API reference](https://docs.rs/frus).

## Example

![Rendered preview of the use_effect demo](/preview/use-effect.light.png)

From [`frus-examples/widgets/src/features/state/widgets/use_effect.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/state/widgets/use_effect.rs):

```rust
//! `use_effect` — work to do **after** a build: subscribe, start something, write a log.
//! It runs again only when its dependencies change, and the closure it returns (the
//! cleanup) runs before the next run and when the component leaves the screen.

use frus::{
    component, Align, Button, Column, Component, Container, Row, Text, UseState, Variant, Widget,
};

use crate::common::shared::{section, sections};

/// How many lines of the log are shown.
const LINES: usize = 8;

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        let log = cx.use_state(Vec::<String>::new);
        let mounted = cx.use_state(|| true);
        let count = cx.use_state(|| 0_u32);
        let scheme = &cx.theme().scheme;

        let (flip, add, clear) = (mounted.clone(), count.clone(), log.clone());
        let controls = Row::new()
            .spacing(8.0)
            .child(
                Button::new(if mounted.get() {
                    "Remove child"
                } else {
                    "Add child"
                })
                .variant(Variant::Tonal)
                .on_press(move || flip.update(|on| *on = !*on)),
            )
            .child(
                Button::new("Count + 1")
                    .variant(Variant::Outlined)
                    .on_press(move || add.update(|n| *n += 1)),
            )
            .child(
                Button::new("Clear log")
                    .variant(Variant::Text)
                    .on_press(move || clear.set(Vec::new())),
            );

        let mut child = Column::new();
        if mounted.get() {
            child = child.child(watcher(count.get(), log.clone()));
        } else {
            child = child.child(Text::new("(no child)").size(13.0));
        }

        let lines = log.get().into_iter().rev().take(LINES).fold(
            Column::new()
                .spacing(2.0)
                .cross_axis_alignment(Align::Start),
            |column, line| column.child(Text::new(line).size(13.0)),
        );

        sections(vec![
            Box::new(section("Controls", controls)),
            Box::new(section("The child component", child)),
            Box::new(section(
                "Log, newest first",
                Container::new()
                    .width(300.0)
                    .padding(12.0)
                    .radius(8.0)
                    .color(scheme.surface_container)
                    .child(lines),
            )),
        ])
    }))
}

/// A child with two effects, writing to its parent's log.
fn watcher(count: u32, log: UseState<Vec<String>>) -> Component {
    component(move |cx| {
        // `()` as the dependencies: once when the component appears; the returned closure
        // runs when it goes.
        let on_mount = log.clone();
        cx.use_effect((), move || {
            on_mount.update(|log| log.push("effect: mounted".to_string()));
            move || on_mount.update(|log| log.push("cleanup: unmounted".to_string()))
        });

        // Keyed on `count`: runs after each build where the count changed, cleaning up
        // the previous run first.
        let on_count = log.clone();
        cx.use_effect(count, move || {
            on_count.update(|log| log.push(format!("effect: count is {count}")));
            move || on_count.update(|log| log.push(format!("cleanup: count was {count}")))
        });

        Box::new(Text::new(format!("I am mounted; count = {count}")))
    })
}
```

## Properties

See the example.

## Behaviour

The example shows it at work; the API reference has every method.

## See also

- [StatefulWidget & State](./stateful-widget.md): state kept between rebuilds, and its lifecycle: init, update, dispose.
- [use_state, use_ref & use_memo](./hooks.md): state kept by a function component, with no struct to declare.
- [use_interval](./use-interval.md): a timer owned by a component, on for as long as builds ask for it.
- [ValueNotifier, ChangeNotifier & their builders](./value-notifier.md): state outside the widgets that tells whoever cares when it changed.
- [use_future & FutureBuilder](./future-builder.md): work that finishes later: waiting, then the result.
- The guide: [Starting a frus application](/docs/getting-started)

Source: [frus-examples/widgets/src/features/state/widgets/use_effect.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/state/widgets/use_effect.rs) @ `4b802dae875c`
