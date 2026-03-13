use crate::db::DbPool;
use crate::graphql::dataloaders::{CategoryLoader, ChapterLoader};
use crate::models;
use async_graphql::dataloader::DataLoader;
use async_graphql::*;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;

#[derive(Default)]
pub struct Comic {
    pub id: ID,
    pub slug: Option<String>,
    pub title: String,
    pub author: Option<String>,
    pub status: Option<String>,
    pub description: Option<String>,
    pub rating_score: Option<f32>,
    pub rating_count: Option<i32>,
    pub view_count: Option<i32>,
    pub thumbnail_path: Option<String>,
    pub is_publish: bool,
    pub published_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
}

#[Object]
impl Comic {
    async fn id(&self) -> &ID {
        &self.id
    }
    async fn slug(&self) -> &Option<String> {
        &self.slug
    }
    async fn title(&self) -> &String {
        &self.title
    }
    async fn author(&self) -> &Option<String> {
        &self.author
    }
    async fn status(&self) -> &Option<String> {
        &self.status
    }
    async fn description(&self) -> &Option<String> {
        &self.description
    }
    async fn rating_score(&self) -> &Option<f32> {
        &self.rating_score
    }
    async fn rating_count(&self) -> &Option<i32> {
        &self.rating_count
    }
    async fn view_count(&self) -> &Option<i32> {
        &self.view_count
    }
    async fn updated_at(&self) -> Option<String> {
        self.updated_at
            .map(|dt| dt.format("%Y-%m-%dT%H:%M:%SZ").to_string())
    }
    async fn is_publish(&self) -> bool {
        self.is_publish
    }
    async fn published_at(&self) -> Option<String> {
        self.published_at
            .map(|dt| dt.format("%Y-%m-%dT%H:%M:%SZ").to_string())
    }
    async fn cover_image(&self, ctx: &Context<'_>) -> Result<Option<String>> {
        let loader = ctx.data::<DataLoader<crate::graphql::dataloaders::AssetLoader>>()?;
        let assets = loader
            .load_one(self.id.to_string())
            .await?
            .unwrap_or_default();

        // Find the thumbnail asset
        if let Some(asset) = assets.into_iter().find(|a| a.asset_type == "thumbnail") {
            if let Some(path) = asset.storage_path {
                return Ok(Some(path));
            }
        }

        // Fallback to backup crawl URL
        Ok(self.thumbnail_path.clone())
    }

    async fn seo(&self, ctx: &Context<'_>) -> Result<Option<SeoContent>> {
        let loader = ctx.data::<DataLoader<crate::graphql::dataloaders::SeoLoader>>()?;
        let key = crate::graphql::dataloaders::SeoKey {
            entity_id: self.id.to_string(),
            entity_type: "comic".to_string(),
        };
        let result = loader.load_one(key).await?;
        Ok(result.map(SeoContent::from))
    }

    async fn categories(&self, ctx: &Context<'_>) -> Result<Vec<Category>> {
        let loader = ctx.data::<DataLoader<CategoryLoader>>()?;
        let results = loader
            .load_one(self.id.to_string())
            .await?
            .unwrap_or_default();

        Ok(results
            .into_iter()
            .map(|c| Category {
                id: ID::from(c.id.clone()),
                name: c.name,
                slug: c.id,
                description: c.description,
            })
            .collect())
    }

    async fn chapters(&self, ctx: &Context<'_>) -> Result<Vec<Chapter>> {
        let loader = ctx.data::<DataLoader<ChapterLoader>>()?;
        let results = loader
            .load_one(self.id.to_string())
            .await?
            .unwrap_or_default();

        Ok(results
            .into_iter()
            .map(|c| Chapter {
                id: ID::from(c.id),
                comic_id: c.comic_id,
                chapter_number: c.chapter_number,
                order_index: c.order_index,
                description: c.description,
                is_publish: c.is_publish.unwrap_or(false),
                published_at: c.published_at,
            })
            .collect())
    }
}

impl From<models::Comic> for Comic {
    fn from(m: models::Comic) -> Self {
        Self {
            id: ID::from(m.id),
            slug: m.slug,
            title: m.title,
            author: m.author,
            status: m.status,
            description: m.description,
            rating_score: m.rating_score,
            rating_count: m.rating_count,
            view_count: m.view_count,
            thumbnail_path: m.thumbnail_path,
            is_publish: m.is_publish.unwrap_or(false),
            published_at: m.published_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(SimpleObject)]
pub struct Category {
    pub id: ID,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
}

pub struct Chapter {
    pub id: ID,
    pub comic_id: String,
    pub chapter_number: String,
    pub order_index: f64,
    pub description: Option<String>,
    pub is_publish: bool,
    pub published_at: Option<chrono::NaiveDateTime>,
}

#[Object]
impl Chapter {
    async fn id(&self) -> &ID {
        &self.id
    }
    async fn chapter_number(&self) -> &String {
        &self.chapter_number
    }
    async fn order_index(&self) -> f64 {
        self.order_index
    }
    async fn description(&self) -> &Option<String> {
        &self.description
    }

    async fn is_publish(&self) -> bool {
        self.is_publish
    }

    async fn published_at(&self) -> Option<String> {
        self.published_at
            .map(|dt| dt.format("%Y-%m-%dT%H:%M:%SZ").to_string())
    }

    async fn seo(&self, ctx: &Context<'_>) -> Result<Option<SeoContent>> {
        let loader = ctx.data::<DataLoader<crate::graphql::dataloaders::SeoLoader>>()?;
        let key = crate::graphql::dataloaders::SeoKey {
            entity_id: self.id.to_string(),
            entity_type: "chapter".to_string(),
        };
        let result = loader.load_one(key).await?;
        Ok(result.map(SeoContent::from))
    }

    /// Parent comic info — for breadcrumbs, SEO title, navbar
    async fn comic(&self, ctx: &Context<'_>) -> Result<Option<Comic>> {
        let pool = ctx.data::<DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;
        let result = crate::schema::comics::table
            .filter(crate::schema::comics::id.eq(&self.comic_id))
            .first::<crate::models::Comic>(&mut conn)
            .await
            .optional()
            .map_err(|e| e.to_string())?;
        Ok(result.map(Comic::from))
    }

    async fn images(&self, ctx: &Context<'_>) -> Result<Vec<ChapterImage>> {
        let pool = ctx.data::<DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        use crate::schema::chapters::dsl as chapters_dsl;

        let db_chapter: crate::models::Chapter = chapters_dsl::chapters
            .filter(chapters_dsl::id.eq(self.id.to_string()))
            .first::<crate::models::Chapter>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        if let Some(images_json) = db_chapter.images {
            if let Ok(asset_ids) = serde_json::from_value::<Vec<String>>(images_json) {
                use crate::schema::assets::dsl as assets_dsl;
                let db_assets: Vec<crate::models::Asset> = assets_dsl::assets
                    .filter(assets_dsl::id.eq_any(&asset_ids))
                    .load::<crate::models::Asset>(&mut conn)
                    .await
                    .map_err(|e| e.to_string())?;

                // Create a map for quick lookup and preservation of order
                let asset_map: std::collections::HashMap<String, String> = db_assets
                    .into_iter()
                    .filter_map(|a| a.storage_path.map(|p| (a.id, p)))
                    .collect();

                let result = asset_ids
                    .into_iter()
                    .filter_map(|id| asset_map.get(&id).map(|path| ChapterImage {
                        url: path.clone(),
                        w: 0,
                        h: 0,
                    }))
                    .collect();

                return Ok(result);
            }
        }

        Ok(Vec::new())
    }

    async fn next_chapter_id(&self, ctx: &Context<'_>) -> Result<Option<ID>> {
        let pool = ctx.data::<DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        // Need to know comic_id. For now, we'd need to fetch the chapter again or store comic_id in the struct.
        // Let's assume we fetch it.
        use crate::schema::chapters::dsl as chapters_dsl;
        let current_chapter: crate::models::Chapter = chapters_dsl::chapters
            .filter(chapters_dsl::id.eq(self.id.to_string()))
            .first::<crate::models::Chapter>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        let next: Option<String> = chapters_dsl::chapters
            .filter(chapters_dsl::comic_id.eq(current_chapter.comic_id))
            .filter(chapters_dsl::order_index.gt(current_chapter.order_index))
            .order(chapters_dsl::order_index.asc())
            .select(chapters_dsl::id)
            .first::<String>(&mut conn)
            .await
            .optional()
            .map_err(|e| e.to_string())?;

        Ok(next.map(ID::from))
    }

    async fn prev_chapter_id(&self, ctx: &Context<'_>) -> Result<Option<ID>> {
        let pool = ctx.data::<DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        use crate::schema::chapters::dsl as chapters_dsl;
        let current_chapter: crate::models::Chapter = chapters_dsl::chapters
            .filter(chapters_dsl::id.eq(self.id.to_string()))
            .first::<crate::models::Chapter>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        let prev: Option<String> = chapters_dsl::chapters
            .filter(chapters_dsl::comic_id.eq(current_chapter.comic_id))
            .filter(chapters_dsl::order_index.lt(current_chapter.order_index))
            .order(chapters_dsl::order_index.desc())
            .select(chapters_dsl::id)
            .first::<String>(&mut conn)
            .await
            .optional()
            .map_err(|e| e.to_string())?;

        Ok(prev.map(ID::from))
    }
}

#[derive(SimpleObject)]
pub struct ChapterImage {
    pub url: String,
    pub w: i32,
    pub h: i32,
}

pub struct SeoList {
    pub items: Vec<SeoContent>,
    pub total: i64,
}

#[Object]
impl SeoList {
    async fn items(&self) -> &Vec<SeoContent> {
        &self.items
    }
    async fn total(&self) -> i64 {
        self.total
    }
}

#[derive(Enum, Copy, Clone, Eq, PartialEq, Debug)]
pub enum ComicSort {
    Latest,
    MostViewed,
    Rating,
    TitleAsc,
}

#[derive(InputObject)]
pub struct ComicFilter {
    pub category_slug: Option<String>,
    pub search_query: Option<String>,
    pub status: Option<String>,
}

pub struct SeoContent {
    pub id: ID,
    pub path: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub keywords: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<String>,
    pub is_published: bool,
    pub published_at: Option<String>,
}

#[Object]
impl SeoContent {
    async fn id(&self) -> &ID {
        &self.id
    }
    async fn path(&self) -> &String {
        &self.path
    }
    async fn title(&self) -> &Option<String> {
        &self.title
    }
    async fn description(&self) -> &Option<String> {
        &self.description
    }
    async fn keywords(&self) -> &Option<String> {
        &self.keywords
    }
    async fn entity_type(&self) -> &Option<String> {
        &self.entity_type
    }
    async fn entity_id(&self) -> &Option<String> {
        &self.entity_id
    }
    async fn is_published(&self) -> bool {
        self.is_published
    }
    async fn published_at(&self) -> &Option<String> {
        &self.published_at
    }

    async fn linked_published(&self, ctx: &Context<'_>) -> Result<Option<bool>> {
        if let (Some(etype), Some(eid)) = (&self.entity_type, &self.entity_id) {
            let loader = ctx.data::<DataLoader<crate::graphql::dataloaders::SeoEntityLoader>>()?;
            let key = crate::graphql::dataloaders::SeoKey {
                entity_id: eid.clone(),
                entity_type: etype.clone(),
            };
            let result = loader.load_one(key).await?;
            return Ok(result);
        }
        Ok(None)
    }
}

impl From<models::SeoContent> for SeoContent {
    fn from(m: models::SeoContent) -> Self {
        Self {
            id: ID::from(m.id.to_string()),
            path: m.path,
            title: m.title,
            description: m.description,
            keywords: m.keywords,
            entity_type: m.entity_type,
            entity_id: m.entity_id,
            is_published: m.is_published,
            published_at: m.published_at.map(|dt| dt.format("%Y-%m-%dT%H:%M:%SZ").to_string()),
        }
    }
}

#[derive(InputObject)]
pub struct SeoFilter {
    pub entity_type: Option<String>,
    pub entity_id: Option<String>,
    pub path: Option<String>,
    pub search_query: Option<String>,
    pub is_published: Option<bool>,
}
