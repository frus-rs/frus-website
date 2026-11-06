---
title: "StatefulWidget & State"
sidebar_label: "StatefulWidget & State"
sidebar_position: 2
description: "State kept between rebuilds, and its lifecycle: init, update, dispose."
custom_edit_url: null
---

# `StatefulWidget` and `State`

## Purpose

State kept between rebuilds, and its lifecycle: init, update, dispose.

## Signature

```rust
pub trait StatefulWidget: 'static { .. }
```

```rust
pub trait State: Sized + 'static { .. }
```

## Example

![Rendered preview of the StatefulWidget & State demo](/preview/stateful-widget.light.png)

From [`frus-examples/widgets/src/features/state/widgets/stateful_widget.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/state/widgets/stateful_widget.rs):

```rust
//! `StatefulWidget` and its `State`: the lifecycle: `create_state` and `init_state` once,
//! `did_update_widget` whenever the parent hands down a new configuration, `build` on
//! every rebuild, and `dispose` when the widget leaves the screen.
//!
//! The widget is the **configuration**, made again on every rebuild; the state is what
//! the framework keeps between them.

use frus::{
    component, Align, Button, Column, Container, Row, State, StateContext, StatefulWidget, Text,
    UseState, Variant, Widget, Wrap,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        let log = cx.use_state(Vec::<String>::new);
        let colour = cx.use_state(|| 0_usize);
        let shown = cx.use_state(|| true);
        let scheme = &cx.theme().scheme;

        let (next, flip, clear) = (colour.clone(), shown.clone(), log.clone());
        // A `Wrap`, not a `Row`: three buttons are wider than a phone.
        let controls = Wrap::new()
            .gap(8.0)
            .run_gap(8.0)
            .child(
                // A new configuration for the same widget: `did_update_widget`.
                Button::new("Change its label")
                    .variant(Variant::Tonal)
                    .on_press(move || next.update(|i| *i = (*i + 1) % LABELS.len())),
            )
            .child(
                // Out of the tree and back: `dispose`, then a fresh `init_state`.
                Button::new(if shown.get() {
                    "Remove it"
                } else {
                    "Put it back"
                })
                .variant(Variant::Outlined)
                .on_press(move || flip.update(|on| *on = !*on)),
            )
            .child(
                Button::new("Clear log")
                    .variant(Variant::Text)
                    .on_press(move || clear.set(Vec::new())),
            );

        let child: Box<dyn Widget> = if shown.get() {
            Box::new(
                Tally {
                    label: LABELS[colour.get()],
                    log: log.clone(),
                }
                .into_widget(),
            )
        } else {
            Box::new(Text::new("(removed)").size(13.0))
        };

        let lines = log.get().into_iter().rev().take(8).fold(
            Column::new()
                .spacing(2.0)
                .cross_axis_alignment(Align::Start),
            |column, line| column.child(Text::new(line).size(13.0)),
        );

        sections(vec![
            Box::new(section("Controls", controls)),
            Box::new(section("The stateful widget", child)),
            Box::new(section(
                "Lifecycle log, newest first",
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

const LABELS: [&str; 3] = ["Apples", "Pears", "Plums"];

/// The configuration: a label, and where to write the lifecycle down.
struct Tally {
    label: &'static str,
    log: UseState<Vec<String>>,
}

/// What survives rebuilds: the count. It also keeps the log, because `dispose` is given
/// nothing else.
struct TallyState {
    count: u32,
    log: UseState<Vec<String>>,
}

impl TallyState {
    fn write(&self, line: String) {
        self.log.update(|log| log.push(line));
    }
}

impl StatefulWidget for Tally {
    type State = TallyState;

    fn create_state(&self) -> TallyState {
        TallyState {
            count: 0,
            log: self.log.clone(),
        }
    }
}

impl State for TallyState {
    type Widget = Tally;

    fn init_state(&mut self, cx: &StateContext<Self>) {
        self.write(format!("init_state ({})", cx.widget().label));
    }

    fn did_update_widget(&mut self, old: &Tally, cx: &StateContext<Self>) {
        // Called on every rebuild of the parent; compare to see what actually changed.
        let new = cx.widget().label;
        if old.label != new {
            self.write(format!("did_update_widget: {} → {new}", old.label));
        }
    }

    fn dispose(&mut self) {
        self.write(format!("dispose (count was {})", self.count));
    }

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        let scheme = &cx.theme().scheme;
        Box::new(
            Row::new()
                .spacing(12.0)
                .cross_axis_alignment(Align::Center)
                .child(
                    Container::new()
                        .padding(12.0)
                        .radius(8.0)
                        .color(scheme.secondary_container)
                        .child(
                            Text::new(format!("{}: {}", cx.widget().label, self.count))
                                .color(scheme.on_secondary_container),
                        ),
                )
                .child(
                    Button::new("+1")
                        .variant(Variant::Tonal)
                        .on_press(cx.callback(|s| s.count += 1)),
                ),
        )
    }
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

### `StatefulWidget`

A widget whose `State` outlives the rebuilds. The widget is only the configuration: it is made again on every rebuild, and the state is what is kept.

### `State`

What a `StatefulWidget` keeps, and how it draws itself from it.

## See also

- [StatelessWidget & component](./stateless-widget.md): a piece of interface built from its configuration, as a struct or a closure.
- [use_state, use_ref & use_memo](./hooks.md): state kept by a function component, with no struct to declare.
- [use_effect](./use-effect.md): work done after a build, rerun when its dependencies change, with a cleanup.
- [use_interval](./use-interval.md): a timer owned by a component, on for as long as builds ask for it.
- The guide: [Starting a frus application](/docs/getting-started)
- API reference: [`StatefulWidget`](https://docs.rs/frus/latest/frus/trait.StatefulWidget.html)
- API reference: [`State`](https://docs.rs/frus/latest/frus/trait.State.html)

Source: [crates/frus-widgets/src/component.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/component.rs#L1029-L1043), [crates/frus-widgets/src/component.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/component.rs#L1046-L1095) @ `e6fba33f5b42`
