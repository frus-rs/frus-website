---
title: "NavigationRail"
sidebar_label: "NavigationRail"
sidebar_position: 6
description: "The main destinations down the side of a tablet or desktop window."
custom_edit_url: null
---

# `NavigationRail`

## Purpose

The main destinations down the side of a tablet or desktop window.

## Signature

```rust
pub struct NavigationRail<Msg = crate::callback::Callback> { .. }

impl NavigationRail {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        selected: usize,
        on_select: impl Fn(usize) -> R1 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the NavigationRail demo](/preview/navigation-rail.light.png)

From [`frus-examples/widgets/src/features/navigation/widgets/navrail.rs`](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/navigation/widgets/navrail.rs):

```rust
//! `NavigationRail` — the main destinations down the side of a tablet or desktop
//! window: glyphs alone, glyphs with labels, or extended with the labels beside them.

use frus::{
    Align, Center, Color, Container, Expanded, FloatingActionButton, IconButton, Icons, RailLabels,
    Row, SegmentedButton, State, StateContext, StatefulWidget, Switch, Text, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(RailDemo.into_widget())
}

struct RailDemo;

struct RailDemoState {
    selected: usize,
    /// Index into `LABELS`.
    labels: usize,
    extended: bool,
}

const PLACES: [&str; 4] = ["Inbox", "Starred", "Sent", "Drafts"];
const LABELS: [(&str, RailLabels); 3] = [
    ("None", RailLabels::None),
    ("Selected", RailLabels::Selected),
    ("All", RailLabels::All),
];

impl StatefulWidget for RailDemo {
    type State = RailDemoState;

    fn create_state(&self) -> RailDemoState {
        RailDemoState {
            selected: 0,
            labels: 2,
            extended: false,
        }
    }
}

impl State for RailDemoState {
    type Widget = RailDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        // A rail has a slot above its destinations (`leading`, often the main action) and
        // one below (`trailing`). An extended rail labels every destination by itself,
        // so `labels` only matters while it is narrow.
        let rail = frus::NavigationRail::new(
            self.selected,
            cx.handler(|s: &mut Self, i: usize| s.selected = i),
        )
        .leading(FloatingActionButton::new(Icons::EDIT).small())
        .item(Icons::INBOX, "Inbox")
        .badge(4)
        .item(Icons::STAR, "Starred")
        .item(Icons::SEND, "Sent")
        .item(Icons::DRAFTS, "Drafts")
        .trailing(IconButton::new(Icons::SETTINGS).label("Settings"))
        .labels(LABELS[self.labels].1)
        .extended(self.extended);

        let window = Container::new()
            .width(320.0)
            .height(440.0)
            .border(1.0, Color::hex("#A1A1AA"))
            .clip()
            .child(
                Row::new()
                    .cross_axis_alignment(Align::Stretch)
                    .child(rail)
                    .child(Expanded::new(Center::new(
                        Text::new(PLACES[self.selected]).size(20.0),
                    ))),
            );

        let picker = LABELS.iter().fold(
            SegmentedButton::new(
                self.labels,
                cx.handler(|s: &mut Self, i: usize| s.labels = i),
            ),
            |picker, (name, _)| picker.segment(*name),
        );

        sections(vec![
            Box::new(section("Labels", picker)),
            Box::new(section(
                "Extended",
                Switch::new(self.extended)
                    .on_toggle(cx.handler(|s: &mut Self, on: bool| s.extended = on)),
            )),
            Box::new(window),
        ])
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.labels()` | `labels: RailLabels` | When the destinations say what they are. |
| `.extended()` | `extended: bool` | — |
| `.group_alignment()` | `alignment: f32` | — |
| `.leading()` | `widget: impl Widget<Msg> + 'static` | — |
| `.leading_boxed()` | `widget: Box<dyn Widget<Msg>>` | `Self::leading`, for a slot that is already boxed. |
| `.trailing()` | `widget: impl Widget<Msg> + 'static` | — |
| `.trailing_boxed()` | `widget: Box<dyn Widget<Msg>>` | `Self::trailing`, for a slot that is already boxed. |
| `.main_axis_alignment()` | `alignment: Justify` | — |
| `.scrollable()` | — | — |
| `.use_indicator()` | `use_indicator: bool` | On unless said otherwise, as it is over there. |
| `.elevation()` | `elevation: f32` | — |
| `.leading_at_top()` | `pinned: bool` | Whether the leading slot is **pinned to the top** instead of travelling with the destinations. |
| `.trailing_at_bottom()` | `pinned: bool` | Whether the trailing slot is **pinned to the bottom**. |
| `.item()` | `icon: impl Into<DestinationIcon>, label: impl Into<String>` | Adds a destination (glyph + label). |
| `.destinations()` | `destinations: impl IntoIterator<Item = NavigationDestination>` | Adds a whole list of destinations **declared elsewhere** — one navigation, handed to whichever chrome the width called for. |
| `.badge()` | `count: u32` | Adds a notification count to the **last** destination. |
| `.badge_dot()` | — | Adds a dot to the **last** destination's glyph (milestone 707). |
| `.tooltip()` | `message: impl Into<String>` | — |
| `.selected_icon()` | `icon: impl Into<DestinationIcon>` | — |
| `.disabled()` | — | — |
| `.indicator_color()` | `color: Color` | — |
| `.indicator_shape()` | `shape: ShapeBorder` | — |
| `.overlay_color()` | `overlay: WidgetStateProperty<Color>` | — |
| `.label_text_style()` | `style: TextStyle` | — |
| `.badge_text_style()` | `style: TextStyle` | — |
| `.background()` | `color: Color` | The rail's surface. |

## Behaviour

A **vertical** navigation rail (tablet / desktop).

## See also

- [BottomBar](./bottom-bar.md): the main destinations along the bottom of a phone screen.
- [BottomNavigationBar](./bottom-navigation-bar.md): the classic bottom bar: fixed, or shifting with the selected item's colour.
- [NavScaffold](./nav-scaffold.md): navigation that becomes a bar, a rail or an extended rail with the size class.
- [Drawer & drawer headers](./drawer.md): a side panel that slides over the page or sits docked beside it.
- [NavigationDrawer](./navigation-drawer.md): a side panel's list of destinations, with a header, badges and a footer.
- The guide: [Screens, navigation and dialogs](/docs/guide/navigation)
- API reference: [`NavigationRail`](https://docs.rs/frus/latest/frus/struct.NavigationRail.html)

Source: [crates/frus-widgets/src/navrail.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/navrail.rs#L799-L826) @ `e6fba33f5b42`
