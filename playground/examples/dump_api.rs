//! Prints what the playground offers, as JSON: `cargo run --example dump_api > api.json`.

fn main() {
    print!("{}", frus_playground::widgets::api_json());
}
