// Writes `.br` and `.gz` beside each compressible file of the build, at the strongest settings.
//
// nginx compresses on the fly with fast gzip only; the playground's wasm is the bulk of a first
// visit, and brotli at quality 11 makes it about 40% smaller than that. The server picks the
// file the browser accepts (deploy/nginx.conf).
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {brotliCompressSync, constants, gzipSync} from 'node:zlib';

const root = process.argv[2] ?? 'build';
const compressible = /\.(wasm|js|css|json|html|svg|xml|txt)$/;
let before = 0;
let after = 0;

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!compressible.test(name)) continue;
    const data = readFileSync(path);
    // Every file gets its `.br`, small ones too: the server announces brotli for the playground's
    // files whenever the browser takes it, so a missing `.br` would be served mislabelled.
    const br = brotliCompressSync(data, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
        [constants.BROTLI_PARAM_SIZE_HINT]: data.length,
      },
    });
    writeFileSync(`${path}.br`, br);
    writeFileSync(`${path}.gz`, gzipSync(data, {level: 9}));
    before += data.length;
    after += br.length;
  }
};

walk(root);
console.log(`precompressed ${(before / 1e6).toFixed(1)} MB into ${(after / 1e6).toFixed(1)} MB of brotli`);
