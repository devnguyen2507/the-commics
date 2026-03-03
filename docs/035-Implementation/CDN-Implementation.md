# Implementation Report: CDN Image Optimization (`imgflux` Migration)

## 1. Overview
The CDN system for the `commics` project is based on the `imgflux` engine, providing on-the-fly image resizing, format conversion, and caching for manga assets. It is designed to work directly with the crawler's shared storage.

## 2. Technical Stack
- **Engine**: Actix Web (Rust)
- **Runtime**: `tokio-uring` for high-performance I/O
- **Libraries**: `image`, `ravif`, `actix-files`
- **Orchestration**: Docker Compose (Privileged mode)

## 3. Implementation Details

### Directory Structure
- `src/backend/cdn/`: Root workspace.
  - `logic/`: Image processing engine and LRU cache.
  - `server/`: HTTP API implementation.
  - `actix-files/`: Forked dependency for high-performance static serving.

### key Modifications
- **Environment Prefix**: Changed from `IMGFLUX` to `CDN`.
- **Direct Path Logic**: Modified `logic/src/image.rs` to support serving images directly from the base directory root and introduced a separate `cache_dir` configuration.
- **Deployment**:
  - Multi-stage `Dockerfile` (Rust 1.85.0 -> Debian Bookworm).
  - Integration into `ops/docker/docker-compose.yml` with `privileged: true`.
  - Mounts `/storage_data` as **read-only** (`ro`) for source images and `/cdn_cache` as **read-write** (`rw`) for processed cache outputs.

## 4. Configuration (Docker)
| Variable | Value | Description |
| --- | --- | --- |
| `CDN__LISTEN` | `0.0.0.0:8686` | Internal container port. |
| `CDN__IMAGE__BASE_DIR` | `/storage_data` | Root of manga storage (Read-Only). |
| `CDN__IMAGE__CACHE_DIR` | `/cdn_cache` | Path to store optimized image caches (Read-Write). |
| `CDN__IMAGE__NO_WAIT` | `false` | Synchronous processing for QA. |
| `CDN__IMAGE__DEFAULT_QUALITY` | `85` | Default output quality. |

## 5. Usage
The CDN is accessible on host port `3005`.
Endpoint: `/cdn-cgi/image/w={width},h={height},f={format}/{path}`
Example: `http://localhost:3005/cdn-cgi/image/w=300,f=webp/ba-nguyen-tac-cho-em-gai/thumbnails/0000.jpg`
