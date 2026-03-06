import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getComics } from '../lib/api/commics';
import { buildSitemapXml, sitemapResponse } from '../lib/sitemap/helpers';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let comics: Awaited<ReturnType<typeof getComics>> = [];
    try {
        comics = await getComics({ first: 5000 });
    } catch (err) {
        console.error('[sitemap-comics] fetch error:', err);
    }

    const urls = comics.map((c) => ({
        loc: `${base}/truyen/${c.slug}`,
        changefreq: 'daily' as const,
        priority: '0.8',
        // updatedAt nếu GraphQL expose, fallback về hôm nay
        lastmod: (c as any).publishedAt ?? new Date().toISOString(),
    }));

    return sitemapResponse(buildSitemapXml(urls));
};
