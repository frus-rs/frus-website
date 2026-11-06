---
title: "Slider"
sidebar_label: "Slider"
sidebar_position: 11
description: "A value picked by dragging along a track, continuous or in steps."
custom_edit_url: null
---

# `Slider`

## Purpose

A value picked by dragging along a track, continuous or in steps.

## Signature

```rust
pub struct Slider<Msg = crate::callback::Callback> { .. }

impl Slider {
    pub fn new(value: f32) -> Self;
}
```

## Example

![Rendered preview of the Slider demo](/preview/slider.light.png)

From [`frus-examples/widgets/src/features/inputs/widgets/slider.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/inputs/widgets/slider.rs):

```rust
//! `Slider`: a value picked by dragging along a track: continuous, or in steps with
//! `divisions`, with a bubble showing the value while dragging.

use frus::{
    Color, Insets, Padding, ShowValueIndicator, Slider, State, StateContext, StatefulWidget, Text,
    Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(SliderDemo.into_widget())
}

struct SliderDemo;

struct SliderDemoState {
    volume: f32,
    rating: f32,
    temperature: f32,
    /// Changed only when a drag **ends**: for work too costly to do on every pixel.
    committed: f32,
}

impl StatefulWidget for SliderDemo {
    type State = SliderDemoState;

    fn create_state(&self) -> SliderDemoState {
        SliderDemoState {
            volume: 0.5,
            rating: 3.0,
            temperature: 21.0,
            committed: 21.0,
        }
    }
}

impl State for SliderDemoState {
    type Widget = SliderDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        sections(vec![
            // From 0 to 1 unless told otherwise.
            Box::new(section(
                "Continuous",
                Slider::new(self.volume)
                    .width(300.0)
                    .on_change(cx.handler(|s: &mut SliderDemoState, v: f32| s.volume = v)),
            )),
            Box::new(Text::new(format!("Volume: {:.0}%", self.volume * 100.0))),
            // `divisions` snaps to steps; `value_label` writes the bubble, shown here all
            // the time (by default only while dragging). The padding is the bubble's room.
            Box::new(section(
                "Steps with a value label",
                Padding::new(
                    Insets::new(28.0, 0.0, 0.0, 0.0),
                    Slider::new(self.rating)
                        .range(1.0, 5.0)
                        .divisions(4)
                        .value_label(|v| format!("{v:.0} stars"))
                        .show_value_indicator(ShowValueIndicator::AlwaysVisible)
                        .width(300.0)
                        .on_change(cx.handler(|s: &mut SliderDemoState, v: f32| s.rating = v)),
                ),
            )),
            // `on_change_end` fires once, on release.
            Box::new(section(
                "Custom range, colours and change end",
                Slider::new(self.temperature)
                    .range(10.0, 30.0)
                    .divisions(40)
                    .value_label(|v| format!("{v:.1} °C"))
                    .active_color(Color::hex("#DC2626"))
                    .inactive_color(Color::hex("#FECACA"))
                    .thumb_color(Color::hex("#991B1B"))
                    .width(300.0)
                    .on_change(cx.handler(|s: &mut SliderDemoState, v: f32| s.temperature = v))
                    .on_change_end(cx.handler(|s: &mut SliderDemoState, v: f32| s.committed = v)),
            )),
            Box::new(Text::new(format!(
                "Dragging: {:.1} °C · saved: {:.1} °C",
                self.temperature, self.committed
            ))),
            // A second, lighter track: how much of a video is buffered, say.
            Box::new(section(
                "Secondary track, disabled",
                Slider::new(0.3)
                    .secondary_track_value(0.7)
                    .width(300.0)
                    .enabled(false),
            )),
        ])
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.active_color()` | `color: Color` | The travelled part of the track, and the thumb unless `thumb_color` names it; the scheme's `primary` otherwise. |
| `.inactive_color()` | `color: Color` | The part of the track still to travel; the scheme's `surface_container_highest` otherwise. |
| `.secondary_active_color()` | `color: Color` | The part between the value and the [secondary value](Self::secondary_track_value); the scheme's `primary` at 54 % otherwise. |
| `.thumb_color()` | `color: Color` | The thumb's fill; the active colour otherwise. |
| `.thumb_border_color()` | `color: Color` | A ring around the thumb, two pixels wide. |
| `.overlay_color()` | `color: WidgetStateProperty<Color>` | The halo around the thumb, per state: hovered, focused, dragged. Unset, the theme's, then the active colour at 12 % when one is given, then the scheme's `primary` at 8 % hovered and 10 % focused or dragged. |
| `.thumb_elevation()` | `elevation: f32` | How far the thumb sits off the track at rest. |
| `.pressed_thumb_elevation()` | `elevation: f32` | How far it rises while it is held. |
| `.track_shape()` | `shape: impl SliderTrackShape + 'static` | Paints the track with `shape`. |
| `.tick_mark_shape()` | `shape: impl SliderTickMarkShape + 'static` | Paints the tick marks with `shape`. |
| `.thumb_shape()` | `shape: impl SliderThumbShape + 'static` | Paints the thumb with `shape`. |
| `.overlay_shape()` | `shape: impl SliderOverlayShape + 'static` | Paints the halo with `shape`. |
| `.value_indicator_shape()` | `shape: impl SliderValueIndicatorShape + 'static` | Paints the value indicator with `shape`. |
| `.range()` | `min: f32, max: f32` | The travel this slider covers; `0.0..=1.0` by default. |
| `.secondary_track_value()` | `value: f32` | A **second value**, shown as a lighter part of the track beyond the value: how much of a video is buffered behind where it is playing. It is not dragged. |
| `.divisions()` | `n: usize` | Splits the travel into `n` **steps**: the value snaps to `min + k·(max−min)/n`, a tick marks each, and an arrow key moves by one of them. Without this call the travel is continuous and an arrow moves by 5 %. |
| `.value_label()` | `label: impl Fn(f32) -> String + 'static` | Formats the value for the **value indicator**, the drop over the thumb: a percentage, a price, a duration. When it shows is `show_value_indicator`'s to say. A screen reader hears it too, unless `semantic_formatter` says otherwise. |
| `.allowed_interaction()` | `interaction: SliderInteraction` | What a press and a slide may do. |
| `.show_value_indicator()` | `when: ShowValueIndicator` | When the value indicator shows. |
| `.semantic_formatter()` | `format: impl Fn(f32) -> String + 'static` |  |
| `.width()` | `width: f32` | The width, in logical pixels. Unset, the slider takes the width it is offered, and 220 where none can be offered. |
| `.on_change()` | `on_change: impl Fn(f32) -> R + 'static` | A closure producing a message from the new value, in the slider's units. |
| `.on_change_start()` | `on_start: impl Fn(f32) -> R + 'static` | Sent **once**, when a drag begins: before the first `on_change`, with the value the press landed on. |
| `.on_change_end()` | `on_end: impl Fn(f32) -> R + 'static` | Sent **once**, when the drag ends: after the last `on_change`, with the value it settled on. |
| `.enabled()` | `enabled: bool` | Whether the slider can be moved. Disabled it is **inert** (it takes no drag and answers no key) and it still shows where it is set. |

## Behaviour

The track is inset by the halo's radius at each end, so the thumb reaches both ends without leaving the box. In a right-to-left reading direction it runs from the right.

## See also

- [Switch](./switch.md): an on/off toggle that takes effect at once.
- [CheckboxListTile, RadioListTile & SwitchListTile](./control-list-tiles.md): list rows whose whole width works one control, for settings screens.
- [RangeSlider](./range-slider.md): two thumbs on one track, for picking an interval.
- [Rating](./rating.md): a score given by tapping stars.
- [Stepper](./stepper.md): a whole number with − and + buttons on either side.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`Slider`](https://docs.rs/frus/latest/frus/struct.Slider.html)

Source: [crates/frus-widgets/src/slider.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/slider.rs#L103-L130) @ `e6fba33f5b42`
