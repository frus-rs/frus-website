//! Renders each demo of the widget gallery, as an application of its own, to
//! `<dir>/<id>.light.png`, and writes the gallery's categories and demos to a JSON file.

use std::path::{Path, PathBuf};

use frus::{Brightness, MediaQuery, Size, Theme};
use frus_shell::{Application, FrusApp};
use frus_test::Stage;
use serde_json::json;
use widgets::common::catalog::categories;

const WIDTH: u32 = 720;
const HEIGHT: u32 = 520;
const DT: f32 = 1.0 / 30.0;

fn main() {
    let mut args = std::env::args().skip(1);
    let dir = PathBuf::from(args.next().unwrap_or_else(|| "static/preview".into()));
    let catalog = PathBuf::from(args.next().unwrap_or_else(|| "catalog.json".into()));
    std::fs::create_dir_all(&dir).expect("the preview folder");

    let mut out = Vec::new();
    let mut failed = Vec::new();
    for category in categories() {
        let mut demos = Vec::new();
        for demo in (category.demos)() {
            let rendered = render(demo.build, &dir.join(format!("{}.light.png", demo.id)));
            if !rendered {
                failed.push(demo.id);
            }
            demos.push(json!({
                "id": demo.id,
                "name": demo.name,
                "summary": demo.summary,
                "source": demo.source,
                "preview": rendered,
            }));
        }
        out.push(json!({
            "id": category.id,
            "name": category.name,
            "summary": category.summary,
            "demos": demos,
        }));
    }
    std::fs::write(&catalog, serde_json::to_string_pretty(&out).unwrap()).expect("the catalog");
    println!("{} categories written to {}", out.len(), catalog.display());
    if !failed.is_empty() {
        eprintln!("not rendered: {}", failed.join(", "));
    }
}

/// One demo, settled for a few seconds of animation, in the light theme.
fn render(build: fn() -> Box<dyn frus::Widget>, path: &Path) -> bool {
    let mut app = FrusApp::from_fn(move |_| build());
    for _ in 0..90 {
        if !app.tick(DT) {
            break;
        }
    }
    let theme: Theme = Application::resolved_theme(&app, Brightness::Light, false);
    let mut stage = Stage::new(WIDTH, HEIGHT).theme(theme.clone());
    let frame = MediaQuery::new(Size::new(WIDTH as f32, HEIGHT as f32)).scope(|| {
        let first = app.view(&theme);
        stage.settle(first.as_ref());
        let root = app.view(&theme);
        stage.settle(root.as_ref());
        stage.render(root.as_ref())
    });
    match frame {
        Some(frame) => {
            frame.write_png(path);
            true
        }
        None => false,
    }
}
