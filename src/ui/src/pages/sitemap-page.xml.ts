import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { buildSitemapXml, sitemapResponse, formatSitemapDate } from '../lib/sitemap/helpers';
import { getSeoContents } from '../lib/api/commics';

const STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/truyen-hot/', priority: '0.9', changefreq: 'daily' },
    { path: '/truyen-moi/', priority: '0.9', changefreq: 'daily' },
    { path: '/the-loai/', priority: '0.8', changefreq: 'weekly' },
    { path: '/tim-kiem/', priority: '0.6', changefreq: 'weekly' },
    { path: '/cau-hoi-thuong-gap/', priority: '0.5', changefreq: 'monthly' },
    { path: '/lien-he/', priority: '0.4', changefreq: 'monthly' },
    { path: '/dieu-khoan/', priority: '0.3', changefreq: 'monthly' },
    { path: '/chinh-sach/', priority: '0.3', changefreq: 'monthly' },
] as const;

export const GET: APIRoute = async () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    let seoContents: any[] = [];
    try {
        seoContents = await getSeoContents({ entityType: 'page', all: true, isPublished: true });
    } catch (err) {
        console.error('[sitemap-page] fetch error:', err);
    }

    const seoMap = new Map(seoContents.map(c => [c.path, c]));

    const urls = STATIC_PAGES
        .filter((p) => {
            const seo = seoMap.get(p.path);
            return seo ? seo.isPublished : true;
        })
        .map(({ path, priority, changefreq }) => {
            const seo = seoMap.get(path);
            return {
                loc: `${base}${path}`,
                changefreq,
                priority,
                lastmod: formatSitemapDate(seo?.publishedAt),
            };
        });

    return sitemapResponse(buildSitemapXml(urls), 86400);
};
