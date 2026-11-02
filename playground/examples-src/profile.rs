use frus::{
    center, Align, BuildContext, Button, Card, Chip, CircleAvatar, Colors, Column, Container, Icon, Icons, Row,
    Scaffold, Text, Variant, Widget,
};

pub fn app(cx: &BuildContext) -> Box<dyn Widget> {
    let followers = cx.use_state(|| 128);
    let follow = followers.clone();

    let about = Column::new()
        .shrink_wrap()
        .spacing(12.0)
        .cross_axis_alignment(Align::Start)
        .child(
            Row::new()
                .spacing(16.0)
                .child(CircleAvatar::initials("A").radius(32.0))
                .child(
                    Column::new()
                        .shrink_wrap()
                        .spacing(2.0)
                        .cross_axis_alignment(Align::Start)
                        .child(Text::new("Ada Lovelace").size(22.0))
                        .child(Text::new(format!("{} followers", followers.get())).size(14.0)),
                ),
        )
        .child(Text::new("Writes the first programs for an engine nobody has built yet.").wrap())
        .child(
            Row::new()
                .spacing(8.0)
                .child(Chip::new("Mathematics").leading(Icons::STAR))
                .child(Chip::new("Engines")),
        )
        .child(
            Row::new()
                .spacing(8.0)
                .child(
                    Button::new("Follow")
                        .icon(Icon::new(Icons::ADD))
                        .on_press(move || follow.update(|n| *n += 1)),
                )
                .child(
                    Button::new("Message")
                        .variant(Variant::Outlined)
                        .label_color(Colors::TEAL)
                        .on_press(|| {}),
                ),
        );

    Box::new(Scaffold::new().background(cx.theme().background).body(center(
        Container::new().max_width(460.0).child(Card::new().margin(24.0).padding(24.0).child(about)),
    )))
}
