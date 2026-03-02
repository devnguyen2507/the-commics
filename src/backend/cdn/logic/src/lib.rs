pub mod cache;
pub mod image;
pub mod types;

use {
    std::path::{
        Path,
        PathBuf,
    },
    tokio::fs,
};

pub(crate) async fn read_link(p: &Path, include_symlink: bool) -> Option<PathBuf> {
    match fs::metadata(p).await {
        Ok(_) => Some(p.to_path_buf()),
        Err(_) if include_symlink => {
            match fs::symlink_metadata(p).await {
                Ok(_) => fs::read_link(p).await.ok(),
                _ => None,
            }
        }
        _ => None,
    }
}

pub(crate) async fn link_exists(p: &Path, include_symlink: bool) -> bool {
    match fs::metadata(p).await {
        Ok(_) => true,
        Err(_) if include_symlink => fs::symlink_metadata(p).await.is_ok(),
        _ => false,
    }
}
