use crate::db::DbPool;
use crate::models::Comic;
use async_graphql::dataloader::Loader;
use async_graphql::*;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use std::collections::HashMap;

pub struct ComicLoader {
    pool: DbPool,
}

impl ComicLoader {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

impl Loader<String> for ComicLoader {
    type Value = Comic;
    type Error = String;

    async fn load(&self, keys: &[String]) -> Result<HashMap<String, Self::Value>, Self::Error> {
        let mut conn = self.pool.get().await.map_err(|e| e.to_string())?;

        use crate::schema::comics::dsl::*;

        let results = comics
            .filter(id.eq_any(keys))
            .load::<Comic>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        Ok(results.into_iter().map(|c| (c.id.clone(), c)).collect())
    }
}

pub struct CategoryLoader {
    pool: DbPool,
}

impl CategoryLoader {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

impl Loader<String> for CategoryLoader {
    type Value = Vec<crate::models::Category>;
    type Error = String;

    async fn load(&self, keys: &[String]) -> Result<HashMap<String, Self::Value>, Self::Error> {
        let mut conn = self.pool.get().await.map_err(|e| e.to_string())?;

        use crate::schema::{categories, comic_categories};

        let results = comic_categories::table
            .inner_join(categories::table)
            .filter(comic_categories::comic_id.eq_any(keys))
            .select((comic_categories::comic_id, categories::all_columns))
            .load::<(String, crate::models::Category)>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        let mut map: HashMap<String, Vec<crate::models::Category>> = HashMap::new();
        for (comic_id, category) in results {
            map.entry(comic_id).or_default().push(category);
        }

        Ok(map)
    }
}

pub struct ChapterLoader {
    pool: DbPool,
}

impl ChapterLoader {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

impl Loader<String> for ChapterLoader {
    type Value = Vec<crate::models::Chapter>;
    type Error = String;

    async fn load(&self, keys: &[String]) -> Result<HashMap<String, Self::Value>, Self::Error> {
        let mut conn = self.pool.get().await.map_err(|e| e.to_string())?;

        use crate::schema::chapters::dsl::*;

        let results = chapters
            .filter(comic_id.eq_any(keys))
            .order(order_index.asc())
            .load::<crate::models::Chapter>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        let mut map: HashMap<String, Vec<crate::models::Chapter>> = HashMap::new();
        for chapter in results {
            map.entry(chapter.comic_id.clone())
                .or_default()
                .push(chapter);
        }

        Ok(map)
    }
}

pub struct AssetLoader {
    pool: DbPool,
}

impl AssetLoader {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

impl Loader<String> for AssetLoader {
    type Value = Vec<crate::models::Asset>;
    type Error = String;

    async fn load(&self, keys: &[String]) -> Result<HashMap<String, Self::Value>, Self::Error> {
        let mut conn = self.pool.get().await.map_err(|e| e.to_string())?;

        use crate::schema::assets::dsl::*;

        let results = assets
            .filter(comic_id.eq_any(keys))
            .order(order_index.asc())
            .load::<crate::models::Asset>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        let mut map: HashMap<String, Vec<crate::models::Asset>> = HashMap::new();
        for asset in results {
            map.entry(asset.comic_id.clone()).or_default().push(asset);
        }

        Ok(map)
    }
}
