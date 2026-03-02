import type { GetChapterQuery } from '../generated';

export interface ChapterView {
    id: string;
    chapterNumber: string;
    orderIndex: number;
    comic: {
        id: string;
        slug: string;
        title: string;
    } | null;
    images: {
        url: string;
        w: number;
        h: number;
    }[];
    nextChapterId: string | null;
    prevChapterId: string | null;
}

type RawChapter = NonNullable<GetChapterQuery['chapter']>;

export function mapChapterToView(raw: RawChapter): ChapterView {
    return {
        id: raw.id,
        chapterNumber: raw.chapterNumber,
        orderIndex: raw.orderIndex,
        comic: raw.comic ? {
            id: raw.comic.id,
            slug: raw.comic.slug || '',
            title: raw.comic.title
        } : null,
        images: raw.images.map(img => ({
            url: img.url,
            w: img.w,
            h: img.h
        })),
        nextChapterId: raw.nextChapterId,
        prevChapterId: raw.prevChapterId
    };
}
