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

export async function getComics(variables?: { first?: number, after?: string, filter?: ComicFilter, sort?: ComicSort }) {
  const data = await GQLFetch<GetComicsQuery>(GetComicsDocument, variables);
  return mapComicsToView(data.comics);
}

export async function getComic(comicSlug: string) {
  const data = await GQLFetch<GetComicQuery>(GetComicDocument, { comicSlug });
  return data.comic ? mapComicToView(data.comic) : null;
}

export async function getChapter(chapterId: string) {
  const data = await GQLFetch<GetChapterQuery>(GetChapterDocument, { chapterId });
  return data.chapter ? mapChapterToView(data.chapter) : null;
}

export async function getCategories() {
  const data = await GQLFetch<GetCategoriesQuery>(GetCategoriesDocument);
  return mapCategoriesToView(data.categories);
}
