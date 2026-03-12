import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getSeoContents } from '../lib/api/commics';
import { buildSitemapXml, sitemapResponse, formatSitemapDate } from '../lib/sitemap/helpers';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let seoContents: any[] = [];
    try {
        seoContents = await getSeoContents({ entityType: 'comic' });
    } catch (err) {
        console.error('[sitemap-comics] fetch error:', err);
    }

    const urls = seoContents
        .filter((c) => c.isPublished)
        .map((c) => ({
            loc: `${base}${c.path}`,
            changefreq: 'daily' as const,
            priority: '0.8',
            lastmod: formatSitemapDate(c.publishedAt),
        }))
        .sort((a, b) => a.loc.localeCompare(b.loc));

    return sitemapResponse(buildSitemapXml(urls));
};
