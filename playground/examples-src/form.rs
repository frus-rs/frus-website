use frus::{
    center, BuildContext, Button, Checkbox, Column, Container, MediaQuery, Scaffold, SingleChildScrollView, Slider,
    Switch, Text, TextField, Widget,
};

pub fn app(cx: &BuildContext) -> Box<dyn Widget> {
    let name = cx.use_state(|| String::new());
    let terms = cx.use_state(|| false);
    let dark = cx.use_state(|| true);
    let volume = cx.use_state(|| 0.4_f32);

    let (set_name, set_terms, set_dark, set_volume) =
        (name.clone(), terms.clone(), dark.clone(), volume.clone());
    let greeting = if name.get().is_empty() {
        "Hello, whoever you are".to_string()
    } else {
        format!("Hello, {}", name.get())
    };

    // Centred while it fits, and it scrolls when it does not.
    let screen = MediaQuery::of().size;
    Box::new(Scaffold::new().background(cx.theme().background).body(SingleChildScrollView::new().child(Container::new().min_height(screen.height).child(center(
        Container::new().max_width(420.0).padding(24.0).child(
            Column::new()
                .shrink_wrap()
                .spacing(16.0)
                .child(Text::new(greeting).size(24.0))
                .child(
                    TextField::new(name.get())
                        .label("Your name")
                        .on_input(move |value: String| set_name.set(value)),
                )
                .child(
                    Checkbox::new(terms.get())
                        .label("I accept the terms")
                        .on_toggle(move |on: bool| set_terms.set(on)),
                )
                .child(Switch::new(dark.get()).on_toggle(move |on: bool| set_dark.set(on)))
                .child(Text::new(format!("Volume: {:.2}", volume.get())))
                .child(Slider::new(volume.get()).on_change(move |value: f32| set_volume.set(value)))
                .child(Button::new("Send").enabled(terms.get())),
        ),
    )))))
}
