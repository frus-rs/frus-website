---
title: "DropdownButton"
sidebar_label: "DropdownButton"
sidebar_position: 9
description: "A button showing the current choice, whose options float below it."
custom_edit_url: null
---

# `DropdownButton`

## Purpose

A button showing the current choice, whose options float below it.

## Signature

```rust
pub struct DropdownButton<Msg = crate::callback::Callback> { .. }

impl DropdownButton {
    pub fn new(selected_label: impl Into<String>, on_toggle: Msg) -> Self;
}
```

## Example

![Rendered preview of the DropdownButton demo](/preview/dropdown-button.light.png)

From [`frus-examples/widgets/src/features/buttons/widgets/dropdown_button.rs`](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/buttons/widgets/dropdown_button.rs):

```rust
//! `DropdownButton` and `DropdownOption` — a button showing the current choice, whose
//! options float below it. For picking one value from a short, closed list.

use frus::{
    Color, Container, DropdownButton, DropdownOption, Row, State, StateContext, StatefulWidget,
    Text, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(DropdownDemo.into_widget())
}

const FRUITS: [&str; 4] = ["Apple", "Banana", "Cherry", "Grape"];
const COLORS: [(&str, &str); 4] = [
    ("Red", "#EF4444"),
    ("Green", "#22C55E"),
    ("Blue", "#3B82F6"),
    ("Purple", "#A855F7"),
];

struct DropdownDemo;

struct DropdownDemoState {
    fruit: usize,
    fruit_open: bool,
    color: usize,
    color_open: bool,
}

impl StatefulWidget for DropdownDemo {
    type State = DropdownDemoState;

    fn create_state(&self) -> DropdownDemoState {
        DropdownDemoState {
            fruit: 0,
            fruit_open: false,
            color: 2,
            color_open: false,
        }
    }
}

impl State for DropdownDemoState {
    type Widget = DropdownDemo;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        // Controlled twice over: the application holds the choice **and** whether the
        // list is open. The header press toggles it; a pick stores the index and closes.
        let fruits = DropdownButton::new(
            FRUITS[self.fruit],
            cx.callback(|s: &mut DropdownDemoState| s.fruit_open = !s.fruit_open),
        )
        .selected(self.fruit)
        .width(200.0)
        .options(
            self.fruit_open,
            &FRUITS,
            cx.handler(|s: &mut DropdownDemoState, i: usize| {
                s.fruit = i;
                s.fruit_open = false;
            }),
        );

        // Options that are not just words: a swatch beside the name. The last one is
        // shown but cannot be picked.
        let options = COLORS
            .iter()
            .enumerate()
            .map(|(i, (name, hex))| {
                let option = DropdownOption::widget(
                    Row::new()
                        .spacing(8.0)
                        .child(
                            Container::new()
                                .width(14.0)
                                .height(14.0)
                                .radius(7.0)
                                .color(Color::hex(hex)),
                        )
                        .child(Text::new(*name)),
                );
                option.enabled(i != COLORS.len() - 1)
            })
            .collect();
        let colors = DropdownButton::new(
            COLORS[self.color].0,
            cx.callback(|s: &mut DropdownDemoState| s.color_open = !s.color_open),
        )
        .selected(self.color)
        .width(200.0)
        .menu_radius(12.0)
        .options_widgets(
            self.color_open,
            options,
            cx.handler(|s: &mut DropdownDemoState, i: usize| {
                s.color = i;
                s.color_open = false;
            }),
        );

        sections(vec![
            Box::new(section("Words", fruits)),
            Box::new(section("Custom rows, one unavailable", colors)),
            Box::new(Text::new(format!(
                "{} · {}",
                FRUITS[self.fruit], COLORS[self.color].0
            ))),
        ])
    }
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.text_style()` | `style: TextStyle` | — |
| `.menu_background()` | `color: Color` | **The surface the options float on**, over `DropdownTheme::menu_background` and `surface_container`. |
| `.menu_shape()` | `shape: ShapeBorder` | What shape the panel is, over the theme's and the framework's corner. |
| `.menu_radius()` | `radius: impl Into<BorderRadius>` | The shorthand for a rounded panel. |
| `.menu_elevation()` | `elevation: f32` | How far off the page the panel sits, in pixels. Eight by default. |
| `.menu_shadow_color()` | `color: Color` | The colour of the panel's shadow, over the theme's and the scheme's shadow at 30 %. `Color::TRANSPARENT` casts none. |
| `.menu_padding()` | `padding: Insets` | The room kept above and below the options, inside the panel. Eight by default. |
| `.enabled()` | `enabled: bool` | Whether the list can be opened or chosen from. Disabled it is **inert** - the header takes no press, no row takes focus - and it still shows the current choice. |
| `.width()` | `width: f32` | Width of the header and the menu, in logical pixels (240 by default). |
| `.selected()` | `index: usize` | Index of the **selected** option (highlighted + ticked in the menu). |
| `.options()` | `open: bool, labels: &[&str], on_select: impl Fn(usize) -> R1 + 'static` | Sets the options; if `open`, they float below the header. `on_select` maps the chosen index to a message. |
| `.options_widgets()` | `open: bool, options: Vec<DropdownOption<Msg>>, on_select: impl Fn(usize) -> R1 + 'static` | The same, for choices that are **not** words: a swatch, a flag, two lines, or a choice that is there and cannot be picked. See `DropdownOption`. |

## Behaviour

A single-selection dropdown list (a floating menu).

## See also

- [MenuAnchor](./menu-anchor.md): a floating panel with any content, anchored to a widget.
- [MenuBar & SubmenuButton](./menu-bar.md): a desktop window's menus along the top, with submenus inside them.
- [DropdownMenu](./dropdown-menu.md): a dropdown that looks like a text field and filters its choices as you type.
- [BackButton, CloseButton & DrawerButton](./action-buttons.md): icon buttons whose meaning is fixed: back, close, and the two drawers.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`DropdownButton`](https://docs.rs/frus/latest/frus/struct.DropdownButton.html)

Source: [crates/frus-widgets/src/dropdown.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/dropdown.rs#L360-L373) @ `e6fba33f5b42`
