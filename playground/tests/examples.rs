//! Each example is ordinary Rust that the compiler accepts, and the interpreter builds the same
//! file. So what the playground shows is code that also compiles in a real project.

#[allow(dead_code)]
mod compiled {
    pub mod counter {
        include!("../examples-src/counter.rs");
    }
    pub mod profile {
        include!("../examples-src/profile.rs");
    }
    pub mod form {
        include!("../examples-src/form.rs");
    }
    pub mod list {
        include!("../examples-src/list.rs");
    }
    pub mod shop {
        include!("../examples-src/shop.rs");
    }
}

use frus_playground::examples::EXAMPLES;
use frus_playground::Program;

#[test]
fn every_example_builds_in_the_interpreter() {
    for (name, source) in EXAMPLES {
        let program = Program::parse(source).unwrap_or_else(|e| panic!("{name}: {e:?}"));
        program.build().unwrap_or_else(|e| panic!("{name}: {e:?}"));
    }
}

fn failure(source: &str) -> frus_playground::Failure {
    match Program::parse(source).and_then(|p| p.build().map(|_| ())) {
        Err(failure) => failure,
        Ok(()) => panic!("this should have failed: {source}"),
    }
}

#[test]
fn a_syntax_error_says_where() {
    let failure = failure("fn app() {\n    Text::new(\"a\"\n}\n");
    assert!(failure.line >= 2, "{failure:?}");
}

#[test]
fn an_integer_where_rust_wants_a_float_is_refused_as_rust_would() {
    let failure = failure("fn app() {\n    Text::new(\"a\").size(12)\n}\n");
    assert_eq!(failure.line, 2);
    assert!(failure.message.contains("12.0"), "{failure:?}");
}

#[test]
fn an_unknown_method_lists_the_ones_it_knows() {
    let failure = failure("fn app() {\n    Text::new(\"a\").nope()\n}\n");
    assert!(failure.message.contains("Text::nope"), "{failure:?}");
    assert!(failure.message.contains("size"), "{failure:?}");
}

#[test]
fn a_widget_moves_as_in_rust() {
    let source = "fn app() {\n  let a = Text::new(\"a\");\n  let b = Column::new().child(a);\n  Column::new().child(a)\n}\n";
    assert!(failure(source).message.contains("already been used"));
}

#[test]
fn an_endless_loop_is_stopped() {
    let source = "fn app() {\n  let mut i = 0;\n  while true { i += 1; }\n  Text::new(\"never\")\n}\n";
    assert!(failure(source).message.contains("too long"));
}

#[test]
fn a_function_that_ends_with_a_semicolon_says_so() {
    assert!(failure("fn app() {\n  Text::new(\"a\");\n}\n").message.contains("must end with a widget"));
}

#[test]
fn a_struct_is_refused_with_a_reason() {
    assert!(failure("struct A;\nfn app() { Text::new(\"a\") }\n").message.contains("not supported"));
}

#[test]
fn a_bare_expression_is_accepted() {
    assert!(Program::parse("Text::new(\"a\").size(20.0)").and_then(|p| p.build()).is_ok());
}

#[test]
fn the_list_the_editor_completes_from_is_current() {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/api.json");
    let written = std::fs::read_to_string(path).unwrap_or_default().replace("\r\n", "\n");
    assert_eq!(
        written,
        frus_playground::widgets::api_json(),
        "run `cargo run --example dump_api > api.json`, then `node ../scripts/gen-playground-api.mjs`"
    );
}

#[test]
fn every_new_kind_of_argument_is_converted() {
    let source = r#"fn app(cx: &BuildContext) -> Box<dyn Widget> {
        let page = cx.use_state(|| 0);
        let go = page.clone();
        Scaffold::new()
            .body(
                Column::new()
                    .child(Checkbox::maybe(None))
                    .child(Checkbox::maybe(Some(true)))
                    .child(Stepper::new(1, move |v: i32| {}).range(0, 9))
                    .child(Rating::new(3, 5, move |v: u32| {}))
                    .child(Badge::count(3).on(Icon::new(Icons::EMAIL)))
                    .child(ListView::new(100, 40.0, |i| Text::new(format!("Row {i}"))).flex(1.0))
                    .child(
                        BottomNavigationBar::new(page.get(), move |i: usize| go.set(i))
                            .item(BottomNavigationBarItem::new(Icons::HOME, "Home"))
                            .item(BottomNavigationBarItem::new(Icons::STAR, "Stars")),
                    ),
            )
    }"#;
    Program::parse(source).and_then(|p| p.build().map(|_| ())).unwrap();
}

#[test]
fn a_bad_colour_is_an_error_not_a_panic() {
    assert!(failure("fn app() {
  Text::new(\"a\").color(Color::hex(\"nonsense\"))
}
").message.contains("not a colour"));
}
