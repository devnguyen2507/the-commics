import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';

export const GET: APIRoute = () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    const content = `User-agent: *
Allow: /

# Ưu tiên index các nội dung chính
Allow: /truyen/
Allow: /the-loai/
Allow: /truyen-hot/
Allow: /truyen-moi/

# Chặn thu thập nội dung rác gây tốn Crawl Budget
Disallow: /api/
Disallow: /tim-kiem
Disallow: /*?page=
Disallow: /*?sort=

# Chặn các đường dẫn Honeypot / Dò quét lỗi phổ biến của Scanner Bots
Disallow: /wp-admin/
Disallow: /wp-login.php
Disallow: /wp-includes/
Disallow: /wp-content/
Disallow: /admin/
Disallow: /administrator/
Disallow: /phpmyadmin/
Disallow: /.git/
Disallow: /.env
Disallow: /*?action=

Sitemap: ${base}/sitemap-index.xml
`;

    return new Response(content, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
