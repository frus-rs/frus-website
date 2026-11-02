use frus::{button, center, column, row, text, Align, BuildContext, Scaffold, Variant, Widget};

pub fn app(cx: &BuildContext) -> Box<dyn Widget> {
    let count = cx.use_state(|| 0);
    let (up, down) = (count.clone(), count.clone());

    Box::new(Scaffold::new().background(cx.theme().background).body(center(
        column![
            text(format!("{}", count.get())).size(48.0),
            row![
                button("+", move || up.update(|n| *n += 1)).variant(Variant::Filled),
                button("-", move || down.update(|n| *n -= 1)).variant(Variant::Outlined),
            ]
            .gap(20.0),
        ]
        .gap(16.0)
        .align(Align::Center),
    )))
}
