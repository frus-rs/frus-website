use frus::{
    button, center, column, row, text, Align, BuildContext, Container, MediaQuery, Scaffold, SingleChildScrollView,
    Variant, Widget,
};

pub fn app(cx: &BuildContext) -> Box<dyn Widget> {
    let count = cx.use_state(|| 0);
    let (up, down) = (count.clone(), count.clone());

    // Centred while it fits, and it scrolls when it does not.
    let screen = MediaQuery::of().size;
    Box::new(Scaffold::new().background(cx.theme().background).body(SingleChildScrollView::new().child(Container::new().min_height(screen.height).child(center(
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
    )))))
}
