import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Chapter = {
  __typename?: 'Chapter';
  chapterNumber: Scalars['String']['output'];
  /** Parent comic info — for breadcrumbs, SEO title, navbar */
  comic: Maybe<Comic>;
  id: Scalars['ID']['output'];
  images: Array<ChapterImage>;
  nextChapterId: Maybe<Scalars['ID']['output']>;
  orderIndex: Scalars['Float']['output'];
  prevChapterId: Maybe<Scalars['ID']['output']>;
};

export type ChapterImage = {
  __typename?: 'ChapterImage';
  h: Scalars['Int']['output'];
  url: Scalars['String']['output'];
  w: Scalars['Int']['output'];
};

export type Comic = {
  __typename?: 'Comic';
  author: Maybe<Scalars['String']['output']>;
  categories: Array<Category>;
  chapters: Array<Chapter>;
  coverImage: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ratingCount: Maybe<Scalars['Int']['output']>;
  ratingScore: Maybe<Scalars['Float']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  viewCount: Maybe<Scalars['Int']['output']>;
};

export type ComicFilter = {
  categorySlug: InputMaybe<Scalars['String']['input']>;
  searchQuery: InputMaybe<Scalars['String']['input']>;
  status: InputMaybe<Scalars['String']['input']>;
};

export enum ComicSort {
  Latest = 'LATEST',
  MostViewed = 'MOST_VIEWED',
  Rating = 'RATING',
  TitleAsc = 'TITLE_ASC'
}

export type QueryRoot = {
  __typename?: 'QueryRoot';
  categories: Array<Category>;
  chapter: Maybe<Chapter>;
  comic: Maybe<Comic>;
  comics: Array<Comic>;
};


export type QueryRootChapterArgs = {
  chapterId: Scalars['ID']['input'];
};


export type QueryRootComicArgs = {
  comicSlug: Scalars['String']['input'];
};


export type QueryRootComicsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  filter: InputMaybe<ComicFilter>;
  first: InputMaybe<Scalars['Int']['input']>;
  sort: InputMaybe<ComicSort>;
};

export type GetComicsQueryVariables = Exact<{
  first: InputMaybe<Scalars['Int']['input']>;
  after: InputMaybe<Scalars['String']['input']>;
  filter: InputMaybe<ComicFilter>;
  sort: InputMaybe<ComicSort>;
}>;


export type GetComicsQuery = { __typename?: 'QueryRoot', comics: Array<{ __typename?: 'Comic', id: string, slug: string | null, title: string, author: string | null, status: string | null, ratingScore: number | null, ratingCount: number | null, viewCount: number | null, coverImage: string | null }> };

export type GetComicQueryVariables = Exact<{
  comicSlug: Scalars['String']['input'];
}>;


export type GetComicQuery = { __typename?: 'QueryRoot', comic: { __typename?: 'Comic', id: string, slug: string | null, title: string, author: string | null, status: string | null, description: string | null, ratingScore: number | null, ratingCount: number | null, viewCount: number | null, coverImage: string | null, categories: Array<{ __typename?: 'Category', id: string, name: string, slug: string }>, chapters: Array<{ __typename?: 'Chapter', id: string, chapterNumber: string, orderIndex: number }> } | null };

export type GetChapterQueryVariables = Exact<{
  chapterId: Scalars['ID']['input'];
}>;


export type GetChapterQuery = { __typename?: 'QueryRoot', chapter: { __typename?: 'Chapter', id: string, chapterNumber: string, orderIndex: number, nextChapterId: string | null, prevChapterId: string | null, comic: { __typename?: 'Comic', id: string, slug: string | null, title: string } | null, images: Array<{ __typename?: 'ChapterImage', url: string, w: number, h: number }> } | null };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'QueryRoot', categories: Array<{ __typename?: 'Category', id: string, name: string, slug: string }> };


export const GetComicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getComics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ComicFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ComicSort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"ratingScore"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"coverImage"}}]}}]}}]} as unknown as DocumentNode<GetComicsQuery, GetComicsQueryVariables>;
export const GetComicDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getComic"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comicSlug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comic"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"comicSlug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comicSlug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"ratingScore"}},{"kind":"Field","name":{"kind":"Name","value":"ratingCount"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"coverImage"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}}]}}]}}]}}]} as unknown as DocumentNode<GetComicQuery, GetComicQueryVariables>;
export const GetChapterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getChapter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chapterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chapter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chapterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chapterId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chapterNumber"}},{"kind":"Field","name":{"kind":"Name","value":"orderIndex"}},{"kind":"Field","name":{"kind":"Name","value":"comic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"w"}},{"kind":"Field","name":{"kind":"Name","value":"h"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextChapterId"}},{"kind":"Field","name":{"kind":"Name","value":"prevChapterId"}}]}}]}}]} as unknown as DocumentNode<GetChapterQuery, GetChapterQueryVariables>;
export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;