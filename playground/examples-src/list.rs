use frus::{center, Align, AppBar, BuildContext, Column, Container, Divider, Icon, Icons, ListTile, Scaffold, SingleChildScrollView, Text, Widget};

pub fn app(cx: &BuildContext) -> Box<dyn Widget> {
    let mut list = Column::new().shrink_wrap().cross_axis_alignment(Align::Stretch);

    for day in 1..=30 {
        list = list
            .child(
                ListTile::new()
                    .leading(Icon::new(Icons::STAR))
                    .title(format!("Day {day}"))
                    .subtitle(format!("{} tasks left", day * 2)),
            )
            .child(Divider::new());
    }

    Box::new(
        Scaffold::new()
            .background(cx.theme().background)
            .app_bar(AppBar::new().title(Text::new("Week")))
            .body(SingleChildScrollView::new().child(center(Container::new().max_width(480.0).child(list)))),
    )
}
