import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getComics } from '../lib/api/commics';
import { buildSitemapXml, sitemapResponse } from '../lib/sitemap/helpers';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let comics: Awaited<ReturnType<typeof getComics>> = [];
    try {
        // chapters[] đã có sẵn trong ComicView
        comics = await getComics({ first: 5000 });
    } catch (err) {
        console.error('[sitemap-chapters] fetch error:', err);
    }

    // Flatten: mỗi comic → mỗi chapter → 1 URL
    // NOTE: URL format dùng chap-{chapterNumber} (Phase 3 SEO)
    const urls = comics.flatMap((comic) => {
        if (!comic.slug || !comic.chapters?.length) return [];
        return comic.chapters
            .filter((ch) => ch.chapterNumber)
            .map((ch) => ({
                loc: `${base}/${comic.slug}/chap-${ch.chapterNumber}`,
                changefreq: 'monthly' as const,
                priority: '0.6',
            }));
    });

    return sitemapResponse(buildSitemapXml(urls));
};
