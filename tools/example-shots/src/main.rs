//! Renders screens of frus's example applications, each the application itself started at an
//! address, to `<dir>/<example>-<screen>.png`, at a phone's size and twice its density.

use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use frus::{Brightness, MediaQuery, Size, Theme};
use frus_shell::{Application, FrusApp};
use frus_test::{render_scene, Stage};

/// A phone's screen, in logical pixels.
const WIDTH: u32 = 390;
const HEIGHT: u32 = 844;
/// The density the pictures are drawn at, so they stay sharp on a high-density display.
const SCALE: f32 = 2.0;
const DT: f32 = 1.0 / 30.0;

struct Shot {
    file: &'static str,
    app: fn() -> FrusApp,
    /// How long to let the application work in real time first: a request in flight.
    wait: Duration,
}

fn shots() -> Vec<Shot> {
    const NONE: Duration = Duration::ZERO;
    vec![
        Shot {
            file: "hello_world",
            app: || {
                FrusApp::new(hello_world::features::home::pages::homepage::HomePage)
            },
            wait: NONE,
        },
        Shot {
            file: "counter",
            app: || {
                FrusApp::stateful(counter::features::counter::pages::counterpage::CounterPage::new(1))
            },
            wait: NONE,
        },
        Shot {
            file: "widgets",
            app: || FrusApp::router(widgets::common::routers::router()),
            wait: NONE,
        },
        Shot {
            file: "widgets-category",
            app: || FrusApp::router(widgets::common::routers::router().initial_location("/category/buttons")),
            wait: NONE,
        },
        Shot {
            file: "forms",
            app: || FrusApp::router(forms::common::routers::router()),
            wait: NONE,
        },
        Shot {
            file: "navigation",
            app: || {
                FrusApp::router(navigation::common::routers::router(navigation::common::cart::Cart::new()))
            },
            wait: NONE,
        },
        Shot {
            file: "navigation-product",
            app: || {
                FrusApp::router(
                    navigation::common::routers::router(navigation::common::cart::Cart::new())
                        .initial_location("/products/1"),
                )
            },
            wait: NONE,
        },
        Shot {
            file: "http",
            app: || FrusApp::router(http::common::routers::router()),
            wait: Duration::from_secs(8),
        },
        Shot {
            file: "websocket",
            app: || {
                FrusApp::stateful(websocket::features::chat::pages::chatpage::ChatPage::new(
                    "wss://echo.websocket.org",
                ))
            },
            wait: Duration::from_secs(4),
        },
        Shot {
            file: "authentication",
            app: || {
                use authentication::common::{auth::Auth, colors::brand, routers::router, session::Session};
                use authentication::features::auth::controllers::user_store::UserStore;
                // Nobody signed in, whatever this computer remembers: the sign-in screen.
                let auth = Auth::with(UserStore::seeded(), Session::in_memory());
                FrusApp::router(router(auth))
                    .theme(Theme::from_seed(brand(), false))
                    .dark_theme(Theme::from_seed(brand(), true))
            },
            wait: NONE,
        },
    ]
}

fn main() {
    let dir = PathBuf::from(std::env::args().nth(1).unwrap_or_else(|| "static/examples".into()));
    std::fs::create_dir_all(&dir).expect("the pictures' folder");
    let only = std::env::args().nth(2);
    let mut failed = Vec::new();
    for shot in shots() {
        if only.as_deref().is_some_and(|only| !shot.file.starts_with(only)) {
            continue;
        }
        let path = dir.join(format!("{}.png", shot.file));
        if render((shot.app)(), shot.wait, &path) {
            println!("{}", path.display());
        } else {
            failed.push(shot.file);
        }
    }
    if !failed.is_empty() {
        eprintln!("not rendered: {}", failed.join(", "));
        std::process::exit(1);
    }
}

/// The application settled after a few seconds of animation, and of real time when it waits
/// for an answer, in its light theme.
fn render(mut app: FrusApp, wait: Duration, path: &Path) -> bool {
    let theme: Theme = Application::resolved_theme(&app, Brightness::Light, false);
    let size = Size::new(WIDTH as f32, HEIGHT as f32);
    let mut stage = Stage::new(WIDTH, HEIGHT).theme(theme.clone());
    let started = Instant::now();
    MediaQuery::new(size).scope(|| {
        let mut frames = 0;
        loop {
            app.tick(DT);
            // What the shell's frame does for a page's `async` work: run what has woken.
            frus::run_local_tasks();
            let root = app.view(&theme);
            stage.advance(root.as_ref(), if frames == 0 { 0.0 } else { DT });
            frames += 1;
            if frames >= 90 && started.elapsed() >= wait {
                break;
            }
            if started.elapsed() < wait {
                std::thread::sleep(Duration::from_millis(20));
            }
        }
        let root = app.view(&theme);
        stage.settle(root.as_ref());
        let ui = stage.build(root.as_ref());
        let scene = ui.scene().scaled(SCALE);
        let width = (WIDTH as f32 * SCALE) as u32;
        let height = (HEIGHT as f32 * SCALE) as u32;
        match render_scene(&scene, width, height, theme.background) {
            Some(frame) => {
                frame.write_png(path);
                true
            }
            None => false,
        }
    })
}
