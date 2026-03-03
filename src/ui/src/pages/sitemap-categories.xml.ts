import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getCategories } from '../lib/api/commics';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let categories: Awaited<ReturnType<typeof getCategories>> = [];
    try {
        categories = await getCategories();
    } catch (err) {
        console.error('[sitemap-categories] fetch error:', err);
    }

    const urls = categories.map(cat => `
  <url>
    <loc>${base}/the-loai/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
    });
};
