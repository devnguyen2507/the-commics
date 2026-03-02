import type { GetCategoriesQuery } from '../generated';

export interface CategoryView {
    id: string;
    name: string;
    slug: string;
}

type RawCategory = GetCategoriesQuery['categories'][number];

export function mapCategoryToView(raw: RawCategory): CategoryView {
    return {
        id: raw.id,
        name: raw.name,
        slug: raw.slug,
    };
}

export function mapCategoriesToView(rawList: RawCategory[]): CategoryView[] {
    return rawList.map(mapCategoryToView);
}
