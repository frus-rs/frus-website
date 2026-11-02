//! The playground's preview. A page sends Rust source; [`interp`] evaluates it against a table of
//! real frus widgets ([`widgets`]), with no compiler involved, and the application shows what it
//! built.

pub mod examples;
pub mod interp;
pub mod widgets;

use std::cell::{Cell, RefCell};
use std::time::Duration;

use frus::{BuildContext, Center, Text, Widget};

pub use interp::{Failure, Program};

thread_local! {
    /// The last source that evaluated without an error.
    static CURRENT: RefCell<Option<Program>> = const { RefCell::new(None) };
    /// Moves on when the preview must be built again.
    static GENERATION: Cell<u64> = const { Cell::new(0) };
    /// An error raised after the source was accepted, in a handler or a rebuild.
    static LATE_ERROR: RefCell<Option<Failure>> = const { RefCell::new(None) };
}

/// Asks for the preview to be built again, at its next look.
pub fn invalidate() {
    GENERATION.with(|g| g.set(g.get() + 1));
}

pub fn report_late(failure: Failure) {
    LATE_ERROR.with(|e| *e.borrow_mut() = Some(failure));
}

pub fn take_late_error() -> Option<Failure> {
    LATE_ERROR.with(|e| e.borrow_mut().take())
}

/// Takes new source: checks that it parses and builds, and only then shows it, so an edit in
/// progress leaves the last good preview on the screen.
pub fn set_source(source: &str) -> Result<(), Failure> {
    let program = Program::parse(source)?;
    program.build()?;
    CURRENT.with(|c| *c.borrow_mut() = Some(program));
    invalidate();
    Ok(())
}

/// The application: a root that rebuilds when the generation moves.
pub fn root(cx: &BuildContext) -> Box<dyn Widget> {
    interp::set_theme(cx.theme());
    let seen = cx.use_state(|| 0u64);
    let poll = seen.clone();
    cx.use_interval(Duration::from_millis(16), move || {
        let now = GENERATION.with(|g| g.get());
        if poll.get() != now {
            poll.set(now);
        }
    });
    let built = CURRENT.with(|c| c.borrow().as_ref().map(Program::build));
    match built {
        Some(Ok(widget)) => widget,
        Some(Err(failure)) => {
            report_late(failure);
            Box::new(Center::new(Text::new("This code stopped with an error.")))
        }
        None => Box::new(Center::new(Text::new("Loading…"))),
    }
}

#[cfg(target_arch = "wasm32")]
mod web {
    use frus::FrusApp;
    use wasm_bindgen::prelude::*;

    frus::main!(FrusApp::from_fn(crate::root).title("frus playground"));

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = window, js_name = playgroundPanicked)]
        fn panicked(message: &str);
    }

    /// A panic ends a wasm program: tell the page, which starts it again.
    #[wasm_bindgen]
    pub fn install_panic_report() {
        std::panic::set_hook(Box::new(|info| panicked(&info.to_string())));
    }

    /// `""` when the source was accepted; otherwise `line:column:message`.
    #[wasm_bindgen]
    pub fn set_source(source: &str) -> String {
        match crate::set_source(source) {
            Ok(()) => String::new(),
            Err(failure) => failure.encode(),
        }
    }

    /// An error raised since the last call, in the same form, or `""`.
    #[wasm_bindgen]
    pub fn take_late_error() -> String {
        crate::take_late_error().map_or(String::new(), |failure| failure.encode())
    }
}
