use {
    imgflux_logic::image,
    serde::{
        Deserialize,
        Serialize,
    },
};

#[derive(Default, Debug, Clone, Deserialize, Serialize)]
pub struct Config {
    pub listen: String,
    pub format_negotiation: bool,
    pub image: image::Config,
}

pub fn try_from_env() -> anyhow::Result<Config> {
    let config = config::Config::builder()
        .add_source(
            config::Environment::with_prefix("CDN")
                .try_parsing(true)
                .separator("__"),
        )
        .build()?;
    Ok(config.try_deserialize()?)
}
