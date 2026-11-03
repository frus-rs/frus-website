---
title: "Permission"
sidebar_label: "Permission"
sidebar_position: 14
description: "Asking for the camera, the microphone, the location and notifications."
custom_edit_url: null
---

# `Permission`

## Purpose

Asking for the camera, the microphone, the location and notifications.

## Signature

```rust
pub enum Permission {
    /// The camera.
    Camera,
    /// The microphone.
    Microphone,
    /// Where the device is.
    Location,
    /// Showing notifications.
    Notifications,
}
```

## Example

![Rendered preview of the Permission demo](/preview/permissions.light.png)

From [`frus-examples/widgets/src/features/interaction/widgets/permissions.rs`](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/interaction/widgets/permissions.rs):

```rust
//! `Permission` — asking the person for the camera, the microphone, the location and
//! notifications, and knowing what they said. `status()` looks without asking; `request()` asks
//! when there is something to ask. Both are `async`, so they run from an async handler.

use frus::{
    component, open_permission_settings, Align, Button, Column, Permission, PermissionStatus,
    Row, Text, Variant, Widget,
};

use crate::common::shared::{section, sections};

const ALL: [Permission; 4] = [
    Permission::Camera,
    Permission::Microphone,
    Permission::Location,
    Permission::Notifications,
];

fn name(permission: Permission) -> &'static str {
    match permission {
        Permission::Camera => "Camera",
        Permission::Microphone => "Microphone",
        Permission::Location => "Location",
        Permission::Notifications => "Notifications",
    }
}

fn said(status: Option<PermissionStatus>) -> &'static str {
    match status {
        None => "not looked at yet",
        Some(PermissionStatus::Granted) => "granted",
        Some(PermissionStatus::Ask) => "not decided: asking shows the question",
        Some(PermissionStatus::Denied) => "refused: asking shows the question again",
        Some(PermissionStatus::Blocked) => "blocked: only the settings can change it",
        Some(PermissionStatus::Unavailable) => "unavailable here",
    }
}

pub fn example() -> Box<dyn Widget> {
    Box::new(component(|cx| {
        let statuses = cx.use_state(|| [None::<PermissionStatus>; 4]);

        let mut rows = Column::new()
            .spacing(12.0)
            .cross_axis_alignment(Align::Start);
        for (index, permission) in ALL.into_iter().enumerate() {
            let (looked, answered) = (statuses.clone(), statuses.clone());
            // Looking does not ask; asking waits for the person's answer.
            let look = cx.async_callback(move || {
                let looked = looked.clone();
                async move {
                    let status = permission.status().await;
                    looked.update(|all| all[index] = Some(status));
                }
            });
            let ask = cx.async_callback(move || {
                let answered = answered.clone();
                async move {
                    let status = permission.request().await;
                    answered.update(|all| all[index] = Some(status));
                }
            });
            rows = rows.child(
                Column::new()
                    .spacing(4.0)
                    .cross_axis_alignment(Align::Start)
                    .child(Text::new(format!(
                        "{}: {}",
                        name(permission),
                        said(statuses.get()[index])
                    )))
                    .child(
                        Row::new()
                            .spacing(8.0)
                            .child(
                                Button::new("Look")
                                    .variant(Variant::Outlined)
                                    .on_press(look),
                            )
                            .child(Button::new("Ask").on_press(ask)),
                    ),
            );
        }

        sections(vec![
            Box::new(section("Each permission, looked at or asked for", rows)),
            Box::new(section(
                "After a refusal for good",
                Button::new("Open the settings")
                    .variant(Variant::Tonal)
                    .on_press(open_permission_settings),
            )),
        ])
    }))
}
```

## Properties

No builder methods: everything is set through the constructor.

## Behaviour

Something an application asks the person's permission for.

## See also

- [Disabled state](./disabled.md): one enabled flag on every control: greyed out, inert, value kept.
- [Semantics](./semantics.md): what a screen reader is told about a widget, said from outside it.
- The guide: [Taking input](/docs/guide/input)
- API reference: [`Permission`](https://docs.rs/frus/latest/frus/enum.Permission.html)

Source: [crates/frus-shell/src/permission.rs](https://github.com/frus-rs/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-shell/src/permission.rs#L59-L68) @ `e6fba33f5b42`
