---
title: "DateTimeRange"
sidebar_label: "DateTimeRange"
sidebar_position: 18
description: "A date range over two months and a start and end time, for booking a slot."
custom_edit_url: null
---

# `DateTimeRange`

## Purpose

A date range over two months and a start and end time, for booking a slot.

## Signature

```rust
pub struct DateTimeRange<Msg = crate::callback::Callback> { .. }

impl DateTimeRange {
    pub fn new<
        R1: crate::callback::IntoMsg<Msg>,
        R2: crate::callback::IntoMsg<Msg>,
        R3: crate::callback::IntoMsg<Msg>,
    >(
        year: i32,
        month: u32,
        start_date: Option<(i32, u32, u32)>,
        end_date: Option<(i32, u32, u32)>,
        start_time: (u32, u32),
        end_time: (u32, u32),
        on_date: impl Fn((i32, u32, u32)) -> R1 + 'static,
        on_nav: impl Fn(i32) -> R2 + 'static,
        on_time: impl Fn(Endpoint, TimeField, u32) -> R3 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the DateTimeRange demo](/preview/date-time-range.light.png)

From [`frus-examples/widgets/src/features/inputs/widgets/date_time_range.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/inputs/widgets/date_time_range.rs):

```rust
//! `DateTimeRange` — two months side by side for a date range, a start and an end time
//! below, and a "start → end" summary on top. For booking a whole slot.

use frus::{
    Axis, Callback, DateTimeRange, Endpoint, SingleChildScrollView, State, StateContext,
    StatefulWidget, TimeField, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(BookingDemo.into_widget())
}

pub type Date = (i32, u32, u32);
pub type Time = (u32, u32);

/// The month `delta` months away from `(year, month)`.
pub fn shift_month(year: i32, month: u32, delta: i32) -> (i32, u32) {
    let index = year * 12 + month as i32 - 1 + delta;
    (index.div_euclid(12), index.rem_euclid(12) as u32 + 1)
}

pub struct BookingDemo;

pub struct BookingState {
    /// The first of the two months on show.
    shown: (i32, u32),
    pub start: Option<Date>,
    pub end: Option<Date>,
    start_time: Time,
    end_time: Time,
}

impl BookingState {
    /// First click: the start. Second click on or after it: the end. Anything else
    /// starts again.
    pub fn pick(&mut self, date: Date) {
        match (self.start, self.end) {
            (Some(start), None) if date >= start => self.end = Some(date),
            _ => {
                self.start = Some(date);
                self.end = None;
            }
        }
    }

    fn set_time(&mut self, endpoint: Endpoint, field: TimeField, value: u32) {
        let time = match endpoint {
            Endpoint::Start => &mut self.start_time,
            Endpoint::End => &mut self.end_time,
        };
        match field {
            TimeField::Hour => time.0 = value,
            TimeField::Minute => time.1 = value,
        }
    }
}

impl StatefulWidget for BookingDemo {
    type State = BookingState;

    fn create_state(&self) -> BookingState {
        BookingState {
            shown: (2026, 10),
            start: Some((2026, 10, 28)),
            end: Some((2026, 11, 3)),
            start_time: (9, 0),
            end_time: (17, 30),
        }
    }
}

impl State for BookingState {
    type Widget = BookingDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        // The calendar reports **whole dates**, since a click can land in either month.
        let picker = DateTimeRange::new(
            self.shown.0,
            self.shown.1,
            self.start,
            self.end,
            self.start_time,
            self.end_time,
            cx.handler(|s: &mut BookingState, date: Date| s.pick(date)),
            cx.handler(|s: &mut BookingState, delta: i32| {
                s.shown = shift_month(s.shown.0, s.shown.1, delta)
            }),
            {
                // Three values per change, so no `cx.handler`: the closure makes the
                // `Callback` itself, through a handle to this state.
                let handle = cx.handle();
                move |endpoint, field, value| {
                    let handle = handle.clone();
                    Callback::new(move || handle.set_state(|s| s.set_time(endpoint, field, value)))
                }
            },
        );

        // Two months side by side are wider than a phone: let them scroll sideways
        // rather than run off the edge.
        sections(vec![Box::new(section(
            "Book a stay",
            SingleChildScrollView::new()
                .axis(Axis::Horizontal)
                .child(picker),
        ))])
    }
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

A date-and-time range picker.

## See also

- [TimePicker & TimeRange](./time-picker.md): a time of day from an hour grid and a minute grid; or a start and an end.
- [DateTimePicker](./date-time-picker.md): a calendar above a time picker, for one moment.
- [ColorPicker](./color-picker.md): a grid of colour swatches to pick from.
- [AutofillGroup & AutofillHint](./autofill-group.md): tell the platform what each field holds so it can be filled in.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`DateTimeRange`](https://docs.rs/frus/latest/frus/struct.DateTimeRange.html)

Source: [crates/frus-widgets/src/datetimerange.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/datetimerange.rs#L24-L26) @ `4b802dae875c`
