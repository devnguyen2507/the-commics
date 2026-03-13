import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';
import { getSeoContents } from '../lib/api/commics';
import { formatSitemapDate } from '../lib/sitemap/helpers';

export const GET: APIRoute = async () => {
  const base = env.SITE_URL.replace(/\/$/, '');

  let seoContents: any[] = [];
  try {
    seoContents = await getSeoContents({ all: true, isPublished: true });
  } catch (err) {
    console.error('[sitemap-index] fetch error:', err);
  }

  const getLatestMod = (type: string) => {
    const dates = seoContents
      .filter(c => c.entityType === type && c.isPublished && c.publishedAt)
      .map(c => new Date(c.publishedAt).getTime());
    if (dates.length === 0) return null;
    return formatSitemapDate(new Date(Math.max(...dates)));
  };

  const mods = {
    page: getLatestMod('page'),
    category: getLatestMod('category'),
    comic: getLatestMod('comic'),
    chapter: getLatestMod('chapter'),
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${base}/sitemap-page.xml</loc>
    ${mods.page ? `<lastmod>${mods.page}</lastmod>` : ''}
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-categories.xml</loc>
    ${mods.category ? `<lastmod>${mods.category}</lastmod>` : ''}
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-comics.xml</loc>
    ${mods.comic ? `<lastmod>${mods.comic}</lastmod>` : ''}
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-chapters.xml</loc>
    ${mods.chapter ? `<lastmod>${mods.chapter}</lastmod>` : ''}
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
