# The site, built and served: `docker build -t frus-website .` then `docker run -p 8080:80 frus-website`.
#
# 1. The playground's preview, frus built for the browser, against frus's `FRUS_REF`.
# 2. The site, with the docs copied from that same checkout of frus.
# 3. nginx serving the static files.

ARG FRUS_REF=master

FROM rust:1-bookworm AS playground
ARG FRUS_REF
RUN rustup target add wasm32-unknown-unknown \
 && cargo install wasm-bindgen-cli --version 0.2.129 --locked
# frus beside the site, where the playground's path dependencies expect it.
RUN git clone --depth 1 --branch "$FRUS_REF" https://github.com/frus-rs/frus.git /src/frus
COPY playground /src/frus-website/playground
WORKDIR /src/frus-website/playground
RUN cargo build --lib --target wasm32-unknown-unknown --profile web-release \
 && wasm-bindgen --target web --no-typescript --out-dir /out/pkg \
      target/wasm32-unknown-unknown/web-release/frus_playground.wasm

FROM node:22-bookworm-slim AS site
WORKDIR /src/frus-website
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
COPY --from=playground /src/frus /src/frus
COPY --from=playground /out/pkg static/playground-app/pkg
# The docs sync reads the checkout above, not the network.
RUN FRUS_REPO=/src/frus npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=site /src/frus-website/build /usr/share/nginx/html
EXPOSE 80
