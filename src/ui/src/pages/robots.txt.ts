import type { APIRoute } from 'astro';
import { env } from '../lib/config/env';

export const GET: APIRoute = () => {
    const base = env.SITE_URL.replace(/\/$/, '');

    const content = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${base}/sitemap-index.xml
`;

    return new Response(content, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
