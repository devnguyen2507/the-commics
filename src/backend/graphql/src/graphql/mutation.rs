use async_graphql::{Context, Object, Result};
use crate::db::DbPool;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use crate::schema::seo_contents;
use diesel::AsChangeset;

pub struct MutationRoot;

#[derive(AsChangeset)]
#[diesel(table_name = seo_contents)]
struct SeoChangeset {
    title: Option<String>,
    description: Option<String>,
    keywords: Option<String>,
    is_published: Option<bool>,
    published_at: Option<chrono::DateTime<chrono::Utc>>,
    updated_at: chrono::DateTime<chrono::Utc>,
}

#[Object]
impl MutationRoot {
    async fn update_seo_content(
        &self,
        ctx: &Context<'_>,
        path: String,
        title: Option<String>,
        description: Option<String>,
        keywords: Option<String>,
        is_published: Option<bool>,
        published_at: Option<chrono::DateTime<chrono::Utc>>,
    ) -> Result<bool> {
        let pool = ctx.data::<DbPool>()?;
        let mut conn = pool.get().await.map_err(|e| e.to_string())?;

        let changeset = SeoChangeset {
            title,
            description,
            keywords,
            is_published,
            published_at,
            updated_at: chrono::Utc::now(),
        };

        diesel::update(seo_contents::table.filter(seo_contents::path.eq(path)))
            .set(&changeset)
            .execute(&mut conn)
            .await
            .map_err(|e| e.to_string())?;

        Ok(true)
    }
}
