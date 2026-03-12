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
            .filter(is_publish.eq(true))
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

#[derive(Clone, Hash, Eq, PartialEq)]
pub struct SeoKey {
    pub entity_id: String,
    pub entity_type: String,
}

pub struct SeoLoader {
    pool: DbPool,
}

impl SeoLoader {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

impl Loader<SeoKey> for SeoLoader {
    type Value = crate::models::SeoContent;
    type Error = String;

    async fn load(&self, keys: &[SeoKey]) -> Result<HashMap<SeoKey, Self::Value>, Self::Error> {
        let mut conn = self.pool.get().await.map_err(|e| e.to_string())?;

        use crate::schema::seo_contents::dsl::*;

        let mut results = HashMap::new();
        
        // Group by entity_type for efficient fetching
        let mut type_groups: HashMap<String, Vec<String>> = HashMap::new();
        for key in keys {
            type_groups.entry(key.entity_type.clone()).or_default().push(key.entity_id.clone());
        }

        for (etype, eids) in type_groups {
            let entries = seo_contents
                .filter(entity_type.eq(Some(etype.clone())))
                .filter(entity_id.eq_any(eids))
                .load::<crate::models::SeoContent>(&mut conn)
                .await
                .map_err(|e| e.to_string())?;
                
            for entry in entries {
                if let Some(ref eid) = entry.entity_id {
                    results.insert(SeoKey { 
                        entity_id: eid.clone(), 
                        entity_type: etype.clone() 
                    }, entry);
                }
            }
        }

        Ok(results)
    }
}

pub struct SeoEntityLoader {
    pool: DbPool,
}

impl SeoEntityLoader {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

impl Loader<SeoKey> for SeoEntityLoader {
    type Value = bool; // is_publish status
    type Error = String;

    async fn load(&self, keys: &[SeoKey]) -> Result<HashMap<SeoKey, Self::Value>, Self::Error> {
        let mut conn = self.pool.get().await.map_err(|e| e.to_string())?;

        let mut results = HashMap::new();
        
        // Handle Comics
        let comic_ids: Vec<String> = keys.iter()
            .filter(|k| k.entity_type == "comic")
            .map(|k| k.entity_id.clone())
            .collect();
            
        if !comic_ids.is_empty() {
            use crate::schema::comics::dsl as comics_dsl;
            let comics = comics_dsl::comics
                .filter(comics_dsl::id.eq_any(&comic_ids))
                .select((comics_dsl::id, comics_dsl::is_publish))
                .load::<(String, Option<bool>)>(&mut conn)
                .await
                .map_err(|e| e.to_string())?;
                
            for (cid, published) in comics {
                results.insert(SeoKey { entity_id: cid, entity_type: "comic".to_string() }, published.unwrap_or(false));
            }
        }
        
        // Handle Chapters
        let chapter_ids: Vec<String> = keys.iter()
            .filter(|k| k.entity_type == "chapter")
            .map(|k| k.entity_id.clone())
            .collect();
            
        if !chapter_ids.is_empty() {
            use crate::schema::chapters::dsl as chapters_dsl;
            let chapters = chapters_dsl::chapters
                .filter(chapters_dsl::id.eq_any(&chapter_ids))
                .select((chapters_dsl::id, chapters_dsl::is_publish))
                .load::<(String, Option<bool>)>(&mut conn)
                .await
                .map_err(|e| e.to_string())?;
                
            for (chid, published) in chapters {
                results.insert(SeoKey { entity_id: chid, entity_type: "chapter".to_string() }, published.unwrap_or(false));
            }
        }

        Ok(results)
    }
}
