use {
    crate::{
        cache,
        types::{
            Error,
            Result,
            TransformOptions,
        },
    },
    image::{
        imageops,
        DynamicImage,
        GenericImageView,
        ImageFormat,
    },
    log::{
        debug,
        info,
        warn,
    },
    serde::{
        Deserialize,
        Serialize,
    },
    std::io::Cursor,
    tokio::{
        fs::{
            self,
            File,
        },
        io::AsyncReadExt,
        sync::{
            mpsc,
            RwLock,
        },
    },
};

const PUBLIC_DIR: &str = "";
const CACHE_DIR: &str = "cache";

#[derive(Default, Debug, Clone, Deserialize, Serialize)]
pub struct Config {
    pub base_dir: String,
    pub no_wait: bool,
    pub default_quality: u8,
    pub max_queue: usize,
    pub remote_http: Option<String>,
}

#[derive(Debug)]
pub struct Image {
    pub path: String,
    pub image: DynamicImage,
    pub width: u32,
    pub height: u32,
    pub format: ImageFormat,
    pub quality: u8,
}

impl Image {
    pub async fn try_from_path(path: &str) -> Result<Self> {
        let mut input_file = File::open(path).await?;
        let mut buffer = Vec::new();
        input_file.read_to_end(&mut buffer).await?;

        let format: ImageFormat = image::guess_format(&buffer)?;
        let image = image::load_from_memory_with_format(&buffer, format)?;

        let (width, height) = image.dimensions();

        Ok(Self {
            path: path.to_string(),
            image,
            width,
            height,
            format,
            quality: 100,
        })
    }

    pub fn predicted(&self, opts: TransformOptions) -> Result<TransformOptions> {
        let mut opts = opts;

        let mut new_width = opts.width.unwrap_or(self.width);
        let mut new_height = opts.height.unwrap_or(self.height);

        new_width = new_width.min(self.width);
        new_height = new_height.min(self.height);

        if opts.width.is_some() && opts.height.is_none() {
            let aspect_ratio = self.width as f32 / self.height as f32;
            let calculated_height = (new_width as f32 / aspect_ratio).round() as u32;
            opts.width = Some(new_width);
            opts.height = Some(calculated_height.min(self.height));
        } else if opts.height.is_some() && opts.width.is_none() {
            let aspect_ratio = self.height as f32 / self.width as f32;
            let calculated_width = (new_height as f32 / aspect_ratio).round() as u32;
            opts.width = Some(calculated_width.min(self.width));
            opts.height = Some(new_height);
        } else {
            opts.width = Some(new_width);
            opts.height = Some(new_height);
        }

        Ok(opts)
    }

    pub fn resize(&mut self, new_width: u32, new_height: u32) -> Result<()> {
        self.image = self
            .image
            .resize(new_width, new_height, imageops::FilterType::Lanczos3);
        self.width = new_width;
        self.height = new_height;

        Ok(())
    }

    pub fn optimize(&mut self, quality: u8) -> Result<Vec<u8>> {
        let mut buf = Cursor::new(Vec::new());

        match self.format {
            ImageFormat::Avif => {
                let encoder =
                    image::codecs::avif::AvifEncoder::new_with_speed_quality(&mut buf, 4, quality);
                self.image.write_with_encoder(encoder)?;
                self.quality = quality;
            }
            ImageFormat::WebP => {
                let encoder = image::codecs::webp::WebPEncoder::new_lossless(&mut buf);
                self.image.write_with_encoder(encoder)?;
            }
            ImageFormat::Png => {
                let encoder = image::codecs::png::PngEncoder::new_with_quality(
                    &mut buf,
                    image::codecs::png::CompressionType::Best,
                    Default::default(),
                );
                self.image.write_with_encoder(encoder)?;
            }
            ImageFormat::Jpeg => {
                let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buf, quality);
                self.image.write_with_encoder(encoder)?;
            }
            _ => {
                self.image.write_to(&mut buf, self.format)?;
            }
        }

        Ok(buf.get_ref().to_vec())
    }
}

impl Image {
    pub async fn try_from_src(
        src: &str,
        remote_base: Option<&str>,
        base_dir: &str,
    ) -> Result<Self> {
        let full_src = if let Some(base) = remote_base {
            format!("{}/{}", base.trim_end_matches('/'), src)
        } else {
            let base = base_dir.trim_end_matches('/');
            if PUBLIC_DIR.is_empty() {
                format!("{}/{}", base, src)
            } else {
                format!("{}/{}/{}", base, PUBLIC_DIR, src)
            }
        };
        debug!("try_from_src full_src:{}", full_src);

        if full_src.starts_with("http://") || full_src.starts_with("https://") {
            let client = reqwest::Client::new();
            let resp = client
                .get(&full_src)
                .send()
                .await
                .map_err(|_| Error::RemoteFailed)?;
            if !resp.status().is_success() {
                return Err(Error::FileNotFound);
            }
            let bytes = resp.bytes().await.map_err(|_| Error::RemoteFailed)?;
            let format = image::guess_format(&bytes)?;
            let image = image::load_from_memory_with_format(&bytes, format)?;
            let (width, height) = image.dimensions();

            Ok(Self {
                path: full_src,
                image,
                width,
                height,
                format,
                quality: 100,
            })
        } else {
            Self::try_from_path(&full_src).await
        }
    }
}

pub type Req = (String, TransformOptions);
pub type Resp = (bool, String);

pub struct Mgr {
    pub config: Config,
    cache: cache::FileCache,
    tx: mpsc::Sender<Req>,
    rx: RwLock<mpsc::Receiver<Req>>,
}

impl Mgr {
    pub fn new(config: Config) -> Self {
        let cache_path = if CACHE_DIR.is_empty() {
            config.base_dir.clone()
        } else {
            format!("{}/{}", config.base_dir.trim_end_matches('/'), CACHE_DIR)
        };
        let cache = cache::FileCache::new(cache_path);
        let (tx, rx) = mpsc::channel::<Req>(config.max_queue);
        Self {
            config,
            cache,
            tx,
            rx: RwLock::new(rx),
        }
    }

    fn is_remote_http(&self) -> bool {
        self.config.remote_http.is_some()
    }

    fn local_path(&self, src: &str) -> String {
        let base = self.config.base_dir.trim_end_matches('/');
        if PUBLIC_DIR.is_empty() {
            format!("{}/{}", base, src)
        } else {
            format!("{}/{}/{}", base, PUBLIC_DIR, src)
        }
    }

    async fn local_exists(&self, path: &str) -> bool {
        fs::metadata(path).await.is_ok()
    }

    fn remote_url(&self, src: &str) -> Result<String> {
        let base = self
            .config
            .remote_http
            .as_deref()
            .ok_or(Error::FileNotFound)?
            .trim_end_matches('/');

        Ok(format!("{}/{}", base, src))
    }

    async fn download_remote(&self, url: &str) -> Result<Vec<u8>> {
        let client = reqwest::Client::new();
        let resp = client
            .get(url)
            .send()
            .await
            .map_err(|_| Error::RemoteFailed)?;

        if !resp.status().is_success() {
            debug!("remote download failed | status={}", resp.status());
            return Err(Error::FileNotFound);
        }

        resp.bytes()
            .await
            .map(|b| b.to_vec())
            .map_err(|_| Error::RemoteFailed)
    }

    async fn save_local(&self, path: &str, bytes: &[u8]) -> Result<()> {
        if let Some(parent) = std::path::Path::new(path).parent() {
            fs::create_dir_all(parent).await?;
        }

        fs::write(path, bytes).await?;
        Ok(())
    }

    pub async fn check_exists(&self, src: &str) -> Result<(bool, String)> {
        let local_path = self.local_path(src);

        // 1️⃣ Always check local first
        if self.local_exists(&local_path).await {
            debug!("check_exists | local hit | path={}", local_path);
            return Ok((true, local_path));
        }

        // 2️⃣ If not remote_http → stop here
        if !self.is_remote_http() {
            debug!("check_exists | local miss | remote disabled");
            return Ok((false, local_path));
        }

        // 3️⃣ Remote enabled → download & cache locally
        let remote_url = self.remote_url(src)?;
        debug!("check_exists | download from remote | url={}", remote_url);

        let bytes = self.download_remote(&remote_url).await?;
        self.save_local(&local_path, &bytes).await?;

        debug!(
            "check_exists | remote downloaded & cached | path={} size={} bytes",
            local_path,
            bytes.len()
        );

        Ok((true, local_path))
    }

    pub async fn transform(
        &self,
        src: String,
        opts: TransformOptions,
        serve: bool,
    ) -> Result<Resp> {
        debug!("transform src:{} opts:{:?} serve:{}", src, opts, serve);

        // Check cache first
        if let Some(cached) = self.cache.get(&src, &opts).await {
            return Ok((true, cached.to_string_lossy().to_string()));
        }

        // 1️⃣ Check if the file exists (local or remote)
        let (exists, path) = self.check_exists(&src).await?;
        if !exists {
            info!("File not found: {}", src);
            return Err(Error::FileNotFound);
        }

        // 2️⃣ Handle SVG separately: serve raw and cache it
        if path.ends_with(".svg") {
            // Load the file (local or remote)
            let bytes = if path.starts_with("http://") || path.starts_with("https://") {
                let client = reqwest::Client::new();
                let resp = client
                    .get(&path)
                    .send()
                    .await
                    .map_err(|_| Error::RemoteFailed)?;
                if !resp.status().is_success() {
                    return Err(Error::FileNotFound);
                }
                resp.bytes()
                    .await
                    .map_err(|_| Error::RemoteFailed)?
                    .to_vec()
            } else {
                fs::read(&path).await?
            };

            // Save the SVG file to cache
            self.cache.try_put(&src, &opts, bytes).await?;

            // Return cached path or original path if cache fails
            let cached_path = self
                .cache
                .get(&src, &opts)
                .await
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or(path.to_string());

            return Ok((true, cached_path));
        }

        // Load the image from disk or remote
        let remote_base = self.config.remote_http.as_deref();
        let mut image: Image =
            Image::try_from_src(&src, remote_base, &self.config.base_dir).await?;
        let new_opts = image.predicted(opts.clone())?;

        // Create symlink if the transformed options differ from requested
        if new_opts != opts {
            if let (true, Some(symlink)) = self
                .cache
                .create_symlink_if_needed(&src, &new_opts, &opts)
                .await?
            {
                return Ok((true, symlink.to_string_lossy().to_string()));
            }
        }

        // Resize, optimize, and save to cache
        let result = if !self.config.no_wait || serve {
            debug!(
                "process image synchronously | no_wait={} serve={} src={}",
                self.config.no_wait, serve, src
            );
            image.resize(
                new_opts.width.unwrap_or_default(),
                new_opts.height.unwrap_or_default(),
            )?;
            let buf = image.optimize(opts.quality)?;
            self.cache.try_put(&src, &new_opts, buf).await?;

            let (_, symlink) = self
                .cache
                .create_symlink_if_needed(&src, &opts, &new_opts)
                .await?;

            (
                true,
                symlink.map_or_else(|| path.to_string(), |s| s.to_string_lossy().to_string()),
            )
        } else {
            // Enqueue for asynchronous processing if no_wait is enabled
            if let Err(e) = self.tx.send((src.to_string(), opts)).await {
                warn!("Failed to send to queue: {:?}", e);
            }
            (false, path.to_string())
        };

        Ok(result)
    }

    pub async fn serve(&self) {
        while let Some((src, opts)) = self.rx.write().await.recv().await {
            if let Err(e) = self.transform(src, opts, true).await {
                warn!("Failed to serve.transform: {e:?}");
            }
        }
    }
}
