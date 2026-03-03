import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getComics } from '../lib/api/commics';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let comics: Awaited<ReturnType<typeof getComics>> = [];
    try {
        // Lấy comics với chapters[] đã có sẵn trong ComicView
        comics = await getComics({ first: 5000 });
    } catch (err) {
        console.error('[sitemap-chapters] fetch error:', err);
    }

    // Flatten: mỗi comic → mỗi chapter → 1 URL
    const urls: string[] = [];
    for (const comic of comics) {
        if (!comic.slug || !comic.chapters?.length) continue;
        for (const chapter of comic.chapters) {
            if (!chapter.id) continue;
            urls.push(`
  <url>
    <loc>${base}/${comic.slug}/${chapter.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
    });
};
