---
title: "use_stream & StreamBuilder"
sidebar_label: "use_stream & StreamBuilder"
sidebar_position: 8
description: "Work that gives several values as it goes, then finishes."
custom_edit_url: null
---

# `StreamBuilder`

## Purpose

Work that gives several values as it goes, then finishes.

## Signature

```rust
pub struct StreamBuilder;
```

## Example

![Rendered preview of the use_stream & StreamBuilder demo](/preview/stream-builder.light.png)

From [`frus-examples/widgets/src/features/state/widgets/stream_builder.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/state/widgets/stream_builder.rs):

```rust
//! `use_stream` and `StreamBuilder` — work that gives **several** values as it goes: a
//! progress, a feed, messages. The work is handed a `StreamSink` and `add`s each value;
//! the component shows the latest one, then knows when the work is done.

use frus::{
    component, Align, AsyncSnapshot, Button, Column, ConnectionState, LinearProgressIndicator,
    StreamBuilder, Text, Variant, Widget,
};

use crate::common::shared::{section, sections};

/// The work is split in this many steps, each reported.
pub const STEPS: u32 = 40;
/// How far each step searches.
pub const PER_STEP: u64 = 4_000;

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        // The run number is the dependency: bumping it starts the work again.
        let run = cx.use_state(|| 0_u32);
        let snapshot = cx.use_stream(run.get(), |sink| async move {
            let mut found = 0;
            for step in 0..STEPS {
                let start = u64::from(step) * PER_STEP;
                found += (start..start + PER_STEP).filter(|&n| is_prime(n)).count();
                sink.add(Progress {
                    done: step + 1,
                    found,
                });
            }
        });

        let again = run.clone();
        sections(vec![
            Box::new(section(
                "cx.use_stream: search primes, reporting each step",
                Column::new()
                    .spacing(12.0)
                    .cross_axis_alignment(Align::Start)
                    .child(show(&snapshot))
                    .child(
                        Button::new("Run again")
                            .variant(Variant::Tonal)
                            .on_press(move || again.update(|n| *n += 1)),
                    ),
            )),
            // The same as a widget. Here the stream is a countdown.
            Box::new(section(
                "StreamBuilder",
                StreamBuilder::new(
                    (),
                    |_: &(), sink| async move {
                        for left in (0..=5).rev() {
                            sink.add(left);
                        }
                    },
                    |_, snapshot: AsyncSnapshot<i32>| {
                        Box::new(Text::new(match (snapshot.state, snapshot.data) {
                            (ConnectionState::Done, _) => "Lift-off".to_string(),
                            (_, Some(left)) => format!("{left}…"),
                            (_, None) => "Waiting".to_string(),
                        }))
                    },
                ),
            )),
        ])
    }))
}

#[derive(Clone, Copy)]
pub struct Progress {
    done: u32,
    found: usize,
}

pub fn show(snapshot: &AsyncSnapshot<Progress>) -> Box<dyn Widget> {
    let progress = snapshot.data.map_or(0.0, |p| p.done as f32 / STEPS as f32);
    let label = match (snapshot.state, snapshot.data) {
        (ConnectionState::Waiting, _) | (_, None) => "Starting…".to_string(),
        (ConnectionState::Active, Some(p)) => {
            format!("Step {}/{STEPS}: {} primes so far", p.done, p.found)
        }
        (ConnectionState::Done, Some(p)) => {
            format!(
                "Done: {} primes below {}",
                p.found,
                u64::from(STEPS) * PER_STEP
            )
        }
    };
    Box::new(
        Column::new()
            .spacing(8.0)
            .cross_axis_alignment(Align::Start)
            .child(LinearProgressIndicator::new(progress).width(260.0))
            .child(Text::new(label)),
    )
}

/// Trial division: slow on purpose, so the steps can be seen.
pub fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    let mut d = 2;
    while d * d <= n {
        if n.is_multiple_of(d) {
            return false;
        }
        d += 1;
    }
    true
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

The example shows it at work; the API reference has every method.

## See also

- [ValueNotifier, ChangeNotifier & their builders](./value-notifier.md): state outside the widgets that tells whoever cares when it changed.
- [use_future & FutureBuilder](./future-builder.md): work that finishes later: waiting, then the result.
- [host::spawn & host::after](./host-spawn.md): slow work on another thread, and something to do after a delay.
- [keyed & Keyed](./keyed.md): a stable identity, so a widget's state follows it when siblings move.
- [Theme](./theme.md): reading the theme's colours and type, and switching light and dark.
- The guide: [Starting a frus application](/docs/getting-started)
- API reference: [`StreamBuilder`](https://docs.rs/frus/latest/frus/struct.StreamBuilder.html)

Source: [crates/frus-widgets/src/asyncbuild.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/asyncbuild.rs#L321-L321) @ `e6fba33f5b42`
