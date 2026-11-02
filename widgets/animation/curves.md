---
title: "Curve"
sidebar_label: "Curve"
sidebar_position: 14
description: "The shape of a motion, separate from its duration."
custom_edit_url: null
---

# `Curve`

## Purpose

The shape of a motion, separate from its duration.

## Signature

```rust
pub enum Curve { .. }
```

## Example

![Rendered preview of the Curve demo](/preview/curves.light.png)

From [`frus-examples/widgets/src/features/animation/widgets/curves.rs`](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/frus-examples/widgets/src/features/animation/widgets/curves.rs):

```rust
//! `Curve` — the shape of a motion, separate from its duration. Every animated widget
//! takes one; `eased(progress, &curve)` applies one to a progress of your own.
//!
//! Below, one `AnimationController` loops from 0 to 1 and every dot reads the same linear
//! progress through a different curve.

use std::time::Duration;

use frus::{
    component, eased, Align, AnimationController, Column, Container, Curve, Positioned, Row, Stack,
    StackFit, Text, Widget,
};

use crate::common::shared::{section, sections};

/// How often the controller is advanced: about sixty times a second.
const FRAME: Duration = Duration::from_millis(16);
/// The track the dots run along, in logical pixels.
const TRACK: f32 = 200.0;
const DOT: f32 = 16.0;

/// The curves worth knowing, by the name a developer types.
fn curves() -> Vec<(&'static str, Curve)> {
    vec![
        ("Curve::Linear", Curve::Linear),
        ("Curve::ease()", Curve::ease()),
        ("Curve::ease_in()", Curve::ease_in()),
        ("Curve::ease_out()", Curve::ease_out()),
        ("Curve::ease_in_out()", Curve::ease_in_out()),
        ("Curve::Decelerate", Curve::Decelerate),
        ("Curve::critical_spring()", Curve::critical_spring()),
        (
            "ease_in_out_cubic_emphasized()",
            Curve::ease_in_out_cubic_emphasized(),
        ),
        // `Interval` runs a curve over part of the timeline only: staggered motion.
        (
            "Interval 0.5..1.0",
            Curve::Interval {
                begin: 0.5,
                end: 1.0,
                inner: Box::new(Curve::ease_out()),
            },
        ),
        // Your own: a cubic Bézier, as in CSS's `cubic-bezier()`. This one overshoots.
        (
            "Cubic (overshoot)",
            Curve::Cubic {
                x1: 0.34,
                y1: 1.56,
                x2: 0.64,
                y2: 1.0,
            },
        ),
    ]
}

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        // Started when it is made: a sawtooth from 0 to 1 every 1.6 s, for as long as the
        // demo is on screen.
        let controller = cx.use_ref(|| {
            let mut controller = AnimationController::unit();
            controller.repeat(1.6, false, Curve::Linear);
            controller
        });
        let progress = cx.use_state(|| 0.0_f32);
        if controller.with(AnimationController::is_animating) {
            let (driver, shown) = (controller.clone(), progress.clone());
            cx.use_interval(FRAME, move || {
                driver.update(|c| {
                    c.tick(FRAME.as_secs_f32());
                });
                shown.set(driver.with(AnimationController::value));
            });
        }

        let t = progress.get();
        let scheme = &cx.theme().scheme;
        let rows = curves().into_iter().fold(
            Column::new()
                .spacing(12.0)
                .cross_axis_alignment(Align::Start),
            |column, (name, curve)| {
                let x = eased(t, &curve) * (TRACK - DOT);
                column.child(
                    Column::new()
                        .spacing(4.0)
                        .cross_axis_alignment(Align::Start)
                        .child(Text::new(name).size(12.0).color(scheme.on_surface_variant))
                        .child(
                            Stack::new()
                                .width(TRACK)
                                .height(DOT)
                                .fit(StackFit::Expand)
                                .layer(
                                    Container::new()
                                        .radius(DOT / 2.0)
                                        .color(scheme.surface_container_highest),
                                )
                                .layer(
                                    Positioned::new(
                                        Container::new()
                                            .width(DOT)
                                            .height(DOT)
                                            .radius(DOT / 2.0)
                                            .color(scheme.primary),
                                    )
                                    .left(x)
                                    .top(0.0),
                                ),
                        ),
                )
            },
        );

        sections(vec![
            Box::new(section(
                "One progress, many curves",
                Row::new().child(Text::new(format!("progress {t:.2}")).size(13.0)),
            )),
            Box::new(rows),
        ])
    }))
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

An easing curve remapping `[0,1] → [0,1]`.

`f(0) = 0` and `f(1) = 1` hold for every variant.

## See also

- [Fade, Slide, Scale & Size transitions](./transitions.md): explicit transitions driven by a number the app owns: an AnimationController.
- [DecoratedBoxTransition & DefaultTextStyleTransition](./decorated-box-transition.md): a whole decoration or text style, part of the way from one to another.
- [Icon::animated & AnimatedIcons](./animated-icon.md): an icon that morphs between two marks: menu and close, play and pause.
- [Hero & page transitions](./hero.md): a shared element that flies between two pages during a transition.
- The guide: [Animation](/docs/guide/animation)
- API reference: [`Curve`](https://docs.rs/frus/latest/frus/enum.Curve.html)

Source: [crates/frus-core/src/animation/curve.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-core/src/animation/curve.rs#L15-L71) @ `d7214f545435`
