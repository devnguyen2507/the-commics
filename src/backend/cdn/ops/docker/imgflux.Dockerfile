# Use the official Rust image as the base image
FROM rust:1.85.0-slim-bookworm as builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y \
    nasm

# Copy the source code
COPY . .

# Build the application
RUN cargo build --release

FROM debian:bookworm

RUN apt-get update && \
    apt-get install -y \
        nasm \
        ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/imgflux-server /usr/local/sbin/imgflux-server

CMD ["imgflux-server"]