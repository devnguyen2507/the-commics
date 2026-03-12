# Build stage
FROM rust:1.88-alpine AS builder

# Install build dependencies
RUN apk add --no-cache musl-dev postgresql-dev pkgconfig g++ make

WORKDIR /app

# Copy dependency manifests
COPY Cargo.toml Cargo.lock ./

# Pre-build dependencies for caching
# We create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -f target/release/deps/commics_graphql*

# Copy the real source code
COPY src ./src

# Build the real application
RUN cargo build --release

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache libpq libgcc

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/commics-graphql /usr/local/bin/commics-graphql

# Copy .env file if needed (though environment variables are preferred in Docker)
# COPY .env .env

EXPOSE 8000

ENV RUST_LOG=info

ENTRYPOINT ["commics-graphql"]
