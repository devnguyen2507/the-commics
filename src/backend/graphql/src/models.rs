use crate::schema::*;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Queryable, Selectable, Identifiable, Serialize, Deserialize, Clone)]
#[diesel(table_name = comics)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Comic {
    pub id: String,
    pub source_url: String,
    pub slug: Option<String>,
    pub title: String,
    pub author: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub logo_path: Option<String>,
    pub banner_path: Option<String>,
    pub thumbnail_path: Option<String>,
    pub is_publish: Option<bool>,
    pub published_at: Option<NaiveDateTime>,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
    pub rating_score: Option<f32>,
    pub rating_count: Option<i32>,
    pub view_count: Option<i32>,
}

#[derive(
    Debug, Queryable, Selectable, Identifiable, Associations, Serialize, Deserialize, Clone,
)]
#[diesel(belongs_to(Comic))]
#[diesel(table_name = chapters)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Chapter {
    pub id: String,
    pub comic_id: String,
    pub chapter_number: String,
    pub order_index: f64,
    pub source_url: String,
    pub images: Option<serde_json::Value>,
    pub description: Option<String>,
    pub is_publish: Option<bool>,
    pub published_at: Option<NaiveDateTime>,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Queryable, Selectable, Identifiable, Serialize, Deserialize, Clone)]
#[diesel(table_name = categories)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Queryable, Selectable, Serialize, Deserialize, Clone)]
#[diesel(table_name = comic_categories)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ComicCategory {
    pub comic_id: String,
    pub category_id: String,
}

#[derive(Debug, Queryable, Selectable, Identifiable, Serialize, Deserialize, Clone)]
#[diesel(table_name = assets)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Asset {
    pub id: String,
    pub comic_id: String,
    pub chapter_id: Option<String>,
    pub asset_type: String,
    pub source_url: String,
    pub storage_path: Option<String>,
    pub order_index: f64,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
