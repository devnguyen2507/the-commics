mod config;
mod routes;
use {
    actix_web::{
        middleware::Logger,
        web,
        App,
        HttpServer,
    },
    dotenv::dotenv,
    imgflux_logic::image,
    std::{
        net::TcpListener,
        sync::Arc,
    },
    tracing_subscriber::{
        fmt,
        prelude::*,
        EnvFilter,
    },
};

pub struct State {
    pub config: config::Config,
    pub image: image::Mgr,
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let filter = EnvFilter::from_default_env();
    let filtered_layer = fmt::layer().with_filter(filter);
    tracing_subscriber::registry().with(filtered_layer).init();

    let config = config::try_from_env()?;
    let listener = TcpListener::bind(config.listen.clone())?;

    let state = Arc::new(State {
        config: config.clone(),
        image: image::Mgr::new(config.image),
    });

    {
        let state = Arc::clone(&state);
        tokio::spawn(async move {
            state.image.serve().await;
        });
    }

    #[allow(clippy::unwrap_used)]
    let num_cores = std::thread::available_parallelism()
        .unwrap_or_else(|_| std::num::NonZeroUsize::new(1).unwrap())
        .get();
    let _ = HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(web::Data::new(Arc::clone(&state)))
            .service(routes::image_handler)
    })
    .listen(listener)?
    .workers(num_cores)
    .run()
    .await;

    Ok(())
}
