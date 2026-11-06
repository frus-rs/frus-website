---
title: "NavScaffold"
sidebar_label: "NavScaffold"
sidebar_position: 7
description: "Navigation that becomes a bar, a rail or an extended rail with the size class."
custom_edit_url: null
---

# `NavScaffold`

## Purpose

Navigation that becomes a bar, a rail or an extended rail with the size class.

## Signature

```rust
pub struct NavScaffold<Msg = crate::callback::Callback> { .. }

impl NavScaffold {
    pub fn new<R1: crate::callback::IntoMsg<Msg>>(
        class: SizeClass,
        selected: usize,
        on_select: impl Fn(usize) -> R1 + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the NavScaffold demo](/preview/nav-scaffold.light.png)

From [`frus-examples/widgets/src/features/navigation/widgets/navscaffold.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/navigation/widgets/navscaffold.rs):

```rust
//! `NavScaffold`: navigation that adapts to the screen's size class: a bottom bar on a
//! phone, a rail on a tablet, an extended rail (or a docked drawer) on a wide window.
//! The destinations are declared once.

use frus::{
    Center, Color, Container, Icons, NavScaffold, SegmentedButton, SizeClass, State, StateContext,
    StatefulWidget, Text, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(NavScaffoldDemo.into_widget())
}

struct NavScaffoldDemo;

#[derive(Default)]
struct NavScaffoldDemoState {
    /// Index into `CLASSES`.
    class: usize,
    selected: usize,
}

const CLASSES: [(&str, SizeClass); 3] = [
    ("Compact", SizeClass::Compact),
    ("Medium", SizeClass::Medium),
    ("Expanded", SizeClass::Expanded),
];
const PLACES: [&str; 3] = ["Home", "Library", "Account"];

impl StatefulWidget for NavScaffoldDemo {
    type State = NavScaffoldDemoState;

    fn create_state(&self) -> NavScaffoldDemoState {
        NavScaffoldDemoState::default()
    }
}

impl State for NavScaffoldDemoState {
    type Widget = NavScaffoldDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        // In an app the class comes from the screen (`MediaQuery::of().size_class()`)
        // so rotating a tablet or widening a window switches the presentation. Here it
        // is picked by hand so all three fit in the demo.
        let class = CLASSES[self.class].1;
        let shell = NavScaffold::new(
            class,
            self.selected,
            cx.handler(|s: &mut Self, i: usize| s.selected = i),
        )
        .destination(Icons::HOME, "Home")
        .destination(Icons::LIBRARY_BOOKS, "Library")
        .badge(2)
        .destination(Icons::ACCOUNT_CIRCLE, "Account")
        // The body is added after the destinations.
        .body(Center::new(Text::new(PLACES[self.selected]).size(20.0)));

        let picker = CLASSES.iter().fold(
            SegmentedButton::new(self.class, cx.handler(|s: &mut Self, i: usize| s.class = i)),
            |picker, (name, _)| picker.segment(*name),
        );

        sections(vec![
            Box::new(section("Size class", picker)),
            Box::new(
                Container::new()
                    .width(320.0)
                    .height(320.0)
                    .border(1.0, Color::hex("#A1A1AA"))
                    .clip()
                    .child(shell),
            ),
        ])
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.destination()` | `icon: impl Into<DestinationIcon>, label: impl Into<String>` | Adds a destination, a glyph plus a label. Call this **before** `body`. |
| `.destinations()` | `destinations: impl IntoIterator<Item = NavigationDestination>` | Adds a whole list of destinations **declared elsewhere**. Call this **before** `body`. |
| `.tooltip()` | `message: impl Into<String>` | What a pointer resting on the **last** destination is told. See `NavigationRail::tooltip`. |
| `.badge()` | `count: u32` | Adds a notification count to the **last** destination. |
| `.badge_dot()` |  | Adds a dot to the **last** destination (milestone 707). |
| `.selected_icon()` | `icon: impl Into<DestinationIcon>` | The glyph the **last** destination shows while it is selected, where that differs from its resting one. See `NavigationRail::selected_icon`. |
| `.disabled()` |  | Marks the **last** destination inaccessible. See `NavigationRail::disabled`. |
| `.indicator_color()` | `color: Color` | The **last** destination's own indicator colour, over the theme's. See `NavigationRail::indicator_color`. |
| `.nav_labels()` | `labels: RailLabels` | **When the destinations say what they are**, whichever widget the class chose. Unsaid, each keeps its own default: a bar labels everything, a plain rail nothing, an extended rail everything (milestones 432 and 433). |
| `.rail()` | `configure: impl FnOnce(NavigationRail<Msg>) -> NavigationRail<Msg> + 'static` | **What to do to the rail** once the shell has built it: the door `Scaffold::rail` opens on the fixed shell, and the way to decline this one's extended form: `.rail(\|rail\| rail.extended(false))`. |
| `.nav_drawer()` | `configure: impl FnOnce(NavigationDrawer<Msg>) -> NavigationDrawer<Msg> + 'static` | **Give the widest band a drawer** instead of an extended rail, and say what to do to it once the shell has built it: the door `Self::rail` opens on the other two forms. `.nav_drawer(\|drawer\| drawer.header(title))` is the ordinary use: a drawer with nothing above its destinations is a rail that spent 48 more pixels. |
| `.body()` | `body: impl Widget<Msg> + 'static` | Sets the body and **finalises** the scaffold; call it last. The body fills the space left beside, or above, the navigation. |

## Behaviour

Adaptive navigation shell: a bottom bar, a rail, or an extended rail, by size.

## See also

- [BottomNavigationBar](./bottom-navigation-bar.md): the classic bottom bar: fixed, or shifting with the selected item's colour.
- [NavigationRail](./navigation-rail.md): the main destinations down the side of a tablet or desktop window.
- [Drawer & drawer headers](./drawer.md): a side panel that slides over the page or sits docked beside it.
- [NavigationDrawer](./navigation-drawer.md): a side panel's list of destinations, with a header, badges and a footer.
- [BottomAppBar](./bottom-app-bar.md): a bar of actions along the bottom, notched for a docked action button.
- The guide: [Screens, navigation and dialogs](/docs/guide/navigation)
- API reference: [`NavScaffold`](https://docs.rs/frus/latest/frus/struct.NavScaffold.html)

Source: [crates/frus-widgets/src/navscaffold.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/navscaffold.rs#L42-L53) @ `e6fba33f5b42`
