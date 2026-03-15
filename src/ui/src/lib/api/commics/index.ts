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
  type GetComicsCountQuery, // Added GetComicsCountQuery
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
    const data = await GQLFetch<GetCategoriesQuery>(GetCategoriesDocument as any);
    return mapCategoriesToView(data.categories);
  },
  { mode: 'stale-while-revalidate', ttl: 3600, staleTTL: 3600, tags: ['categories'] }
);

// ─── getComics: cache 5 phút ───
export const getComics = withCache(
  async (variables?: { first?: number; after?: string; filter?: ComicFilter; sort?: ComicSort }) => {
    const data = await GQLFetch<GetComicsQuery>(GetComicsDocument as any, variables);
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

// ─── getComicsCount: cache 5 phút ───
export const getComicsCount = withCache(
  async (variables?: { filter?: ComicFilter }) => {
    const data = await GQLFetch<GetComicsCountQuery>({
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          name: { kind: 'Name', value: 'getComicsCount' },
          variableDefinitions: [
            {
              kind: 'VariableDefinition',
              variable: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'ComicFilter' } },
            },
          ],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: { kind: 'Name', value: 'comicsCount' },
                arguments: [
                  {
                    kind: 'Argument',
                    name: { kind: 'Name', value: 'filter' },
                    value: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
                  },
                ],
              },
            ],
          },
        },
      ],
    } as any, variables);
    return data.comicsCount;
  },
  {
    mode: 'stale-while-revalidate',
    ttl: 300,
    staleTTL: 300,
    tags: (vars?: { filter?: ComicFilter }) => [
      'comics_count',
      vars?.filter?.categorySlug ? `count_cat:${vars.filter.categorySlug} ` : 'count_all',
    ],
  }
);

// ─── getComic: cache 10 phút ───
export const getComic = withCache(
  async (comicSlug: string) => {
    const data = await GQLFetch<GetComicQuery>(GetComicDocument as any, { comicSlug });
    return data.comic ? mapComicToView(data.comic) : null;
  },
  {
    mode: 'stale-while-revalidate',
    ttl: 600,
    staleTTL: 600,
    tags: (slug: string) => ['comics', `comic:${slug} `],
  }
);

// ─── getChapter: cache 30 phút ───
export const getChapter = withCache(
  async (chapterId: string) => {
    const data = await GQLFetch<GetChapterQuery>(GetChapterDocument as any, { chapterId });
    return data.chapter ? mapChapterToView(data.chapter) : null;
  },
  {
    mode: 'stale-while-revalidate',
    ttl: 1800,
    staleTTL: 1800,
    tags: (id: string) => ['chapters', `chapter:${id} `],
  }
);
// ─── getSeoContents: cache 1 giờ ───
export const getSeoContents = withCache(
  async (variables?: { entityType?: string; all?: boolean; isPublished?: boolean }) => {
    const data = await GQLFetch<any>(
      `query getSeoContents($filter: SeoFilter, $all: Boolean) {
        seoContents(filter: $filter, all: $all) {
          path
          title
          description
          keywords
          publishedAt
          isPublished
          entityType
          entityId
        }
      }`,
      {
        filter: {
          entityType: variables?.entityType,
          isPublished: variables?.isPublished
        },
        all: variables?.all
      }
    );
    return data.seoContents;
  },
  { mode: 'stale-while-revalidate', ttl: 3600, staleTTL: 3600, tags: ['seo'] }
);
