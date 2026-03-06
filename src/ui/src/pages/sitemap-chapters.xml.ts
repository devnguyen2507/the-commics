import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getComics } from '../lib/api/commics';
import { buildSitemapXml, sitemapResponse } from '../lib/sitemap/helpers';
import { slugify } from '../lib/utils/slug';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let comics: Awaited<ReturnType<typeof getComics>> = [];
    try {
        // Fetch more for sitemap (e.g., 1000 instead of 5000 to be safe on memory during build)
        comics = await getComics({ first: env.STATIC_BUILD_LIMIT });
    } catch (err) {
        console.error('[sitemap-chapters] fetch error:', err);
    }

    // Flatten: mỗi comic → mỗi chapter → 1 URL
    // NOTE: Cần fetch chi tiết từng truyện để đảm bảo có chapters[] (do GraphQL query list có thể bị filter)
    const { getComic } = await import('../lib/api/commics');

    const urlPromises = comics.map(async (comic) => {
        if (!comic.slug) return [];

        try {
            const detailedComic = await getComic(comic.slug);
            if (!detailedComic || !detailedComic.chapters?.length) return [];

            return detailedComic.chapters
                .filter((ch) => ch.chapterNumber)
                .map((ch) => ({
                    loc: `${base}/truyen/${comic.slug}/chap-${slugify(ch.chapterNumber || '')}`,
                    lastmod: new Date().toISOString(),
                    changefreq: 'monthly' as const,
                    priority: '0.6',
                }));
        } catch (e) {
            console.error(`[sitemap-chapters] Failed to fetch chapters for ${comic.slug}:`, e);
            return [];
        }
    });

    const results = await Promise.all(urlPromises);
    const urls = results.flat();

    return sitemapResponse(buildSitemapXml(urls));
};
