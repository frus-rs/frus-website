//! The table the interpreter calls into: which widgets exist, and which of their methods the
//! playground offers. Every entry calls the real frus method.

use frus::{
    AppBar, Button, Callback, Card, Center, Checkbox, Chip, CircleAvatar, CircularProgressIndicator,
    Color, Colors, Column, Container, Divider, Expanded, Flex, Icon, IconButton, Icons,
    LinearProgressIndicator, ListTile, Padding, Row, Scaffold, SizedBox, Slider, Spacer, Stack, Switch,
    Text, TextField, Widget, Wrap,
};

use crate::interp::{Args, Failure, Res, Value};

/// Writes the widget kinds: the enum, and the conversion to a boxed widget.
macro_rules! nodes {
    ($($name:ident => $ty:ty),* $(,)?) => {
        pub enum Node { $($name($ty)),* }

        impl Node {
            pub fn into_widget(self) -> Box<dyn Widget> {
                match self { $(Node::$name(w) => Box::new(w)),* }
            }
        }
    };
}

nodes! {
    Text => Text,
    Flex => Flex,
    Row => Row,
    Column => Column,
    Container => Container,
    Padding => Padding,
    Center => Center,
    SizedBox => SizedBox,
    Spacer => Spacer,
    Expanded => Expanded,
    Stack => Stack,
    Card => Card,
    Divider => Divider,
    Button => Button,
    IconButton => IconButton,
    Icon => Icon,
    Checkbox => Checkbox,
    Switch => Switch,
    Slider => Slider,
    TextField => TextField,
    Chip => Chip,
    CircleAvatar => CircleAvatar,
    ListTile => ListTile,
    LinearProgressIndicator => LinearProgressIndicator,
    CircularProgressIndicator => CircularProgressIndicator,
    Scaffold => Scaffold,
    AppBar => AppBar,
}

/// One widget's methods: `name(conversions...)`, each conversion an [`Args`] method.
macro_rules! methods {
    ($variant:ident, $w:ident, $name:ident, $a:ident, $($method:ident($($conv:ident),*)),* $(,)?) => {
        match $name {
            $(stringify!($method) => {
                let built = $w.$method($($a.$conv()?),*);
                $a.finish()?;
                Ok(Node::$variant(built))
            })*
            _ => Err(unknown(stringify!($variant), $name, &[$(stringify!($method)),*], $a.span())),
        }
    };
}

fn unknown(ty: &str, name: &str, known: &[&str], span: proc_macro2::Span) -> Failure {
    Failure::at(
        span,
        format!("The playground does not offer `{ty}::{name}` yet. It knows: {}.", known.join(", ")),
    )
}

/// A method call on a widget being built.
pub fn method(node: Node, name: &str, mut a: Args) -> Res<Node> {
    let a = &mut a;
    match node {
        Node::Text(w) => methods!(Text, w, name, a,
            size(f32), color(color), align(text_align), max_lines(usize), heading(), wrap(), no_wrap(),
            ellipsis(), italic(), underline(), strikethrough(), selectable()),
        Node::Flex(w) => methods!(Flex, w, name, a,
            child(widget), gap(f32), run_gap(f32), padding(f32), width(f32), height(f32), flex(f32),
            justify(justify), align(align), wrap(), reverse()),
        Node::Row(w) => methods!(Row, w, name, a,
            child(widget), spacing(f32), main_axis_alignment(justify), cross_axis_alignment(align),
            shrink_wrap()),
        Node::Column(w) => methods!(Column, w, name, a,
            child(widget), spacing(f32), main_axis_alignment(justify), cross_axis_alignment(align),
            shrink_wrap()),
        Node::Container(w) => methods!(Container, w, name, a,
            child(widget), width(f32), height(f32), min_width(f32), max_width(f32), min_height(f32),
            max_height(f32), padding(f32), margin(f32), radius(f32), color(color), border(f32, color),
            shadow(f32, f32, f32, color), opacity(f32), rotated(f32), flex(f32), on_click(callback)),
        Node::Padding(_) => Err(unknown("Padding", name, &[], a.span())),
        Node::Center(w) => methods!(Center, w, name, a, width_factor(f32), height_factor(f32)),
        Node::SizedBox(w) => methods!(SizedBox, w, name, a, width(f32), height(f32), child(widget)),
        Node::Spacer(w) => methods!(Spacer, w, name, a, flex(f32)),
        Node::Expanded(w) => methods!(Expanded, w, name, a, flex(f32), loose()),
        Node::Stack(w) => methods!(Stack, w, name, a, layer(widget), width(f32), height(f32), flex(f32)),
        Node::Card(w) => methods!(Card, w, name, a,
            child(widget), filled(), outlined(), padding(f32), margin(f32), elevation(f32),
            color(color), radius(f32)),
        Node::Divider(w) => methods!(Divider, w, name, a,
            height(f32), thickness(f32), indent(f32), end_indent(f32), color(color)),
        Node::Button(w) => methods!(Button, w, name, a,
            on_press(callback), on_long_press(callback), variant(variant), enabled(bool), icon(widget),
            color(color), label_color(color), radius(f32), height(f32), padding(f32), min_width(f32),
            elevation(f32), size(f32)),
        Node::IconButton(w) => methods!(IconButton, w, name, a,
            on_press(callback), label(string), selected(bool), enabled(bool), size(f32), icon_size(f32),
            color(color), icon_color(color), radius(f32)),
        Node::Icon(w) => methods!(Icon, w, name, a, size(f32), color(color)),
        Node::Checkbox(w) => methods!(Checkbox, w, name, a,
            label(string), enabled(bool), error(bool), on_toggle(on_bool), fill_color(color),
            check_color(color), radius(f32)),
        Node::Switch(w) => methods!(Switch, w, name, a,
            on_toggle(on_bool), enabled(bool), track_color(color), thumb_color(color)),
        Node::Slider(w) => methods!(Slider, w, name, a,
            on_change(on_f32), range(f32, f32), divisions(usize), width(f32), enabled(bool),
            active_color(color), inactive_color(color), thumb_color(color)),
        Node::TextField(w) => methods!(TextField, w, name, a,
            on_input(on_string), label(string), placeholder(string), helper(string), error(string),
            width(f32), outlined(), filled(), borderless(), multiline(), obscure(bool), enabled(bool),
            prefix_icon(icon), suffix_icon(icon), read_only()),
        Node::Chip(w) => methods!(Chip, w, name, a,
            selected(bool), leading(icon), enabled(bool), on_press(callback), on_remove(callback),
            color(color), selected_color(color), label_color(color)),
        Node::CircleAvatar(w) => methods!(CircleAvatar, w, name, a,
            child(widget), background_color(color), foreground_color(color),
            radius(f32), size(f32)),
        Node::ListTile(w) => methods!(ListTile, w, name, a,
            title(string), subtitle(string), leading(widget), trailing(widget), on_tap(callback),
            selected(bool), enabled(bool), dense(), three_line(), tile_color(color)),
        Node::LinearProgressIndicator(w) => methods!(LinearProgressIndicator, w, name, a,
            width(f32), color(color), track_color(color), min_height(f32), radius(f32)),
        Node::CircularProgressIndicator(w) => methods!(CircularProgressIndicator, w, name, a,
            size(f32), color(color), track_color(color), stroke_width(f32)),
        Node::Scaffold(w) => methods!(Scaffold, w, name, a,
            app_bar(widget), body(widget), fab(widget), background(color)),
        Node::AppBar(w) => methods!(AppBar, w, name, a,
            title(widget), leading(widget), action(widget), center_title(bool), background(color),
            foreground(color), elevation(f32), height(f32)),
    }
}

/// `Type::name(args)`.
pub fn constructor(ty: &str, name: &str, mut a: Args) -> Res<Value> {
    let span = a.span();
    let a = &mut a;
    let node = match (ty, name) {
        ("Text", "new") => Node::Text(Text::new(a.string()?)),
        ("Row", "new") => Node::Row(Row::new()),
        ("Column", "new") => Node::Column(Column::new()),
        ("Flex", "row") => Node::Flex(Flex::row()),
        ("Flex", "column") => Node::Flex(Flex::column()),
        ("Wrap", "new") => Node::Flex(Wrap::new()),
        ("Container", "new") => Node::Container(Container::new()),
        ("Padding", "new") => {
            let insets = a.insets()?;
            Node::Padding(Padding::new(insets, a.widget()?))
        }
        ("Center", "new") => Node::Center(Center::new(a.widget()?)),
        ("SizedBox", "empty") => Node::SizedBox(SizedBox::empty()),
        ("SizedBox", "new") => Node::SizedBox(SizedBox::new(a.widget()?)),
        ("Spacer", "new") => Node::Spacer(Spacer::new()),
        ("Expanded", "new") => Node::Expanded(Expanded::new(a.widget()?)),
        ("Stack", "new") => Node::Stack(Stack::new()),
        ("Card", "new") => Node::Card(Card::new()),
        ("Divider", "new") => Node::Divider(Divider::new()),
        ("Button", "new") => Node::Button(Button::new(a.string()?)),
        ("IconButton", "new") => Node::IconButton(IconButton::new(a.icon()?)),
        ("Icon", "new") => Node::Icon(Icon::new(a.icon()?)),
        ("Checkbox", "new") => Node::Checkbox(Checkbox::new(a.bool()?)),
        ("Switch", "new") => Node::Switch(Switch::new(a.bool()?)),
        ("Slider", "new") => Node::Slider(Slider::new(a.f32()?)),
        ("TextField", "new") => Node::TextField(TextField::new(a.string()?)),
        ("Chip", "new") => Node::Chip(Chip::new(a.string()?)),
        ("CircleAvatar", "new") => Node::CircleAvatar(CircleAvatar::new()),
        ("CircleAvatar", "initials") => Node::CircleAvatar(CircleAvatar::initials(a.string()?)),
        ("ListTile", "new") => Node::ListTile(ListTile::new()),
        ("LinearProgressIndicator", "new") => Node::LinearProgressIndicator(LinearProgressIndicator::new(a.f32()?)),
        ("LinearProgressIndicator", "indeterminate") => {
            Node::LinearProgressIndicator(LinearProgressIndicator::indeterminate())
        }
        ("CircularProgressIndicator", "new") => Node::CircularProgressIndicator(CircularProgressIndicator::new()),
        ("CircularProgressIndicator", "determinate") => {
            Node::CircularProgressIndicator(CircularProgressIndicator::determinate(a.f32()?))
        }
        ("Scaffold", "new") => Node::Scaffold(Scaffold::new()),
        ("AppBar", "new") => Node::AppBar(AppBar::new()),
        ("Color", "hex") => return Ok(Value::Color(Color::hex(&a.string()?))),
        ("Insets", "uniform") => return Ok(Value::Insets(frus::Insets::uniform(a.f32()?))),
        ("Insets", "symmetric") => {
            let horizontal = a.f32()?;
            return Ok(Value::Insets(frus::Insets::symmetric(horizontal, a.f32()?)));
        }
        _ => {
            return Err(Failure::at(span, format!("The playground does not offer `{ty}::{name}` yet.")));
        }
    };
    a.finish()?;
    Ok(Value::widget(node))
}

/// A shorthand function: `text("hi")`, `button("Ok", move || ...)`.
pub fn function(name: &str, mut a: Args) -> Res<Value> {
    let span = a.span();
    let a = &mut a;
    let node = match name {
        "text" => Node::Text(Text::new(a.string()?)),
        "button" => {
            let label = a.string()?;
            let on_press: Callback = a.callback()?;
            Node::Button(frus::button(label, on_press))
        }
        "center" => Node::Center(Center::new(a.widget()?)),
        "expanded" => Node::Expanded(Expanded::new(a.widget()?)),
        "spacer" => Node::Flex(frus::spacer()),
        _ => {
            return Err(Failure::at(span, format!("The playground does not know the function `{name}` yet.")));
        }
    };
    a.finish()?;
    Ok(Value::widget(node))
}

/// `row![..]` and `column![..]`.
pub fn flex_macro(name: &str, mut a: Args) -> Res<Value> {
    let mut flex = if name == "row" { Flex::row() } else { Flex::column() };
    for _ in 0..a.count {
        flex = flex.child(a.widget()?);
    }
    Ok(Value::widget(Node::Flex(flex)))
}

/// Writes a lookup of named constants.
macro_rules! named {
    ($name:expr, $wrap:path, $owner:ty, $($c:ident),* $(,)?) => {
        match $name {
            $(stringify!($c) => Some($wrap(<$owner>::$c)),)*
            _ => None,
        }
    };
}

/// `Type::NAME`.
pub fn constant(ty: &str, name: &str) -> Option<Value> {
    use frus::{Align, Justify, TextAlign, Variant};
    match ty {
        "Colors" => named!(name, Value::Color, Colors,
            WHITE, BLACK, RED, PINK, PURPLE, INDIGO, BLUE, CYAN, TEAL, GREEN, LIME, YELLOW, AMBER,
            ORANGE, BROWN, GREY, TRANSPARENT),
        "Icons" => named!(name, Value::Icon, Icons,
            ADD, REMOVE, CLOSE, CHECK, MENU, SEARCH, HOME, SETTINGS, STAR, FAVORITE, DELETE, EDIT,
            PERSON, EMAIL, PHONE, SHARE, INFO, WARNING, ERROR, ARROW_BACK, ARROW_FORWARD, MORE_VERT,
            NOTIFICATIONS, CAMERA_ALT, MAP, SEND, LOCK, VISIBILITY, THUMB_UP, SHOPPING_CART),
        "Justify" => named!(name, Value::Justify, Justify, Start, Center, End, SpaceBetween, SpaceAround),
        "Align" => named!(name, Value::Align, Align, Start, Center, End, Stretch),
        "Variant" => named!(name, Value::Variant, Variant, Filled, Tonal, Elevated, Outlined),
        "TextAlign" => named!(name, Value::TextAlign, TextAlign, Start, End, Center),
        _ => None,
    }
}
