use {
    crate::{
        link_exists,
        read_link,
        types::{
            Result,
            TransformOptions,
        },
    },
    std::path::{
        Path,
        PathBuf,
    },
    tokio::{
        fs,
        io::AsyncWriteExt,
    },
};

pub struct FileCache {
    pub directory: String,
}

pub fn to_cache_path(src: &str, opts: &TransformOptions) -> String {
    let size_folder = opts.as_size_folder();
    let cache_key = opts.as_cache_key();

    // Extract source file extension
    let src_ext = Path::new(src)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("bin"); // fallback if no extension

    // If the src is SVG, use the original extension, else use transform extension
    let file_ext = if src_ext.eq_ignore_ascii_case("svg") {
        src_ext.to_string()
    } else {
        opts.as_transform_ext()
    };

    let file_name = format!("{}.{}", cache_key, file_ext);
    format!("{}/{}/{}", src, size_folder, file_name)
}

impl FileCache {
    pub fn new(directory: String) -> Self {
        Self { directory }
    }

    fn get_path(&self, src: &str, opts: &TransformOptions) -> PathBuf {
        let cache_path = format!("{}/{}", self.directory, to_cache_path(src, opts));
        Path::new(&cache_path).to_path_buf()
    }

    pub async fn get(&self, src: &str, opts: &TransformOptions) -> Option<PathBuf> {
        let path = self.get_path(src, opts);
        read_link(&path, true).await
    }

    pub async fn try_put(
        &self,
        src: &str,
        opts: &TransformOptions,
        buf: Vec<u8>,
    ) -> Result<PathBuf> {
        let path = self.get_path(src, opts);
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).await?;
            }
        }
        let mut file = fs::File::create(path.clone()).await?;
        file.write_all(&buf).await?;

        Ok(path)
    }

    pub async fn create_symlink_if_needed(
        &self,
        src: &str,
        opts: &TransformOptions,
        new_opts: &TransformOptions,
    ) -> Result<(bool, Option<PathBuf>)> {
        let s = self.get_path(src, opts);
        let d = self.get_path(src, new_opts);

        if link_exists(&s, true).await && !link_exists(&d, true).await {
            if let Some(parent) = d.parent() {
                fs::create_dir_all(parent).await?;
            }
            fs::symlink(&s, &d).await?;
            Ok((true, Some(s)))
        } else {
            Ok((false, None))
        }
    }
}
