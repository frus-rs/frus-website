use frus::{
    Align, AppBar, Badge, BottomNavigationBar, BottomNavigationBarItem, BuildContext, Card, Column, Expanded,
    FloatingActionButton, GridView, Icon, Icons, ListTile, ListView, Scaffold, Text, Widget,
};

pub fn app(cx: &BuildContext) -> Box<dyn Widget> {
    let page = cx.use_state(|| 0_usize);
    let basket = cx.use_state(|| 2);
    let (go, add) = (page.clone(), basket.clone());

    let content: Box<dyn Widget> = if page.get() == 0 {
        Box::new(
            // `builder` is the form that scrolls: `new` and `extent` are plain containers.
            GridView::builder(3, 60, |index| {
                Card::new().padding(16.0).child(Text::new(format!("Product {}", index + 1)))
            })
            .gap(12.0)
            .aspect(1.0),
        )
    } else {
        Box::new(ListView::new(40, 56.0, |index| {
            ListTile::new().leading(Icon::new(Icons::STAR)).title(format!("Order {}", index + 1))
        }))
    };

    Box::new(
        Scaffold::new()
            .background(cx.theme().background)
            .app_bar(
                AppBar::new()
                    .title(Text::new("Shop"))
                    .action(Badge::count(basket.get() as u32).on(Icon::new(Icons::SHOPPING_CART))),
            )
            .fab(FloatingActionButton::new(Icons::ADD).on_press(move || add.update(|n| *n += 1)))
            .body(
                Column::new().cross_axis_alignment(Align::Stretch).child(Expanded::new(content)).child(
                    BottomNavigationBar::new(page.get(), move |index: usize| go.set(index))
                        .item(BottomNavigationBarItem::new(Icons::HOME, "Shop"))
                        .item(BottomNavigationBarItem::new(Icons::PERSON, "Orders")),
                ),
            ),
    )
}
