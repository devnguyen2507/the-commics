use {
    crate::State,
    actix_files::NamedFile,
    actix_web::{
        get,
        web,
        HttpRequest,
        Responder,
    },
    imgflux_logic::types::TransformOptions,
    std::sync::Arc,
    tracing::info,
};

#[get("/cdn-cgi/image/{opts}/{src:.*}")]
async fn image_handler(
    path: web::Path<(String, String)>,
    req: HttpRequest,
    state: web::Data<Arc<State>>,
) -> impl Responder {
    info!("Request: {:?}", path);

    let (opts, src) = path.into_inner();
    let mut opts = TransformOptions::try_from(opts, state.config.image.default_quality)?;

    if state.config.format_negotiation {
        if let Some(h) = req.headers().get("Accept") {
            if let Ok(s) = h.to_str() {
                opts = opts.format_negotiation(s);
            }
        }
    }

    let (yet, res) = state.image.transform(src, opts, false).await?;
    let cache_ttl = if yet { 365 * 24 * 60 * 60 } else { 0 };
    let ret = NamedFile::open_async(res)
        .await?
        .set_cache_ttl(cache_ttl)
        .disable_content_disposition();
    Ok::<NamedFile, std::io::Error>(ret)
}
