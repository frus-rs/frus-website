---
title: Widget catalog
sidebar_label: Widget catalog
sidebar_position: 0
slug: /
custom_edit_url: null
---

# Widget catalog

frus ships one widget library, `frus-widgets`. Its defaults come from the theme, and an
application can override every one of them. This catalog has **175 pages as of
`e6fba33f5b42`**, one for each demo of frus's widget gallery, in twelve families.

Every page is written from the widget's own source and from the gallery's demo, at the revision
its source line names. The gallery also runs in the browser, at
<https://frus-rs.github.io/frus/>, if yours has WebGPU.

## The families

| Family | Pages | What is in it |
| --- | --- | --- |
| [Layout](./layout) | 23 | Boxes, rows, columns, stacks and constraints |
| [Text](./text) | 7 | Text, styles, rich and selectable text |
| [Buttons & menus](./buttons) | 11 | Buttons, icon buttons, toggles and menus |
| [Inputs & forms](./inputs) | 20 | Text fields, choices, sliders, pickers and validation |
| [Display](./display) | 15 | Cards, chips, avatars, icons, images, tables and charts |
| [Feedback](./feedback) | 12 | Dialogs, snack bars, sheets, banners and progress |
| [Navigation](./navigation) | 15 | App bars, tabs, navigation bars, rails and drawers |
| [Lists & scrolling](./scrolling) | 16 | Lists, grids, pages, reordering and expansion |
| [Animation](./animation) | 16 | Implicit animations, transitions and heroes |
| [Painting & effects](./painting) | 11 | Decoration, clipping, transforms, custom painting and filters |
| [Interaction](./interaction) | 14 | Gestures, hover, drag and drop, focus and shortcuts |
| [State & async](./state) | 15 | Hooks, notifiers, futures, streams, theme and screen size |

## How to read a widget page

| Part | What it is |
| --- | --- |
| Purpose | One sentence: what the widget is for. |
| Signature | The type and its constructors as they are spelled in the source, copied verbatim. |
| Example | The demo rendered, and the gallery's file that builds it. The gallery compiles that file, so it is never out of date. |
| Properties | The builder methods: each one's arguments as written, and what it changes. |
| Behaviour | The type's own documentation: layout, events, what screen readers are told, platform differences. |
| See also | The family's neighbouring widgets, the guide's page, and the API reference. |
| Source | A permalink to the file the page was written from, at the pinned revision. |

- **Every style can be overridden.** A widget takes its colours, type and shape from the theme,
  never from a constant. Restyle one instance with its builder methods, or every widget of a
  kind through the theme.
- **Interactive widgets are controlled.** A checkbox, a slider or a text field shows the value
  you give it, and tells you when the user changes it. The state stays yours.
