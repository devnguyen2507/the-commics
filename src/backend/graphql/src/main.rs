mod cache;
mod db;
mod graphql;
mod models;
mod schema;

use crate::cache::CacheManager;
use crate::graphql::create_schema;
use async_graphql::http::{GraphQLPlaygroundConfig, playground_source};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{Extension, Router, response::IntoResponse, routing::get};
use std::net::SocketAddr;
use std::sync::Arc;

async fn graphql_handler(
    schema: Extension<crate::graphql::CommicsSchema>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}

async fn graphql_playground() -> impl IntoResponse {
    axum::response::Html(playground_source(GraphQLPlaygroundConfig::new("/graphql")))
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();

    let pool = db::establish_connection_pool().await;

    // Initialize Cache
    let redis_url = std::env::var("REDIS_URL").expect("REDIS_URL must be set");
    let redis_client = redis::Client::open(redis_url).expect("Failed to connect to Redis");
    let redis_conn = redis_client.get_multiplexed_tokio_connection().await.ok();
    let cache = Arc::new(CacheManager::new(redis_conn));

    let schema = create_schema(pool, cache);

    let app = Router::new()
        .route("/graphql", get(graphql_playground).post(graphql_handler))
        .layer(Extension(schema));

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("Listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
