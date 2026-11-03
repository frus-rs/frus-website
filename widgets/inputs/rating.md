---
title: "Rating"
sidebar_label: "Rating"
sidebar_position: 13
description: "A score given by tapping stars."
custom_edit_url: null
---

# `Rating`

## Purpose

A score given by tapping stars.

## Signature

```rust
pub struct Rating<Msg = crate::callback::Callback> { .. }

impl Rating {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        value: u32,
        max: u32,
        on_rate: impl Fn(u32) -> R1 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the Rating demo](/preview/rating.light.png)

From [`frus-examples/widgets/src/features/inputs/widgets/rating.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/inputs/widgets/rating.rs):

```rust
//! `Rating` — a score given by tapping stars.

use frus::{Rating, State, StateContext, StatefulWidget, Text, Widget};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(RatingDemo.into_widget())
}

struct RatingDemo;

struct RatingDemoState {
    stars: u32,
    tens: u32,
}

impl StatefulWidget for RatingDemo {
    type State = RatingDemoState;

    fn create_state(&self) -> RatingDemoState {
        RatingDemoState { stars: 3, tens: 7 }
    }
}

impl State for RatingDemoState {
    type Widget = RatingDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        sections(vec![
            // The current value, the number of stars, and what to do with a tap.
            Box::new(section(
                "Out of five",
                Rating::new(
                    self.stars,
                    5,
                    cx.handler(|s: &mut RatingDemoState, v: u32| s.stars = v),
                ),
            )),
            Box::new(Text::new(format!("You gave {} of 5", self.stars))),
            Box::new(section(
                "Out of ten",
                Rating::new(
                    self.tens,
                    10,
                    cx.handler(|s: &mut RatingDemoState, v: u32| s.tens = v),
                ),
            )),
            // A read-only score: shown, not changed.
            Box::new(section(
                "Read-only",
                Rating::new(4, 5, cx.handler(|_: &mut RatingDemoState, _: u32| {})).enabled(false),
            )),
        ])
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.enabled()` | `enabled: bool` | Whether the rating can be changed. Disabled it is **inert** - no star takes a press or the focus - and it still shows the score, because read-only is not invisible. |

## Behaviour

A star rating: `value` out of `max`.

## See also

- [Slider](./slider.md): a value picked by dragging along a track, continuous or in steps.
- [RangeSlider](./range-slider.md): two thumbs on one track, for picking an interval.
- [Stepper](./stepper.md): a whole number with − and + buttons on either side.
- [DatePicker](./date-picker.md): a month calendar: one day, allowed days only, or a range.
- [TimePicker & TimeRange](./time-picker.md): a time of day from an hour grid and a minute grid; or a start and an end.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`Rating`](https://docs.rs/frus/latest/frus/struct.Rating.html)

Source: [crates/frus-widgets/src/rating.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/rating.rs#L85-L91) @ `e6fba33f5b42`
