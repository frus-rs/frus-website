//! The table the interpreter calls into: which widgets exist, and which of their constructors and
//! methods the playground offers. Every entry calls the real frus function, so the compiler checks
//! it, and the same table writes the list the editor completes from ([`api_json`]).

use frus::{
    Alert, AppBar, AspectRatio, Badge, Badged, BottomNavigationBar, BottomNavigationBarItem, Button, Callback, Card,
    Center, Checkbox, Chip, CircleAvatar, CircularProgressIndicator, ClipRRect, Color, Colors, Column, Container,
    Dismissible, Divider, Expanded, ExpansionTile, Flex, FloatingActionButton, GridView, Icon, IconButton, Icons,
    Image, Kbd, LinearProgressIndicator, ListTile, ListView, Opacity, Padding, Positioned, Radio, Rating, Row,
    Scaffold, SegmentedButton, SingleChildScrollView, SizedBox, Skeleton, Slider, Spacer, Stack, Stepper, Switch,
    TabBar, Text, TextField, Tooltip, Visibility, Widget, Wrap,
};

use crate::interp::{Args, Failure, Res, Value};

/// Writes, from one list: the widget kinds, their conversion to a boxed widget, the constructors,
/// the methods, and the same names as data.
macro_rules! widgets {
    ($(
        $variant:ident : [$($ctor:ident($($carg:ident),*)),* $(,)?] [$($method:ident($($marg:ident),*)),* $(,)?]
    )*) => {
        pub enum Node { $($variant($variant)),* }

        impl Node {
            pub fn into_widget(self) -> Box<dyn Widget> {
                match self { $(Node::$variant(w) => Box::new(w)),* }
            }
        }

        fn table_method(node: Node, name: &str, a: &mut Args) -> Res<Node> {
            match node {
                $(Node::$variant(w) => match name {
                    $(stringify!($method) => {
                        let built = w.$method($(a.$marg()?),*);
                        a.finish()?;
                        Ok(Node::$variant(built))
                    })*
                    _ => {
                        let _ = w;
                        Err(unknown(stringify!($variant), name, &[$(stringify!($method)),*], a.span()))
                    }
                },)*
            }
        }

        fn table_constructor(ty: &str, name: &str, a: &mut Args) -> Res<Option<Node>> {
            match (ty, name) {
                $($((stringify!($variant), stringify!($ctor)) => {
                    let built = $variant::$ctor($(a.$carg()?),*);
                    a.finish()?;
                    Ok(Some(Node::$variant(built)))
                })*)*
                _ => Ok(None),
            }
        }

        const TABLE: &[Entry] = &[$(Entry {
            name: stringify!($variant),
            constructors: &[$((stringify!($ctor), &[$(stringify!($carg)),*])),*],
            methods: &[$((stringify!($method), &[$(stringify!($marg)),*])),*],
        }),*];
    };
}

struct Entry {
    name: &'static str,
    constructors: &'static [(&'static str, &'static [&'static str])],
    methods: &'static [(&'static str, &'static [&'static str])],
}

widgets! {
    Text: [new(string)]
        [size(f32), color(color), align(text_align), max_lines(usize), heading(), wrap(), no_wrap(),
         ellipsis(), italic(), underline(), strikethrough(), selectable()]
    Flex: [row(), column()]
        [child(widget), gap(f32), run_gap(f32), padding(f32), width(f32), height(f32), flex(f32),
         justify(justify), align(align), wrap(), reverse()]
    Row: [new()]
        [child(widget), spacing(f32), main_axis_alignment(justify), cross_axis_alignment(align), shrink_wrap()]
    Column: [new()]
        [child(widget), spacing(f32), main_axis_alignment(justify), cross_axis_alignment(align), shrink_wrap()]
    Container: [new()]
        [child(widget), width(f32), height(f32), min_width(f32), max_width(f32), min_height(f32), max_height(f32),
         padding(f32), margin(f32), radius(f32), color(color), border(f32, color), shadow(f32, f32, f32, color),
         opacity(f32), rotated(f32), flex(f32), on_click(callback)]
    Padding: [new(insets, widget)] []
    Center: [new(widget)] [width_factor(f32), height_factor(f32)]
    SizedBox: [empty(), new(widget), square(f32, widget), expand(widget)]
        [width(f32), height(f32), child(widget)]
    Spacer: [new()] [flex(f32)]
    Expanded: [new(widget)] [flex(f32), loose()]
    Stack: [new()] [layer(widget), width(f32), height(f32), flex(f32)]
    Positioned: [new(widget), fill(widget)]
        [left(f32), top(f32), right(f32), bottom(f32), width(f32), height(f32), inset(f32)]
    AspectRatio: [new(f32)] [child(widget)]
    Opacity: [new(f32, widget)] []
    ClipRRect: [new(f32)] [child(widget)]
    Visibility: [new(widget)] [visible(bool), maintain_size(), replacement(widget)]
    SingleChildScrollView: [new()]
        [child(widget), reverse(), width(f32), height(f32), flex(f32), padding(f32)]
    ListView: [new(usize, f32, builder), builder(usize, builder)]
        [estimated_extent(f32), reverse(), padding(f32), width(f32), height(f32), flex(f32)]
    GridView: [new(usize), extent(f32, usize, builder), builder(usize, usize, builder)]
        [cell(widget), gap(f32), row_gap(f32), column_gap(f32), aspect(f32), tile_height(f32), width(f32),
         height(f32), flex(f32)]
    Card: [new()]
        [child(widget), filled(), outlined(), padding(f32), margin(f32), elevation(f32), color(color), radius(f32)]
    Divider: [new()] [height(f32), thickness(f32), indent(f32), end_indent(f32), color(color)]
    Button: [new(string), with_child(widget)]
        [on_press(callback), on_long_press(callback), variant(variant), enabled(bool), icon(widget), color(color),
         label_color(color), radius(f32), height(f32), padding(f32), min_width(f32), elevation(f32), size(f32)]
    IconButton: [new(icon)]
        [on_press(callback), label(string), selected(bool), enabled(bool), size(f32), icon_size(f32), color(color),
         icon_color(color), radius(f32)]
    FloatingActionButton: [new(icon), extended(string)]
        [icon(icon), small(), large(), on_press(callback), enabled(bool), background(color), foreground(color),
         elevation(f32), radius(f32), icon_size(f32)]
    SegmentedButton: [new(usize, on_usize)]
        [segment(string), radius(f32), selected_color(color), label_color(color), selected_label_color(color),
         border_color(color), height(f32), padding(f32), enabled(bool), show_selected_icon(bool)]
    Icon: [new(icon)] [size(f32), color(color)]
    Checkbox: [new(bool), maybe(maybe_bool)]
        [label(string), enabled(bool), error(bool), on_toggle(on_bool), fill_color(color), check_color(color),
         radius(f32)]
    Radio: [new(bool)]
        [label(string), label_size(f32), on_select(callback), enabled(bool), selected_color(color),
         border_color(color), label_color(color)]
    Switch: [new(bool)] [on_toggle(on_bool), enabled(bool), track_color(color), thumb_color(color)]
    Slider: [new(f32)]
        [on_change(on_f32), range(f32, f32), divisions(usize), width(f32), enabled(bool), active_color(color),
         inactive_color(color), thumb_color(color)]
    Rating: [new(u32, u32, on_u32)] [enabled(bool)]
    Stepper: [new(i32, on_i32)] [range(i32, i32), enabled(bool), step(i32)]
    TextField: [new(string)]
        [on_input(on_string), label(string), placeholder(string), helper(string), error(string), width(f32),
         outlined(), filled(), borderless(), multiline(), obscure(bool), enabled(bool), prefix_icon(icon),
         suffix_icon(icon), read_only()]
    Chip: [new(string)]
        [selected(bool), leading(icon), enabled(bool), on_press(callback), on_remove(callback), color(color),
         selected_color(color), label_color(color)]
    CircleAvatar: [new(), initials(string)]
        [child(widget), background_color(color), foreground_color(color), radius(f32), size(f32)]
    Badge: [new(string), count(u32), dot()]
        [max_count(u32), label_visible(bool), background_color(color), text_color(color), padding(f32)]
    Badged: [] []
    Kbd: [new(string)] []
    Tooltip: [new(string)]
        [child(widget), enabled(bool), background(color), text_color(color), text_align(text_align), max_width(f32),
         radius(f32)]
    Alert: [new(string)] [title(string), success(), warning(), error()]
    Skeleton: [new()] [width(f32), height(f32), radius(f32)]
    Image: [network(string)] [width(f32), height(f32), size(f32, f32), tint(color), opacity(f32), semantic_label(string)]
    ListTile: [new()]
        [title(string), subtitle(string), leading(widget), trailing(widget), on_tap(callback), selected(bool),
         enabled(bool), dense(), three_line(), tile_color(color)]
    ExpansionTile: [new(string, bool, callback)]
        [content(widget), subtitle(string), leading(widget), trailing(widget), dense(), background_color(color),
         text_color(color), icon_color(color), radius(f32)]
    Dismissible: [new(widget)]
        [on_dismiss(callback), on_dismiss_to_start(callback), on_dismiss_to_end(callback), threshold(f32),
         background(widget), secondary_background(widget), width(f32), height(f32), flex(f32)]
    LinearProgressIndicator: [new(f32), indeterminate()]
        [width(f32), color(color), track_color(color), min_height(f32), radius(f32)]
    CircularProgressIndicator: [new(), determinate(f32)]
        [size(f32), color(color), track_color(color), stroke_width(f32)]
    TabBar: [new(usize, on_usize)]
        [tab(string, widget), icon_tab(icon, string, widget), icon_only_tab(icon, string, widget), swipeable(bool),
         scrollable(bool), enabled(bool), indicator_color(color), label_color(color),
         unselected_label_color(color), divider_color(color)]
    BottomNavigationBar: [new(usize, on_usize)]
        [item(nav_item), elevation(f32), background_color(color), icon_size(f32), selected_item_color(color),
         unselected_item_color(color), show_selected_labels(bool), show_unselected_labels(bool)]
    Scaffold: [new()] [app_bar(widget), body(widget), fab(widget), background(color)]
    AppBar: [new()]
        [title(widget), leading(widget), action(widget), center_title(bool), background(color), foreground(color),
         elevation(f32), height(f32)]
}

fn unknown(ty: &str, name: &str, known: &[&str], span: proc_macro2::Span) -> Failure {
    let offered = if known.is_empty() {
        "It has no methods here.".to_string()
    } else {
        format!("It knows: {}.", known.join(", "))
    };
    Failure::at(span, format!("The playground does not offer `{ty}::{name}` yet. {offered}"))
}

/// A method call on a widget being built.
pub fn method(node: Node, name: &str, mut a: Args) -> Res<Node> {
    if let (Node::Badge(badge), "on") = (&node, name) {
        // `on` is the one method that gives back another type.
        let _ = badge;
        let child = a.widget()?;
        a.finish()?;
        let Node::Badge(badge) = node else { unreachable!() };
        return Ok(Node::Badged(badge.on(child)));
    }
    table_method(node, name, &mut a)
}

/// `Type::name(args)`.
pub fn constructor(ty: &str, name: &str, mut a: Args) -> Res<Value> {
    let span = a.span();
    let a = &mut a;
    // What is not a widget, and the one constructor that gives back another type.
    match (ty, name) {
        ("Color", "hex") => {
            let code = a.string()?;
            return Color::try_hex(&code)
                .map(Value::Color)
                .ok_or_else(|| Failure::at(span, format!("`{code}` is not a colour: write one like \"#3B82F6\".")));
        }
        ("MediaQuery", "of") => {
            let size = frus::MediaQuery::of().size;
            return Ok(Value::Screen(size.width, size.height));
        }
        ("Insets", "uniform") => return Ok(Value::Insets(frus::Insets::uniform(a.f32()?))),
        ("Insets", "symmetric") => {
            let horizontal = a.f32()?;
            return Ok(Value::Insets(frus::Insets::symmetric(horizontal, a.f32()?)));
        }
        ("BottomNavigationBarItem", "new") => {
            let icon = a.icon()?;
            return Ok(Value::NavItem(icon, a.string()?.into()));
        }
        ("Wrap", "new") => return Ok(Value::widget(Node::Flex(Wrap::new()))),
        _ => {}
    }
    match table_constructor(ty, name, a)? {
        Some(node) => Ok(Value::widget(node)),
        None => Err(Failure::at(span, format!("The playground does not offer `{ty}::{name}` yet."))),
    }
}

/// The real item, from what a [`Value::NavItem`] holds.
pub fn nav_item(icon: frus::IconData, label: &str) -> BottomNavigationBarItem {
    BottomNavigationBarItem::new(icon, label)
}

const FUNCTIONS: &[(&str, &[&str], &str)] = &[
    ("text", &["string"], "Text"),
    ("button", &["string", "callback"], "Button"),
    ("center", &["widget"], "Center"),
    ("expanded", &["widget"], "Expanded"),
    ("spacer", &[], "Flex"),
];

/// A shorthand function: `text("hi")`, `button("Ok", move || ...)`.
pub fn function(name: &str, mut a: Args) -> Res<Value> {
    let span = a.span();
    let a = &mut a;
    let node = match name {
        "text" => Node::Text(frus::text(a.string()?)),
        "button" => {
            let label = a.string()?;
            let on_press: Callback = a.callback()?;
            Node::Button(frus::button(label, on_press))
        }
        "center" => Node::Center(frus::center(a.widget()?)),
        "expanded" => Node::Expanded(frus::expanded(a.widget()?)),
        "spacer" => Node::Flex(frus::spacer()),
        _ => return Err(Failure::at(span, format!("The playground does not know the function `{name}` yet."))),
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

/// Writes the named constants: the lookup, and the same names as data.
macro_rules! constants {
    ($($owner:ident => $wrap:path : [$($c:ident),* $(,)?])*) => {
        /// `Type::NAME`.
        pub fn constant(ty: &str, name: &str) -> Option<Value> {
            use frus::{Align, Justify, TextAlign, Variant};
            match ty {
                $(stringify!($owner) => match name {
                    $(stringify!($c) => Some($wrap($owner::$c)),)*
                    _ => None,
                },)*
                _ => None,
            }
        }

        const CONSTANTS: &[(&str, &[&str])] = &[$((stringify!($owner), &[$(stringify!($c)),*])),*];
    };
}

constants! {
    Colors => Value::Color: [WHITE, BLACK, RED, PINK, PURPLE, INDIGO, BLUE, CYAN, TEAL, GREEN, LIME, YELLOW, AMBER,
        ORANGE, BROWN, GREY, TRANSPARENT]
    Icons => Value::Icon: [ADD, REMOVE, CLOSE, CHECK, MENU, SEARCH, HOME, SETTINGS, STAR, FAVORITE, DELETE, EDIT,
        PERSON, EMAIL, PHONE, SHARE, INFO, WARNING, ERROR, ARROW_BACK, ARROW_FORWARD, MORE_VERT, NOTIFICATIONS,
        CAMERA_ALT, MAP, SEND, LOCK, VISIBILITY, THUMB_UP, SHOPPING_CART]
    Justify => Value::Justify: [Start, Center, End, SpaceBetween, SpaceAround]
    Align => Value::Align: [Start, Center, End, Stretch]
    Variant => Value::Variant: [Filled, Tonal, Elevated, Outlined]
    TextAlign => Value::TextAlign: [Start, End, Center]
}

/// How an argument reads in the editor's completion.
fn shown(arg: &str) -> &str {
    match arg {
        "string" => "\"text\"",
        "widget" => "child",
        "color" => "Colors::RED",
        "icon" => "Icons::STAR",
        "justify" => "Justify::Center",
        "align" => "Align::Center",
        "variant" => "Variant::Filled",
        "text_align" => "TextAlign::Center",
        "insets" => "Insets::uniform(16.0)",
        "nav_item" => "BottomNavigationBarItem::new(Icons::HOME, \"Home\")",
        "maybe_bool" => "Some(true)",
        "callback" => "move || {}",
        "on_bool" => "move |on: bool| {}",
        "on_f32" => "move |value: f32| {}",
        "on_string" => "move |value: String| {}",
        "on_usize" => "move |index: usize| {}",
        "on_u32" => "move |value: u32| {}",
        "on_i32" => "move |value: i32| {}",
        "builder" => "|index| Text::new(\"row\")",
        "f32" => "1.0",
        other => other,
    }
}

fn quote_all(items: &[String]) -> String {
    format!("[{}]", items.join(","))
}

fn json_str(s: &str) -> String {
    format!("\"{}\"", s.replace('\\', "\\\\").replace('"', "\\\""))
}

fn member(name: &str, args: &[&str], returns: Option<&str>) -> String {
    let args: Vec<String> = args.iter().map(|a| json_str(shown(a))).collect();
    let returns = returns.map_or(String::new(), |r| format!(",\"returns\":{}", json_str(r)));
    format!("{{\"name\":{},\"args\":{}{returns}}}", json_str(name), quote_all(&args))
}

/// Everything above as JSON, for the editor's completion. `examples/dump_api.rs` prints it.
pub fn api_json() -> String {
    let mut types: Vec<String> = TABLE
        .iter()
        .filter(|e| !e.constructors.is_empty())
        .map(|e| {
            let ctors: Vec<String> = e.constructors.iter().map(|(n, a)| member(n, a, None)).collect();
            let mut methods: Vec<String> = e.methods.iter().map(|(n, a)| member(n, a, None)).collect();
            if e.name == "Badge" {
                methods.push(member("on", &["widget"], Some("Badged")));
            }
            format!(
                "{}:{{\"constructors\":{},\"methods\":{}}}",
                json_str(e.name),
                quote_all(&ctors),
                quote_all(&methods)
            )
        })
        .collect();
    types.push(format!(
        "\"Wrap\":{{\"constructors\":[{}],\"methods\":[]}}",
        member("new", &[], Some("Flex"))
    ));
    types.push(format!(
        "\"MediaQuery\":{{\"constructors\":[{}],\"methods\":[]}}",
        member("of", &[], Some("MediaQuery"))
    ));
    types.push(format!(
        "\"Color\":{{\"constructors\":[{}],\"methods\":[]}}",
        member("hex", &["string"], Some("Color"))
    ));
    types.push(format!(
        "\"Insets\":{{\"constructors\":[{},{}],\"methods\":[]}}",
        member("uniform", &["f32"], Some("Insets")),
        member("symmetric", &["f32", "f32"], Some("Insets"))
    ));
    types.push(format!(
        "\"BottomNavigationBarItem\":{{\"constructors\":[{}],\"methods\":[]}}",
        member("new", &["icon", "string"], Some("BottomNavigationBarItem"))
    ));
    let functions: Vec<String> = FUNCTIONS.iter().map(|(n, a, r)| member(n, a, Some(r))).collect();
    let macros = [member("row", &[], Some("Flex")), member("column", &[], Some("Flex"))];
    let constants: Vec<String> = CONSTANTS
        .iter()
        .map(|(owner, names)| {
            let names: Vec<String> = names.iter().map(|n| json_str(n)).collect();
            format!("{}:{}", json_str(owner), quote_all(&names))
        })
        .collect();
    format!(
        "{{\"types\":{{{}}},\"functions\":{},\"macros\":{},\"constants\":{{{}}}}}\n",
        types.join(","),
        quote_all(&functions),
        quote_all(&macros),
        constants.join(",")
    )
}
