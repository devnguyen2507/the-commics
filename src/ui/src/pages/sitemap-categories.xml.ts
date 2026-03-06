import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getCategories } from '../lib/api/commics';
import { buildSitemapXml, sitemapResponse } from '../lib/sitemap/helpers';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let categories: Awaited<ReturnType<typeof getCategories>> = [];
    try {
        categories = await getCategories();
    } catch (err) {
        console.error('[sitemap-categories] fetch error:', err);
    }

    const urls = categories.map((cat) => ({
        loc: `${base}/the-loai/${cat.slug}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: '0.7',
    }));

    return sitemapResponse(buildSitemapXml(urls));
};
