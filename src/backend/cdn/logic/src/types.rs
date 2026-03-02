use {
    actix_web_thiserror::ResponseError,
    image::ImageFormat,
    std::fmt::Debug,
    thiserror::Error,
    tracing::debug,
};

#[derive(Debug, Error, ResponseError)]
pub enum Error {
    #[response(reason = "FILE_NOT_FOUND")]
    #[error("File Not Found")]
    FileNotFound,

    #[response(reason = "IO_ERROR")]
    #[error("IO Error")]
    Io(#[from] std::io::Error),

    #[response(reason = "IMAGE_ERROR")]
    #[error("Image Error")]
    Image(#[from] image::ImageError),

    #[response(reason = "REMOTE_FAILED")]
    #[error("Remote Failed")]
    RemoteFailed,
}

impl From<Error> for std::io::Error {
    fn from(err: Error) -> std::io::Error {
        match err {
            Error::FileNotFound => {
                std::io::Error::new(std::io::ErrorKind::NotFound, "File not found")
            }
            Error::Io(inner) => inner,
            Error::Image(inner) => {
                std::io::Error::new(std::io::ErrorKind::Other, format!("Image Error: {}", inner))
            }
            Error::RemoteFailed => std::io::Error::new(std::io::ErrorKind::Other, "Remote Failed"),
        }
    }
}

pub type Result<T> = anyhow::Result<T, Error>;

static DEFAULT_FORMAT: ImageFormat = ImageFormat::Png;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TransformOptions {
    pub format: ImageFormat,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub quality: u8,
}

impl Default for TransformOptions {
    fn default() -> Self {
        Self {
            format: DEFAULT_FORMAT,
            width: None,
            height: None,
            quality: 100,
        }
    }
}

impl TransformOptions {
    pub fn as_transform_ext(&self) -> String {
        self.format
            .extensions_str()
            .last()
            .map_or("png", |v| v)
            .to_string()
    }

    pub fn as_size_folder(&self) -> String {
        format!("{}x{}", self.width.unwrap_or(0), self.height.unwrap_or(0))
    }

    pub fn as_cache_key(&self) -> String {
        self.quality.to_string()
    }

    pub fn format_negotiation(mut self, content_type: &str) -> Self {
        if content_type.contains("image/avif") {
            self.format = ImageFormat::Avif;
        } else if content_type.contains("image/webp") {
            self.format = ImageFormat::WebP;
        }
        self
    }

    pub fn try_from(options_str: String, default_quality: u8) -> Result<Self> {
        let mut options = TransformOptions::default();

        for pair in options_str.split(',') {
            let mut iter = pair.split('=');
            let key = iter.next().unwrap_or_default();
            let value = iter.next().unwrap_or_default();

            match key {
                "w" | "width" => options.width = value.parse().ok(),
                "h" | "height" => options.height = value.parse().ok(),
                "f" | "format" => {
                    options.format = ImageFormat::from_extension(value).unwrap_or(DEFAULT_FORMAT)
                }
                "q" | "quality" => options.quality = value.parse().unwrap_or(default_quality),
                _ => debug!("Ignoring invalid transform option: {}", key),
            }
        }

        Ok(options)
    }
}
