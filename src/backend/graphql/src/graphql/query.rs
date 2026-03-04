use crate::graphql::types::{Category, Chapter, Comic, ComicFilter, ComicSort};
use async_graphql::*;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn comics(
        &self,
        ctx: &Context<'_>,
        first: Option<i32>,
        after: Option<String>,
        filter: Option<ComicFilter>,
        sort: Option<ComicSort>,
    ) -> Result<Vec<Comic>> {
        let cache = ctx.data::<crate::cache::ArcCache>()?;

        // Generate Cache Key
        let filter_key = filter
            .as_ref()
            .map(|f| format!("{:?}{:?}{:?}", f.category_slug, f.search_query, f.status))
            .unwrap_or_default();
        let cache_key = format!(
            "comics:{}:{}:{}:{:?}",
            first.unwrap_or(20),
            after.clone().unwrap_or_default(),
            filter_key,
            sort
        );

        if let Some(cached) = cache.get::<Vec<crate::models::Comic>>(&cache_key).await {
            return Ok(cached.into_iter().map(Comic::from).collect());
        }

        let pool = ctx.data::<crate::db::DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        let mut query = crate::schema::comics::table.into_boxed();

        if let Some(f) = filter {
            if let Some(cat_slug) = f.category_slug {
                use crate::schema::{categories, comic_categories};
                let comic_ids: Vec<String> = comic_categories::table
                    .inner_join(categories::table)
                    .filter(categories::id.eq(cat_slug))
                    .select(comic_categories::comic_id)
                    .load::<String>(&mut conn)
                    .await
                    .map_err(|e| e.to_string())?;
                query = query.filter(crate::schema::comics::id.eq_any(comic_ids));
            }
            if let Some(q) = f.search_query {
                query = query.filter(crate::schema::comics::title.ilike(format!("%{}%", q)));
            }
            if let Some(s) = f.status {
                query = query.filter(crate::schema::comics::status.eq(s));
            }
        }

        match sort {
            Some(ComicSort::Latest) => {
                query = query.order(crate::schema::comics::created_at.desc())
            }
            Some(ComicSort::MostViewed) => {
                query = query.order(crate::schema::comics::view_count.desc())
            }
            Some(ComicSort::Rating) => {
                query = query.order(crate::schema::comics::rating_score.desc())
            }
            Some(ComicSort::TitleAsc) => query = query.order(crate::schema::comics::title.asc()),
            _ => query = query.order(crate::schema::comics::created_at.desc()),
        }

        let limit_val = first.unwrap_or(20) as i64;
        query = query.limit(limit_val);

        if let Some(a) = after {
            if let Ok(offset_val) = a.parse::<i64>() {
                query = query.offset(offset_val);
            }
        }

        let results: Vec<crate::models::Comic> = query
            .load::<crate::models::Comic>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        // Cache the results for 5 minutes
        cache.set(&cache_key, &results, 300).await;

        Ok(results.into_iter().map(Comic::from).collect())
    }

    async fn comic(&self, ctx: &Context<'_>, comic_slug: String) -> Result<Option<Comic>> {
        let cache = ctx.data::<crate::cache::ArcCache>()?;
        let cache_key = format!("comic:{}", comic_slug);

        if let Some(cached) = cache.get::<crate::models::Comic>(&cache_key).await {
            return Ok(Some(Comic::from(cached)));
        }

        let pool = ctx.data::<crate::db::DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        let result: Option<crate::models::Comic> = crate::schema::comics::table
            .filter(crate::schema::comics::slug.eq(comic_slug))
            .first::<crate::models::Comic>(&mut conn)
            .await
            .optional()
            .map_err(|e| e.to_string())?;

        if let Some(ref c) = result {
            cache.set(&cache_key, c, 600).await;
        }

        Ok(result.map(Comic::from))
    }

    async fn chapter(&self, ctx: &Context<'_>, chapter_id: ID) -> Result<Option<Chapter>> {
        let pool = ctx.data::<crate::db::DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        let result: Option<crate::models::Chapter> = crate::schema::chapters::table
            .filter(crate::schema::chapters::id.eq(chapter_id.to_string()))
            .first::<crate::models::Chapter>(&mut conn)
            .await
            .optional()
            .map_err(|e| e.to_string())?;

        if let Some(c) = result {
            Ok(Some(Chapter {
                id: ID::from(c.id),
                comic_id: c.comic_id,
                chapter_number: c.chapter_number,
                order_index: c.order_index,
                description: c.description,
            }))
        } else {
            Ok(None)
        }
    }

    async fn categories(&self, ctx: &Context<'_>) -> Result<Vec<Category>> {
        let cache = ctx.data::<crate::cache::ArcCache>()?;
        let cache_key = "categories:all";

        if let Some(cached) = cache.get::<Vec<crate::models::Category>>(cache_key).await {
            return Ok(cached
                .into_iter()
                .map(|c| Category {
                    id: ID::from(c.id.clone()),
                    name: c.name,
                    slug: c.id,
                    description: c.description,
                })
                .collect());
        }

        let pool = ctx.data::<crate::db::DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        let results: Vec<crate::models::Category> = crate::schema::categories::table
            .load::<crate::models::Category>(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        cache.set(cache_key, &results, 3600).await;

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
}
