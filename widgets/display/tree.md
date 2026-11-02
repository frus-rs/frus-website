---
title: "Tree"
sidebar_label: "Tree"
sidebar_position: 14
description: "A hierarchy of rows that expand, collapse and select."
custom_edit_url: null
---

# `Tree`

## Purpose

A hierarchy of rows that expand, collapse and select.

## Signature

```rust
pub struct Tree<Msg = crate::callback::Callback> { .. }

impl Tree {
    pub fn new<R: crate::callback::IntoMsg<Msg>>(on_toggle: impl Fn(u64) -> R + 'static) -> Self;
}
```

## Example

![Rendered preview of the Tree demo](/preview/tree.light.png)

From [`frus-examples/widgets/src/features/display/widgets/tree.rs`](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/frus-examples/widgets/src/features/display/widgets/tree.rs):

```rust
//! `Tree` — a hierarchy (files, categories, an org chart) shown as indented rows that
//! expand and collapse. The app owns the structure and which nodes are open, and hands
//! the tree only the rows that are visible.

use std::collections::HashSet;

use frus::{Align, Column, Text, Tree, Widget};

/// One node: its id, its parent's id (`None` at the root), and its label.
pub const NODES: [(u64, Option<u64>, &str); 9] = [
    (1, None, "src"),
    (2, Some(1), "features"),
    (3, Some(2), "display.rs"),
    (4, Some(2), "navigation.rs"),
    (5, Some(1), "lib.rs"),
    (6, None, "assets"),
    (7, Some(6), "logo.png"),
    (8, None, "Cargo.toml"),
    (9, None, "README.md"),
];

/// A visible row: `(id, depth, label, has children, is expanded)`, what `Tree::node` takes.
pub type VisibleRow = (u64, usize, &'static str, bool, bool);

pub fn example() -> Box<dyn Widget> {
    Box::new(frus::component(|cx| {
        let expanded = cx.use_state(|| HashSet::from([1u64]));
        let selected = cx.use_state(|| None::<u64>);

        let toggle = expanded.clone();
        let select = selected.clone();
        // The chevron toggles a node; a click anywhere else on the row selects it.
        let tree = expanded.with(visible_rows).into_iter().fold(
            Tree::new(move |id: u64| {
                toggle.update(|open| {
                    if !open.remove(&id) {
                        open.insert(id);
                    }
                })
            })
            .on_select(move |id: u64| select.set(Some(id)))
            .selected(selected.get()),
            |tree, (id, depth, label, expandable, open)| {
                tree.node(id, depth, label, expandable, open)
            },
        );

        let label = selected
            .get()
            .and_then(|id| NODES.iter().find(|(n, ..)| *n == id))
            .map_or("Nothing selected".to_string(), |(_, _, name)| {
                format!("Selected: {name}")
            });

        Box::new(
            Column::new()
                .spacing(12.0)
                .cross_axis_alignment(Align::Start)
                .child(frus::Container::new().width(300.0).child(tree))
                .child(Text::new(label).color(cx.theme().muted)),
        )
    }))
}

/// The rows to show: every root, and the children of every expanded node, depth first.
pub fn visible_rows(expanded: &HashSet<u64>) -> Vec<VisibleRow> {
    fn walk(parent: Option<u64>, depth: usize, expanded: &HashSet<u64>, out: &mut Vec<VisibleRow>) {
        for &(id, _, label) in NODES.iter().filter(|(_, p, _)| *p == parent) {
            let has_children = NODES.iter().any(|(_, p, _)| *p == Some(id));
            let open = expanded.contains(&id);
            out.push((id, depth, label, has_children, open));
            if has_children && open {
                walk(Some(id), depth + 1, expanded, out);
            }
        }
    }
    let mut rows = Vec::new();
    walk(None, 0, expanded, &mut rows);
    rows
}
```

## Properties

| Method | Argument | Effect |
| --- | --- | --- |
| `.text_style()` | `style: TextStyle` | — |
| `.on_select()` | `on_select: impl Fn(u64) -> R + 'static` | Makes the nodes **selectable**: `on_select(id)` when the row's body is clicked (outside the chevron), **leaves included**. Without it, clicking the row expands or collapses. |
| `.selected()` | `id: Option<u64>` | Marks the **selected** node (highlighted). `None` = none. |
| `.node()` | `id: u64, depth: usize, label: impl Into<String>, expandable: bool, expanded: bool` | Adds a visible row: `id`, `depth` (indentation), `label`, whether the node has children (`expandable`) and whether it is expanded (`expanded`). |

## Behaviour

A hierarchical tree (visible rows, flattened).

## See also

- [BarChart & LineChart](./chart.md): themed charts for comparing amounts and reading trends.
- [Timeline](./timeline.md): a vertical chronology of events joined by a line.
- [Breadcrumb](./breadcrumb.md): the trail from the top of a hierarchy to the current page.
- The guide: [Text, colour and the theme](/docs/guide/style)
- API reference: [`Tree`](https://docs.rs/frus/latest/frus/struct.Tree.html)

Source: [crates/frus-widgets/src/tree.rs](https://github.com/KalybosPro/frus/blob/e6fba33f5b42d5a93e23a6b0e43fce3f366a3692/crates/frus-widgets/src/tree.rs#L167-L174) @ `e6fba33f5b42`
