use diesel_async::pg::AsyncPgConnection;
use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use diesel_async::pooled_connection::bb8::Pool;
use std::env;

pub type DbPool = Pool<AsyncPgConnection>;

pub async fn establish_connection_pool() -> DbPool {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let config = AsyncDieselConnectionManager::<AsyncPgConnection>::new(database_url);
    Pool::builder()
        .build(config)
        .await
        .expect("Failed to create pool.")
}
