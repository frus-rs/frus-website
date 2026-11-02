//! The programs the page offers. They live in files of their own, so that the tests can both
//! compile them as ordinary Rust and run them through the interpreter.

pub const EXAMPLES: &[(&str, &str)] = &[
    ("counter", include_str!("../examples-src/counter.rs")),
    ("profile", include_str!("../examples-src/profile.rs")),
    ("form", include_str!("../examples-src/form.rs")),
    ("list", include_str!("../examples-src/list.rs")),
];
