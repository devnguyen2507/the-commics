use moka::future::Cache;
use redis::AsyncCommands;
use serde::{Serialize, de::DeserializeOwned};
use std::sync::Arc;
use std::time::Duration;

pub struct CacheManager {
    redis: Option<redis::aio::MultiplexedConnection>,
    lru: Cache<String, String>,
}

impl CacheManager {
    pub fn new(redis: Option<redis::aio::MultiplexedConnection>) -> Self {
        Self {
            redis,
            lru: Cache::builder()
                .max_capacity(1000)
                .time_to_live(Duration::from_secs(60))
                .build(),
        }
    }

    pub async fn get<T: DeserializeOwned>(&self, key: &str) -> Option<T> {
        // Try LRU first
        if let Some(val) = self.lru.get(key).await {
            if let Ok(data) = serde_json::from_str(&val) {
                return Some(data);
            }
        }

        // Try Redis
        if let Some(mut conn) = self.redis.clone() {
            let val: Option<String> = conn.get(key).await.ok().flatten();
            if let Some(val) = val {
                // Populate LRU
                self.lru.insert(key.to_string(), val.clone()).await;
                if let Ok(data) = serde_json::from_str(&val) {
                    return Some(data);
                }
            }
        }

        None
    }

    pub async fn set<T: Serialize>(&self, key: &str, value: &T, ttl_secs: u64) {
        if let Ok(val) = serde_json::to_string(value) {
            // Update LRU
            self.lru.insert(key.to_string(), val.clone()).await;

            // Update Redis
            if let Some(mut conn) = self.redis.clone() {
                let _: Result<(), _> = conn.set_ex(key, val, ttl_secs).await;
            }
        }
    }
}

pub type ArcCache = Arc<CacheManager>;
