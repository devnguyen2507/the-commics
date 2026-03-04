pub mod dataloaders;
pub mod query;
pub mod types;

use crate::cache::ArcCache;
use crate::db::DbPool;
use crate::graphql::dataloaders::{AssetLoader, CategoryLoader, ChapterLoader, ComicLoader};
use crate::graphql::query::QueryRoot;
use async_graphql::dataloader::DataLoader;
use async_graphql::{EmptyMutation, EmptySubscription, Schema};

pub type CommicsSchema = Schema<QueryRoot, EmptyMutation, EmptySubscription>;

pub fn create_schema(pool: DbPool, cache: ArcCache) -> CommicsSchema {
    let mut schema_builder = Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
        .data(pool.clone())
        .data(cache)
        .data(DataLoader::new(
            ComicLoader::new(pool.clone()),
            tokio::spawn,
        ))
        .data(DataLoader::new(
            CategoryLoader::new(pool.clone()),
            tokio::spawn,
        ))
        .data(DataLoader::new(
            ChapterLoader::new(pool.clone()),
            tokio::spawn,
        ))
        .data(DataLoader::new(AssetLoader::new(pool), tokio::spawn));

    // Lấy config giới hạn từ ENV
    let depth = std::env::var("MAX_QUERY_DEPTH")
        .unwrap_or_else(|_| "5".to_string())
        .parse::<usize>()
        .unwrap_or(5);
        
    let complexity = std::env::var("MAX_QUERY_COMPLEXITY")
        .unwrap_or_else(|_| "1500".to_string())
        .parse::<usize>()
        .unwrap_or(1500);

    let env = std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string());

    schema_builder = schema_builder.limit_depth(depth).limit_complexity(complexity);

    if env != "development" && env != "local" {
        schema_builder = schema_builder.disable_introspection();
    }

    schema_builder.finish()
}
