export interface SitemapUrl {
    loc: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    /** '0.0' → '1.0' */
    priority?: string;
    /** YYYY-MM-DD */
    lastmod?: string;
}

/**
 * Build XML urlset string từ danh sách URL.
 * Dùng chung cho tất cả sub-sitemap files.
 */
export function buildSitemapXml(urls: SitemapUrl[]): string {
    const entries = urls
        .map(({ loc, changefreq, priority, lastmod }) => {
            const parts = [`    <loc>${loc}</loc>`];
            if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
            if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
            if (priority) parts.push(`    <priority>${priority}</priority>`);
            return `  <url>\n${parts.join('\n')}\n  </url>`;
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

/**
 * Tạo Response chuẩn cho sitemap với Content-Type và Cache-Control headers.
 * @param maxAge Cache thời gian tính bằng giây (default: 3600 = 1h)
 */
export function sitemapResponse(xml: string, maxAge = 3600): Response {
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=86400`,
        },
    });
}
