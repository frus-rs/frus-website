// Builds the playground's preview for the browser, into `static/playground-app/pkg`. The result is
// not committed: this needs Rust, the wasm32-unknown-unknown target and wasm-bindgen 0.2.129.

import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const crate = path.join(site, 'playground');
const target = process.env.CARGO_TARGET_DIR ?? path.join(crate, 'target');

execFileSync('cargo', ['build', '--lib', '--target', 'wasm32-unknown-unknown', '--profile', 'web-release'], {
  cwd: crate,
  stdio: 'inherit',
});
execFileSync(
  'wasm-bindgen',
  [
    '--target', 'web',
    '--no-typescript',
    '--out-dir', path.join(site, 'static/playground-app/pkg'),
    path.join(target, 'wasm32-unknown-unknown/web-release/frus_playground.wasm'),
  ],
  {stdio: 'inherit'},
);
