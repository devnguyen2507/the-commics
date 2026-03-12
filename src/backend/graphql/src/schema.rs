// @generated automatically by Diesel CLI.

diesel::table! {
    assets (id) {
        id -> Varchar,
        comic_id -> Varchar,
        chapter_id -> Nullable<Varchar>,
        asset_type -> Varchar,
        source_url -> Varchar,
        storage_path -> Nullable<Varchar>,
        order_index -> Float8,
        status -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    categories (id) {
        id -> Varchar,
        name -> Varchar,
        description -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    chapters (id) {
        id -> Varchar,
        comic_id -> Varchar,
        chapter_number -> Varchar,
        order_index -> Float8,
        source_url -> Varchar,
        images -> Nullable<Jsonb>,
        description -> Nullable<Text>,
        is_publish -> Nullable<Bool>,
        published_at -> Nullable<Timestamp>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    comic_categories (comic_id, category_id) {
        comic_id -> Varchar,
        category_id -> Varchar,
    }
}

diesel::table! {
    comics (id) {
        id -> Varchar,
        source_url -> Varchar,
        slug -> Nullable<Varchar>,
        title -> Varchar,
        author -> Nullable<Varchar>,
        description -> Nullable<Varchar>,
        status -> Nullable<Varchar>,
        logo_path -> Nullable<Varchar>,
        banner_path -> Nullable<Varchar>,
        thumbnail_path -> Nullable<Varchar>,
        is_publish -> Nullable<Bool>,
        published_at -> Nullable<Timestamp>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        rating_score -> Nullable<Float4>,
        rating_count -> Nullable<Int4>,
        view_count -> Nullable<Int4>,
    }
}

diesel::table! {
    worker_tasks (id) {
        id -> Varchar,
        workflow_id -> Varchar,
        target_type -> Varchar,
        target_url -> Varchar,
        status -> Nullable<Varchar>,
        error_logs -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    seo_contents (id) {
        id -> Uuid,
        path -> Varchar,
        title -> Nullable<Varchar>,
        description -> Nullable<Text>,
        keywords -> Nullable<Varchar>,
        is_published -> Bool,
        published_at -> Nullable<Timestamptz>,
        entity_type -> Nullable<Varchar>,
        entity_id -> Nullable<Varchar>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::joinable!(assets -> chapters (chapter_id));
diesel::joinable!(assets -> comics (comic_id));
diesel::joinable!(chapters -> comics (comic_id));
diesel::joinable!(comic_categories -> categories (category_id));
diesel::joinable!(comic_categories -> comics (comic_id));

diesel::allow_tables_to_appear_in_same_query!(
    assets,
    categories,
    chapters,
    comic_categories,
    comics,
    worker_tasks,
    seo_contents,
);
