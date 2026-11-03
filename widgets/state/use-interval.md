---
title: "use_interval"
sidebar_label: "use_interval"
sidebar_position: 5
description: "A timer owned by a component, on for as long as builds ask for it."
custom_edit_url: null
---

# use_interval

## Purpose

A timer owned by a component, on for as long as builds ask for it.

## Signature

This demo shows a pattern rather than one type. The names it uses are in the example below, and each one is in the [API reference](https://docs.rs/frus).

## Example

![Rendered preview of the use_interval demo](/preview/use-interval.light.png)

From [`frus-examples/widgets/src/features/state/widgets/use_interval.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/state/widgets/use_interval.rs):

```rust
//! `use_interval` — a timer owned by a component: it ticks for as long as builds keep
//! asking for it, and stops by itself when a build does not (or the component goes).
//!
//! Unlike the other hooks it **may** be called conditionally: `if running { .. }` is
//! exactly how a timer is switched on and off.

use std::time::Duration;

use frus::{component, Align, Button, Column, FontWeight, Row, Text, Variant, Widget};

use crate::common::shared::{section, sections};

/// The tick, in tenths of a second.
const TICK: Duration = Duration::from_millis(100);

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        let tenths = cx.use_state(|| 0_u64);
        let running = cx.use_state(|| false);

        // Only while running: the next build without this call stops the timer.
        if running.get() {
            let tick = tenths.clone();
            cx.use_interval(TICK, move || tick.update(|t| *t += 1));
        }

        let t = tenths.get();
        let (toggle, reset) = (running.clone(), tenths.clone());
        let stop = running.clone();
        let display = Text::new(format!("{}:{:02}.{}", t / 600, (t / 10) % 60, t % 10))
            .size(40.0)
            .weight(FontWeight::Bold)
            .color(cx.theme().primary);

        sections(vec![Box::new(section(
            "A stopwatch",
            Column::new()
                .spacing(12.0)
                .cross_axis_alignment(Align::Start)
                .child(display)
                .child(
                    Row::new()
                        .spacing(8.0)
                        .child(
                            Button::new(if running.get() { "Pause" } else { "Start" })
                                .on_press(move || toggle.update(|on| *on = !*on)),
                        )
                        .child(Button::new("Reset").variant(Variant::Outlined).on_press(
                            move || {
                                stop.set(false);
                                reset.set(0);
                            },
                        )),
                ),
        ))])
    }))
}
```

## Properties

See the example.

## Behaviour

The example shows it at work; the API reference has every method.

## See also

- [use_state, use_ref & use_memo](./hooks.md): state kept by a function component, with no struct to declare.
- [use_effect](./use-effect.md): work done after a build, rerun when its dependencies change, with a cleanup.
- [ValueNotifier, ChangeNotifier & their builders](./value-notifier.md): state outside the widgets that tells whoever cares when it changed.
- [use_future & FutureBuilder](./future-builder.md): work that finishes later: waiting, then the result.
- [use_stream & StreamBuilder](./stream-builder.md): work that gives several values as it goes, then finishes.
- The guide: [Starting a frus application](/docs/getting-started)

Source: [frus-examples/widgets/src/features/state/widgets/use_interval.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/state/widgets/use_interval.rs) @ `e6fba33f5b42`
