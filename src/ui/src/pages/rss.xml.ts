import rss from '@astrojs/rss';
import { getComics } from '../lib/api/commics';
import { env } from '../lib/config/env';
import { ComicSort } from '../lib/api/commics/generated';

export const prerender = process.env.OUTPUT_MODE === 'static';

export async function GET(context: any) {
    let comics: any[] = [];
    try {
        // Lấy danh sách truyện mới cập nhật (dựa theo giới hạn build cấu hình)
        comics = await getComics({ first: env.STATIC_BUILD_LIMIT, sort: ComicSort.Latest });
    } catch (error) {
        console.error("Error fetching comics for RSS:", error);
    }

    const siteUrl = env.SITE_URL || context.site || 'https://fanmanga.net';

    return rss({
        title: `${env.SITE_NAME} - Truyện tranh mới cập nhật`,
        description: 'Cập nhật liên tục các bộ truyện tranh Manga, Manhwa, Manhua hay nhất.',
        site: siteUrl,
        items: comics.map((comic) => ({
            title: comic.title,
            pubDate: new Date(comic.updatedAt || comic.createdAt || new Date()),
            description: `Đọc truyện tranh ${comic.title} online chất lượng cao tại ${env.SITE_NAME}.`,
            link: `${siteUrl}/truyen/${comic.slug}/`,
            // Bạn có thể thêm customData để chèn ảnh vào feed nều cần (tùy chọn)
            customData: `<author>${comic.author || 'Đang cập nhật'}</author>`,
        })),
        customData: `<language>vi-vn</language>`,
    });
}
