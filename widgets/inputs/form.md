---
title: "Form, Rule & ErrorSummary"
sidebar_label: "Form, Rule & ErrorSummary"
sidebar_position: 3
description: "Validation as a plain function of the state, shown on the fields and in a summary."
custom_edit_url: null
---

# `Form` and `Rule` and `ErrorSummary`

## Purpose

Validation as a plain function of the state, shown on the fields and in a summary.

## Signature

```rust
pub struct Form { .. }

impl Form {
    pub fn new() -> Self;
}
```

```rust
pub struct Rule(Check);

impl Rule {
    pub fn new(check: impl Fn(&str) -> Option<String> + 'static) -> Self;
    pub fn required(message: impl Into<String>) -> Self;
    pub fn min_len(n: usize, message: impl Into<String>) -> Self;
    pub fn max_len(n: usize, message: impl Into<String>) -> Self;
    pub fn email(message: impl Into<String>) -> Self;
    pub fn all(rules: impl IntoIterator<Item = Rule>) -> Self;
}
```

```rust
pub struct ErrorSummary<Msg = crate::callback::Callback> { .. }

impl ErrorSummary {
    pub fn new(messages: impl IntoIterator<Item = impl Into<String>>) -> Self;
    pub fn links(items: impl IntoIterator<Item = (impl Into<String>, Msg)>) -> Self;
}
```

## Example

![Rendered preview of the Form, Rule & ErrorSummary demo](/preview/form.light.png)

From [`frus-examples/widgets/src/features/inputs/widgets/form.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/inputs/widgets/form.rs):

```rust
//! `form::Form`, `form::Rule` and `ErrorSummary` — validation as a plain function of the
//! state. Rules check each value, `Form` collects the answers, and the fields only
//! **show** them: nothing here draws until you hand an error to a `TextField`.

use frus::form::{Form, Rule};
use frus::{
    host, keyed, Align, Button, Callback, Column, ErrorSummary, State, StateContext,
    StatefulWidget, Text, TextField, Widget,
};

use crate::common::shared::{section, sections};

pub fn example() -> Box<dyn Widget> {
    Box::new(SignUpForm.into_widget())
}

/// The whole validation of the form: pure, so it is tested in `tests/form_test.rs` without a window.
pub fn validate(name: &str, email: &str, password: &str, confirm: &str) -> Form {
    Form::new()
        .field("name", name, Rule::required("Enter your name"))
        .field(
            "email",
            email,
            // `all`: the first rule that fails gives the message.
            Rule::all([
                Rule::required("Enter your email"),
                Rule::email("Enter a valid email address"),
            ]),
        )
        .field(
            "password",
            password,
            Rule::all([
                Rule::min_len(8, "At least 8 characters"),
                // Any closure is a rule: `None` passes, `Some(message)` fails.
                Rule::new(|v| {
                    (!v.chars().any(|c| c.is_ascii_digit())).then(|| "Include a digit".to_string())
                }),
            ]),
        )
        // A cross-field rule: it reads a field declared before it.
        .matches("confirm", confirm, "password", "The passwords differ")
}

pub struct SignUpForm;

#[derive(Default)]
pub struct SignUpState {
    name: String,
    email: String,
    password: String,
    confirm: String,
    /// Errors show only after a first attempt: a form that is red before anyone typed
    /// scolds the reader for nothing.
    submitted: bool,
    sent: bool,
}

impl SignUpState {
    fn form(&self) -> Form {
        validate(&self.name, &self.email, &self.password, &self.confirm)
    }

    fn submit(&mut self) {
        self.submitted = true;
        let form = self.form();
        self.sent = form.is_valid();
        // Bring the first wrong field forward. A field is reached by the key it is
        // `keyed` with in `build`.
        if let Some(first) = form.first_invalid() {
            host::focus(("signup", first));
        }
    }
}

impl StatefulWidget for SignUpForm {
    type State = SignUpState;

    fn create_state(&self) -> SignUpState {
        SignUpState::default()
    }
}

impl State for SignUpState {
    type Widget = SignUpForm;

    fn build(&self, cx: &StateContext<Self>) -> Box<dyn Widget> {
        let form = self.form();
        let error = |key: &str| {
            if self.submitted {
                form.error(key)
            } else {
                None
            }
        };

        // One field, decorated with its error if it has one, and keyed so that it can be
        // focused from code.
        let field = |key: &'static str,
                     label: &str,
                     value: &str,
                     obscure: bool,
                     on_input: Box<dyn Fn(String) -> Callback>| {
            let mut field = TextField::new(value)
                .label(label)
                .obscure(obscure)
                .width(300.0)
                .on_input(on_input);
            if let Some(message) = error(key) {
                field = field.error(message);
            }
            keyed(("signup", key), field)
        };

        let mut column = Column::new()
            .spacing(12.0)
            .cross_axis_alignment(Align::Start);

        // The summary lists every error; each bullet focuses its field.
        if self.submitted && !form.is_valid() {
            let links = form.errors().into_iter().map(|(key, message)| {
                (
                    message.to_string(),
                    cx.callback(move |_: &mut SignUpState| host::focus(("signup", key))),
                )
            });
            column = column.child(ErrorSummary::links(links));
        }

        column = column
            .child(field(
                "name",
                "Name",
                &self.name,
                false,
                Box::new(cx.handler(|s: &mut SignUpState, t: String| s.name = t)),
            ))
            .child(field(
                "email",
                "Email",
                &self.email,
                false,
                Box::new(cx.handler(|s: &mut SignUpState, t: String| s.email = t)),
            ))
            .child(field(
                "password",
                "Password",
                &self.password,
                true,
                Box::new(cx.handler(|s: &mut SignUpState, t: String| s.password = t)),
            ))
            .child(field(
                "confirm",
                "Confirm password",
                &self.confirm,
                true,
                Box::new(cx.handler(|s: &mut SignUpState, t: String| s.confirm = t)),
            ))
            .child(Button::new("Create account").on_press(cx.callback(SignUpState::submit)));

        if self.sent {
            column = column.child(Text::new(format!("Welcome, {}!", self.name)));
        }

        sections(vec![
            Box::new(section("A sign-up form", column)),
            // `ErrorSummary::new` is the same card with inert bullets.
            Box::new(section(
                "ErrorSummary on its own",
                ErrorSummary::new(["Enter your name", "At least 8 characters"]),
            )),
        ])
    }
}
```

## Properties

| Type | Method | Argument | Effect |
| --- | --- | --- | --- |
| `Form` | `.field()` | `key: &'static str, value: &str, rule: Rule` | Validates `value` with `rule` and records the result under `key`. |
| `Form` | `.field_with()` | `key: &'static str, value: &str, check: impl Fn(&str, &Form) -> Option<String>` | Validates a field with a **cross-field** function receiving its value **and** the partial form (the fields **already declared**): `check(value, form)` can consult `form.value(other)` — a confirmed password, consistent dates, and so on. So declare the referenced field **first**. |
| `Form` | `.matches()` | `key: &'static str, value: &str, other: &'static str, message: impl Into<String>` | A cross-field convenience: `value` must **equal** field `other`'s value (already declared) — the "confirm the password" case. Otherwise `message`. |
| `ErrorSummary` | `.title_text_style()` | `style: TextStyle` | The heading's type, over the theme's and the framework's. |
| `ErrorSummary` | `.bullet_text_style()` | `style: TextStyle` | The bullets' type, over the theme's and the framework's. |

## Behaviour

### `Form`

The validation report of a set of fields, in declaration order. Built by chaining `Form::field`, then consulted. The **values** are recorded so that **cross-field validation** is possible: one field compared with another.

### `Rule`

One field's validation rule: returns `Some(message)` if the value is invalid, `None` if it passes.

### `ErrorSummary`

An **error summary**: an "error"-tinted card listing the messages (a "Please fix N error(s)" title, then one bullet per message), to place at the head of a form after an invalid submission. Built from `Form::errors`. Empty when there is no message, and then it should not be displayed — see `is_empty`.

The bullets are **inert** with `new`; with `links` each one carries an application message emitted on click — typically to **focus** the offending field (via `Command::focus`), the summary then acting as a table of contents of the errors.

## See also

- [TextField](./text-field.md): a text input: labels, hints, errors, icons, passwords, several lines and filters.
- [TextEditingController](./text-editing-controller.md): a field's text held outside the field, to read, fill and clear it from code.
- [Autocomplete](./autocomplete.md): a text field that suggests completions in a floating list.
- [SearchBar](./search-bar.md): the raised pill an application searches from.
- [SearchAnchor](./search-anchor.md): a search bar that opens a search view with suggestions.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`Form`](https://docs.rs/frus/latest/frus/struct.Form.html)
- API reference: [`Rule`](https://docs.rs/frus/latest/frus/struct.Rule.html)
- API reference: [`ErrorSummary`](https://docs.rs/frus/latest/frus/struct.ErrorSummary.html)

Source: [crates/frus-widgets/src/form.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/form.rs#L113-L115), [crates/frus-widgets/src/form.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/form.rs#L50-L50), [crates/frus-widgets/src/form.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/form.rs#L212-L218) @ `e6fba33f5b42`
