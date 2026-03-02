import type { GetComicsQuery, GetComicQuery } from '../generated';

export interface ComicView {
    id: string;
    slug: string;
    title: string;
    author: string;
    status: string;
    description: string;
    ratingScore: number;
    ratingCount: number;
    viewCount: number;
    coverImage: string;
    categories: { id: string; name: string; slug: string }[];
    chapters: { id: string; chapterNumber: string; orderIndex: number }[];
}

type RawComic = GetComicsQuery['comics'][number] | NonNullable<GetComicQuery['comic']>;

export function mapComicToView(raw: RawComic): ComicView {
    return {
        id: raw.id,
        slug: raw.slug || '',
        title: raw.title,
        author: raw.author || 'Đang cập nhật',
        status: raw.status || 'Đang tiến hành',
        description: (raw as any).description || '',
        ratingScore: raw.ratingScore || 0,
        ratingCount: raw.ratingCount || 0,
        viewCount: raw.viewCount || 0,
        coverImage: raw.coverImage || 'https://placehold.co/300x400?text=No+Cover',
        categories: (raw as any).categories || [],
        chapters: (raw as any).chapters || [],
    };
}

export function mapComicsToView(rawList: RawComic[]): ComicView[] {
    return rawList.map(mapComicToView);
}
