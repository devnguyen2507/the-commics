import { GQLFetch } from './client';
import {
  GetComicsDocument,
  GetComicDocument,
  GetChapterDocument,
  GetCategoriesDocument,
  type GetComicsQuery,
  type GetComicQuery,
  type GetChapterQuery,
  type GetCategoriesQuery,
  type ComicFilter,
  type ComicSort
} from './generated';
import { mapComicsToView, mapComicToView } from './adapters/comic';
import { mapCategoriesToView } from './adapters/category';
import { mapChapterToView } from './adapters/chapter';
import { withCache } from '../../cache';

// ─── getCategories: cache 1 giờ (thể loại ít thay đổi) ───
export const getCategories = withCache(
  async () => {
    const data = await GQLFetch<GetCategoriesQuery>(GetCategoriesDocument);
    return mapCategoriesToView(data.categories);
  },
  { mode: 'stale-while-revalidate', ttl: 3600, staleTTL: 3600, tags: ['categories'] }
);

// ─── getComics: cache 5 phút ───
export const getComics = withCache(
  async (variables?: { first?: number; after?: string; filter?: ComicFilter; sort?: ComicSort }) => {
    const data = await GQLFetch<GetComicsQuery>(GetComicsDocument, variables);
    return mapComicsToView(data.comics);
  },
  {
    mode: 'stale-while-revalidate',
    ttl: 300,
    staleTTL: 300,
    tags: (vars?: { filter?: ComicFilter }) => [
      'comics',
      vars?.filter?.categorySlug ? `cat:${vars.filter.categorySlug}` : 'comics:all',
    ],
  }
);

// ─── getComic: cache 10 phút ───
export const getComic = withCache(
  async (comicSlug: string) => {
    const data = await GQLFetch<GetComicQuery>(GetComicDocument, { comicSlug });
    return data.comic ? mapComicToView(data.comic) : null;
  },
  {
    mode: 'stale-while-revalidate',
    ttl: 600,
    staleTTL: 600,
    tags: (slug: string) => ['comics', `comic:${slug}`],
  }
);

// ─── getChapter: cache 30 phút ───
export const getChapter = withCache(
  async (chapterId: string) => {
    const data = await GQLFetch<GetChapterQuery>(GetChapterDocument, { chapterId });
    return data.chapter ? mapChapterToView(data.chapter) : null;
  },
  {
    mode: 'stale-while-revalidate',
    ttl: 1800,
    staleTTL: 1800,
    tags: (id: string) => ['chapters', `chapter:${id}`],
  }
);
