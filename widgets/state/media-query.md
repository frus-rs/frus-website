---
title: "MediaQuery & MediaScope"
sidebar_label: "MediaQuery & MediaScope"
sidebar_position: 13
description: "The screen's size, insets, text scale, brightness and size class."
custom_edit_url: null
---

# `MediaQuery` and `MediaScope`

## Purpose

The screen's size, insets, text scale, brightness and size class.

## Signature

```rust
pub struct MediaQuery { .. }

impl MediaQuery {
    pub fn new(size: Size) -> Self;
}
```

```rust
pub struct MediaScope<Msg = crate::callback::Callback> { .. }

impl MediaScope {
    pub fn new(media: MediaQuery, child: impl Widget<Msg> + 'static) -> Self;
    pub fn tweak(
        change: impl Fn(&mut MediaQuery) + 'static,
        child: impl Widget<Msg> + 'static,
    ) -> Self;
}
```

## Example

![Rendered preview of the MediaQuery & MediaScope demo](/preview/media-query.light.png)

From [`frus-examples/widgets/src/features/state/widgets/media_query.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/state/widgets/media_query.rs):

```rust
//! `MediaQuery`: what the screen is like: its size, density, the system's insets (status
//! bar, notch, keyboard), the reader's text size, light or dark, orientation and size
//! class. `MediaScope` changes part of it for a subtree.
//!
//! Resize the window: the values below follow.

use frus::{component, Align, Column, Container, Insets, MediaQuery, MediaScope, Text, Widget};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        // The description in force where this is built. Read it in `build`, never cache
        // it: a resize or a rotation rebuilds, and it is read afresh.
        let media = MediaQuery::of();
        let scheme = &cx.theme().scheme;

        let insets = |i: Insets| {
            format!(
                "top {:.0}, right {:.0}, bottom {:.0}, left {:.0}",
                i.top, i.right, i.bottom, i.left
            )
        };
        let lines = [
            (
                "size",
                format!(
                    "{:.0} × {:.0} logical px",
                    media.size.width, media.size.height
                ),
            ),
            (
                "device_pixel_ratio",
                format!("{:.2}", media.device_pixel_ratio),
            ),
            ("orientation()", format!("{:?}", media.orientation())),
            ("size_class()", format!("{:?}", media.size_class())),
            ("padding (system bars)", insets(media.padding)),
            ("view_insets (keyboard)", insets(media.view_insets)),
            ("safe()", insets(media.safe())),
            ("text_scaler", format!("{:.2}", media.text_scaler)),
            (
                "platform_brightness",
                format!("{:?}", media.platform_brightness),
            ),
            (
                "accessibility.disable_animations",
                format!("{}", media.accessibility.disable_animations),
            ),
        ];
        let table = lines.into_iter().fold(
            Column::new()
                .spacing(6.0)
                .cross_axis_alignment(Align::Start),
            |column, (name, value)| {
                column.child(
                    Column::new()
                        .cross_axis_alignment(Align::Start)
                        .child(Text::new(name).size(12.0).color(scheme.on_surface_variant))
                        .child(Text::new(value)),
                )
            },
        );

        // A subtree that believes the reader asked for bigger text.
        let scaled = MediaScope::tweak(
            |media| media.text_scaler = 1.5,
            Container::new()
                .padding(12.0)
                .radius(8.0)
                .color(scheme.surface_container)
                .child(Text::new("Laid out at a text scale of 1.5")),
        );

        sections(vec![
            Box::new(section("MediaQuery::of()", table)),
            Box::new(section("MediaScope::tweak", scaled)),
        ])
    }))
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `MediaQuery` | `.with_device_pixel_ratio()` | `ratio: f32` | Sets the DPI scale. |
| `MediaQuery` | `.with_density()` | `density: f32` | Sets the application zoom factor. |
| `MediaQuery` | `.with_text_scaler()` | `scaler: f32` | Sets the user's text-size setting. Clamped at zero, since a scale that shrank text to nothing would be a setting nobody could undo. |
| `MediaQuery` | `.with_platform_brightness()` | `brightness: Brightness` | Sets the platform's own light/dark preference. |
| `MediaQuery` | `.with_accessibility()` | `accessibility: Accessibility` | Sets the accessibility settings the platform reports. |
| `MediaQuery` | `.with_system_gesture_insets()` | `insets: Insets` | Sets the edges a system gesture starts from. |
| `MediaQuery` | `.with_title_bar()` | `title_bar: Option<crate::TitleBar>` | The title bar's line, shared with the application (milestone 640). |
| `MediaQuery` | `.with_insets()` | `insets: WindowInsets` | Sets both kinds of inset at once, from what the shell reports. |
| `MediaQuery` | `.remove_padding()` | `edges: Edges` | The query as a descendant sees it once `edges` of the padding have been **consumed** by a widget that already made room for them: an app bar takes the top, say. What was consumed is taken off the padding and off the view padding (floored at zero), so nothing below insets for it a second time. |
| `MediaQuery` | `.remove_view_insets()` | `edges: Edges` | The same description with the selected edges' `view_insets` zeroed: the keyboard equivalent of `remove_padding`. |

## Behaviour

### `MediaQuery`

The surface an interface is being built for.

Every length is in **logical** pixels, the same unit widget styles use, so a value read here can be handed straight to a padding or a size.

### `MediaScope`

Describes the surface for its child and everything under it.

## See also

- [Theme](./theme.md): reading the theme's colours and type, and switching light and dark.
- [Themed & ThemeBuilder](./themed.md): a different theme, or part of one, for one part of the screen.
- [Responsive, LayoutBuilder & OrientationBuilder](./responsive.md): one interface, several layouts, by window or by box.
- [Locale & Localizations](./localizations.md): the interface's language, and the words the framework says in it.
- The guide: [Starting a frus application](/docs/getting-started)
- API reference: [`MediaQuery`](https://docs.rs/frus/latest/frus/struct.MediaQuery.html)
- API reference: [`MediaScope`](https://docs.rs/frus/latest/frus/struct.MediaScope.html)

Source: [crates/frus-widgets/src/media.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/media.rs#L326-L393), [crates/frus-widgets/src/mediascope.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/mediascope.rs#L50-L53) @ `e6fba33f5b42`
