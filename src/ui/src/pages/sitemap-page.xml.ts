import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';

const STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/truyen-hot', priority: '0.8', changefreq: 'daily' },
    { path: '/tim-kiem', priority: '0.6', changefreq: 'weekly' },
    { path: '/the-loai', priority: '0.8', changefreq: 'weekly' },
];

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    const urls = STATIC_PAGES.map(({ path, priority, changefreq }) => `
  <url>
    <loc>${base}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
        },
    });
};
