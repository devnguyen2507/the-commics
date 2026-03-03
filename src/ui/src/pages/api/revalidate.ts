import type { APIRoute } from 'astro';
import { env } from '../../lib/config/env';
import { revalidateTag } from '../../lib/cache';

/**
 * POST /api/revalidate
 * Crawler gọi endpoint này sau khi lưu data mới vào DB để xóa cache ngay lập tức.
 *
 * Body: { "tags": ["comics"] }  hoặc  { "tags": ["categories"] }
 * Header: Authorization: Bearer <REVALIDATE_SECRET>
 */
export const POST: APIRoute = async ({ request }) => {
    // Bảo vệ bằng secret token
    const authHeader = request.headers.get('Authorization');
    const expected = `Bearer ${env.REVALIDATE_SECRET}`;

    if (!env.REVALIDATE_SECRET || authHeader !== expected) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let tags: string[] = [];
    try {
        const body = await request.json();
        tags = Array.isArray(body?.tags) ? body.tags : [];
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (tags.length === 0) {
        return new Response(JSON.stringify({ error: 'No tags provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const results: Record<string, string> = {};
    for (const tag of tags) {
        try {
            await revalidateTag(tag);
            results[tag] = 'ok';
        } catch (err) {
            results[tag] = `error: ${(err as Error).message}`;
        }
    }

    console.log('[revalidate] tags invalidated:', results);

    return new Response(JSON.stringify({ revalidated: results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
