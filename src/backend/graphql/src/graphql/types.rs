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
    pub cover_image: Option<String>,
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
    async fn cover_image(&self) -> &Option<String> {
        &self.cover_image
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
                slug: c.id, // ID is the slug
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
                chapter_number: c.chapter_number,
                order_index: c.order_index,
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
            cover_image: m.thumbnail_path,
        }
    }
}

#[derive(SimpleObject)]
pub struct Category {
    pub id: ID,
    pub name: String,
    pub slug: String,
}

#[derive(Default)]
pub struct Chapter {
    pub id: ID,
    pub chapter_number: String,
    pub order_index: f64,
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
            if let Ok(images) = serde_json::from_value::<Vec<serde_json::Value>>(images_json) {
                let mut result = Vec::new();
                for img in images {
                    let file_path = if let Some(s) = img.as_str() {
                        s.to_string()
                    } else if let Some(obj) = img.as_object() {
                        obj.get("file")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string()
                    } else {
                        String::new()
                    };

                    let w = img.get("w").and_then(|v| v.as_i64()).unwrap_or(0);
                    let h = img.get("h").and_then(|v| v.as_i64()).unwrap_or(0);

                    if !file_path.is_empty() {
                        result.push(ChapterImage {
                            url: format!("https://cdn.imgflux.com/{}", file_path),
                            w: w as i32,
                            h: h as i32,
                        });
                    }
                }
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
