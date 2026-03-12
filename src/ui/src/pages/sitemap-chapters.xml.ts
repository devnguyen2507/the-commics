import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getSeoContents } from '../lib/api/commics';
import { buildSitemapXml, sitemapResponse, formatSitemapDate } from '../lib/sitemap/helpers';
import { slugify } from '../lib/utils/slug';

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let seoContents: any[] = [];
    try {
        seoContents = await getSeoContents({ entityType: 'chapter' });
    } catch (err) {
        console.error('[sitemap-chapters] fetch error:', err);
    }

    const urls = seoContents
        .filter((c) => c.isPublished)
        .map((c) => {
            // Ensure path is properly slugified even if DB record is slightly malformed
            // e.g. /truyen/slug/chap-ch..01/ -> /truyen/slug/chap-ch-01/
            const cleanPath = c.path
                .split('/')
                .map((segment: string) => {
                    if (segment.startsWith('chap-')) {
                        const numPart = segment.replace('chap-', '');
                        return `chap-${slugify(numPart || '')}`;
                    }
                    return segment;
                })
                .join('/');

            return {
                loc: `${base}${cleanPath}`,
                changefreq: 'monthly' as const,
                priority: '0.6',
                lastmod: formatSitemapDate(c.publishedAt),
            };
        })
        .sort((a, b) => a.loc.localeCompare(b.loc));

    return sitemapResponse(buildSitemapXml(urls));
};
