---
title: "BottomBar"
sidebar_label: "BottomBar"
sidebar_position: 4
description: "The main destinations along the bottom of a phone screen."
custom_edit_url: null
---

# `BottomBar`

## Purpose

The main destinations along the bottom of a phone screen.

## Signature

```rust
pub struct BottomBar<Msg = crate::callback::Callback> { .. }

impl BottomBar {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        selected: usize,
        on_select: impl Fn(usize) -> R1 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the BottomBar demo](/preview/bottom-bar.light.png)

From [`frus-examples/widgets/src/features/navigation/widgets/bottombar.rs`](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/frus-examples/widgets/src/features/navigation/widgets/bottombar.rs):

```rust
//! `BottomBar` — the bar of three to five main destinations along the bottom of a phone
//! screen. One is selected; a badge can say something is waiting in another.

use frus::{
    Align, BottomBar, Center, Color, Column, Container, Expanded, Icons, NavigationDestination,
    RailLabels, State, StateContext, StatefulWidget, Text, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(BottomBarDemo.into_widget())
}

/// A small `StatefulWidget`: the selected destination of each bar is its state, and
/// `cx.handler` turns "the bar reports an index" into "this method changes the state".
struct BottomBarDemo;

#[derive(Default)]
struct BottomBarDemoState {
    first: usize,
    second: usize,
}

impl StatefulWidget for BottomBarDemo {
    type State = BottomBarDemoState;

    fn create_state(&self) -> BottomBarDemoState {
        BottomBarDemoState::default()
    }
}

const PLACES: [&str; 4] = ["Home", "Explore", "Inbox", "Profile"];

impl State for BottomBarDemoState {
    type Widget = BottomBarDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        // `item(icon, label)` adds a destination; the builders after it (`badge`,
        // `selected_icon`) apply to the last one added. An outlined icon at rest and the
        // filled one when selected is how the bar says where you are.
        let simple = BottomBar::new(self.first, cx.handler(|s: &mut Self, i: usize| s.first = i))
            .item(Icons::HOME, "Home")
            .item(Icons::EXPLORE, "Explore")
            .item(Icons::MAIL, "Inbox")
            .badge(3)
            .item(Icons::PERSON, "Profile");

        // The same destinations can be declared once as values and handed to any of the
        // navigation widgets (bar, rail, drawer). Here only the selected one is labelled.
        let destinations = vec![
            NavigationDestination::new(Icons::FAVORITE_BORDER, "Saved")
                .selected_icon(Icons::FAVORITE),
            NavigationDestination::new(Icons::MAIL_OUTLINE, "Inbox").badge(12),
            NavigationDestination::new(Icons::SETTINGS, "Settings"),
        ];
        let labelled = BottomBar::new(
            self.second,
            cx.handler(|s: &mut Self, i: usize| s.second = i),
        )
        .destinations(destinations)
        .labels(RailLabels::Selected)
        .background(Color::hex("#EEF2FF"));

        sections(vec![
            Box::new(section(
                "Items with a badge",
                phone(PLACES[self.first], simple),
            )),
            Box::new(section(
                "Declared destinations, label on the selected one",
                phone(["Saved", "Inbox", "Settings"][self.second], labelled),
            )),
        ])
    }
}

/// A small phone-shaped frame: the page above, the bar along the bottom.
fn phone(page: &str, bar: BottomBar) -> Container {
    Container::new()
        .width(320.0)
        .height(200.0)
        .border(1.0, Color::hex("#A1A1AA"))
        .radius(12.0)
        .clip()
        .child(
            Column::new()
                .cross_axis_alignment(Align::Stretch)
                .child(Expanded::new(Center::new(Text::new(page).size(20.0))))
                .child(bar),
        )
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.labels()` | `labels: RailLabels` | When the destinations say what they are. |
| `.item()` | `icon: impl Into<DestinationIcon>, label: impl Into<String>` | Adds a destination (mark + label). |
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
| `.background()` | `color: Color` | The bar's surface. |

## Behaviour

A **horizontal** navigation bar at the bottom (phone).

## See also

- [Scaffold](./scaffold.md): the shell of a screen: app bar, body, navigation, drawer, FAB and footer slots.
- [TabBar](./tab-bar.md): tabs and the panel of the selected one: primary, secondary, icons, scrolling, swiping.
- [BottomNavigationBar](./bottom-navigation-bar.md): the classic bottom bar: fixed, or shifting with the selected item's colour.
- [NavigationRail](./navigation-rail.md): the main destinations down the side of a tablet or desktop window.
- [NavScaffold](./nav-scaffold.md): navigation that becomes a bar, a rail or an extended rail with the size class.
- The guide: [Screens, navigation and dialogs](/docs/guide/navigation)
- API reference: [`BottomBar`](https://docs.rs/frus/latest/frus/struct.BottomBar.html)

Source: [crates/frus-widgets/src/navrail.rs](https://github.com/KalybosPro/frus/blob/4b802dae875c8f88f633392874660d9351b15664/crates/frus-widgets/src/navrail.rs#L1358-L1367) @ `4b802dae875c`
