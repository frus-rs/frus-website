---
title: "Locale & Localizations"
sidebar_label: "Locale & Localizations"
sidebar_position: 15
description: "The interface's language, and the words the framework says in it."
custom_edit_url: null
---

# `Locale` and `Localizations`

## Purpose

The interface's language, and the words the framework says in it.

## Signature

```rust
pub struct Locale { .. }
```

```rust
pub trait Localizations { .. }
```

## Example

![Rendered preview of the Locale & Localizations demo](/preview/localizations.light.png)

From [`frus-examples/widgets/src/features/state/widgets/localizations.rs`](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/frus-examples/widgets/src/features/state/widgets/localizations.rs):

```rust
//! `Locale` and `Localizations` — the language the interface is in, and the words the
//! framework itself says in it: button labels a screen reader announces, month names in a
//! date picker, "1–10 of 100" under a table, digit grouping.
//!
//! The application states which languages it has and, optionally, the one the reader
//! picked; `locale::of()` and `localizations::of()` answer from anywhere. Your own
//! strings come from your own translation files, chosen by `locale::of()`.

use std::rc::Rc;

use frus::{
    component, host, locale, localizations, Align, Callback, Column, English, French, Locale, Row,
    SegmentedButton, Text, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        let scheme = &cx.theme().scheme;
        let current = locale::of();
        let french = current.language_code() == "fr";

        // Switching changes the whole application, on the next frame.
        let picker = SegmentedButton::new(usize::from(french), |index| {
            Callback::new(move || {
                let app = host::app();
                app.set_supported_locales(vec![Locale::new("en"), Locale::new("fr")]);
                if index == 1 {
                    app.set_locale(Some(Locale::new("fr")));
                    app.set_localizations(Some(Rc::new(French)));
                } else {
                    app.set_locale(Some(Locale::new("en")));
                    app.set_localizations(Some(Rc::new(English)));
                }
            })
        })
        .segment("English")
        .segment("Français");

        // The table in force. It always answers: English when nothing is installed.
        let words = localizations::of();
        let months = words.months();
        let lines = [
            ("locale::of()", current.to_string()),
            (
                "ok / cancel",
                format!(
                    "{} / {}",
                    words.ok_button_label(),
                    words.cancel_button_label()
                ),
            ),
            ("back button", words.back_button_label().to_string()),
            ("first months", months[..3].join(", ")),
            ("narrow weekdays", words.narrow_weekdays().join(" ")),
            (
                "page_range_label(1, 10, 1234)",
                words.page_range_label(1, 10, 1234),
            ),
            ("group_digits(1234567)", words.group_digits(1_234_567)),
        ];
        let table = lines.into_iter().fold(
            Column::new()
                .spacing(6.0)
                .cross_axis_alignment(Align::Start),
            |column, (name, value)| {
                column.child(
                    Row::new()
                        .spacing(8.0)
                        .child(Text::new(name).size(12.0).color(scheme.on_surface_variant))
                        .child(Text::new(value)),
                )
            },
        );

        sections(vec![
            Box::new(section("The application's language", picker)),
            Box::new(section("What the framework says", table)),
        ])
    }))
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

### `Locale`

Comparison is exact — `fr` is not `fr-CA`. Deciding that one of them will do for the other is `resolve`'s work, and it takes the whole list to do it.

### `Localizations`

**What the framework says**, for one language.

Every method has an English body, so implementing this means writing down only what differs.

**A default is not agreement.** An entry left unanswered is an English string in a French interface, and it compiles. So a table shipped here writes out every entry, even the ones whose right answer in that language *is* the English one — "OK" is "OK" in a good many languages — with the reason beside it; `French` does, and a test reads this file to check that it still does.

## See also

- [MediaQuery & MediaScope](./media-query.md): the screen's size, insets, text scale, brightness and size class.
- [Responsive, LayoutBuilder & OrientationBuilder](./responsive.md): one interface, several layouts, by window or by box.
- The guide: [Starting a frus application](/docs/getting-started)
- API reference: [`Locale`](https://docs.rs/frus/latest/frus/struct.Locale.html)
- API reference: [`Localizations`](https://docs.rs/frus/latest/frus/trait.Localizations.html)

Source: [crates/frus-widgets/src/locale.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/locale.rs#L42-L46), [crates/frus-widgets/src/localizations.rs](https://github.com/KalybosPro/frus/blob/d7214f545435ddea2e71dc3e1eb021605d3fc7a9/crates/frus-widgets/src/localizations.rs#L66-L317) @ `d7214f545435`
