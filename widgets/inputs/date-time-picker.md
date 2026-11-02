---
title: "DateTimePicker"
sidebar_label: "DateTimePicker"
sidebar_position: 17
description: "A calendar above a time picker, for one moment."
custom_edit_url: null
---

# `DateTimePicker`

## Purpose

A calendar above a time picker, for one moment.

## Signature

```rust
pub struct DateTimePicker<Msg = crate::callback::Callback> { .. }

impl DateTimePicker {
    pub fn new<
        R1: crate::callback::IntoMsg<Msg>,
        R2: crate::callback::IntoMsg<Msg>,
        R3: crate::callback::IntoMsg<Msg>,
        R4: crate::callback::IntoMsg<Msg>,
    >(
        year: i32,
        month: u32,
        day: Option<u32>,
        hour: u32,
        minute: u32,
        on_day: impl Fn(u32) -> R1 + 'static,
        on_nav: impl Fn(i32) -> R2 + 'static,
        on_hour: impl Fn(u32) -> R3 + 'static,
        on_minute: impl Fn(u32) -> R4 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the DateTimePicker demo](/preview/date-time-picker.light.png)

From [`frus-examples/widgets/src/features/inputs/widgets/date_time_picker.rs`](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/inputs/widgets/date_time_picker.rs):

```rust
//! `DateTimePicker` — a calendar above a time picker, with a summary of the choice on
//! top. For one moment: an appointment, a reminder.

use frus::{DateTimePicker, State, StateContext, StatefulWidget, Widget};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(DateTimeDemo.into_widget())
}

/// The month `delta` months away from `(year, month)`.
fn shift_month(year: i32, month: u32, delta: i32) -> (i32, u32) {
    let index = year * 12 + month as i32 - 1 + delta;
    (index.div_euclid(12), index.rem_euclid(12) as u32 + 1)
}

struct DateTimeDemo;

struct DateTimeDemoState {
    year: i32,
    month: u32,
    day: Option<u32>,
    hour: u32,
    minute: u32,
}

impl StatefulWidget for DateTimeDemo {
    type State = DateTimeDemoState;

    fn create_state(&self) -> DateTimeDemoState {
        DateTimeDemoState {
            year: 2026,
            month: 10,
            day: Some(20),
            hour: 10,
            minute: 30,
        }
    }
}

impl State for DateTimeDemoState {
    type Widget = DateTimeDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        // Four handlers — day, month arrows, hour, minute — each storing one field. The
        // summary at the top appears once a day is chosen.
        let picker = DateTimePicker::new(
            self.year,
            self.month,
            self.day,
            self.hour,
            self.minute,
            cx.handler(|s: &mut DateTimeDemoState, day: u32| s.day = Some(day)),
            cx.handler(|s: &mut DateTimeDemoState, delta: i32| {
                (s.year, s.month) = shift_month(s.year, s.month, delta);
                // The day belonged to the other month.
                s.day = None;
            }),
            cx.handler(|s: &mut DateTimeDemoState, hour: u32| s.hour = hour),
            cx.handler(|s: &mut DateTimeDemoState, minute: u32| s.minute = minute),
        );

        sections(vec![Box::new(section("Pick a day, then a time", picker))])
    }
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

A date-and-time picker.

## See also

- [DatePicker](./date-picker.md): a month calendar: one day, allowed days only, or a range.
- [TimePicker & TimeRange](./time-picker.md): a time of day from an hour grid and a minute grid; or a start and an end.
- [DateTimeRange](./date-time-range.md): a date range over two months and a start and end time, for booking a slot.
- [ColorPicker](./color-picker.md): a grid of colour swatches to pick from.
- [AutofillGroup & AutofillHint](./autofill-group.md): tell the platform what each field holds so it can be filled in.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`DateTimePicker`](https://docs.rs/frus/latest/frus/struct.DateTimePicker.html)

Source: [crates/frus-widgets/src/datetimepicker.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/datetimepicker.rs#L22-L24) @ `e6fba33f5b42`
