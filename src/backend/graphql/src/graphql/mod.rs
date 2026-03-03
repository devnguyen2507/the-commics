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
    Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
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
        .data(DataLoader::new(AssetLoader::new(pool), tokio::spawn))
        .finish()
}
