export interface BreadcrumbItem {
    label: string;
    url: string;
}

/**
 * Generates a JSON-LD string for BreadcrumbList
 * @param items Array of BreadcrumbItem with label and absolute url
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": item.url
        }))
    };
    return JSON.stringify(schema);
}

/**
 * Generates a JSON-LD string for WebSite and Organization
 * @param siteName The name of the website
 * @param siteUrl The base URL of the website
 * @param logoUrl Optional URL to the organization logo
 */
export function generateWebsiteSchema(siteName: string, siteUrl: string, logoUrl?: string): string {
    const schema = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": siteUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/tim-kiem?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            ...(logoUrl && { "logo": logoUrl })
        }
    ];
    return JSON.stringify(schema);
}

/**
 * Generates a JSON-LD string for a CollectionPage
 * @param title Title of the collection
 * @param description Description of the collection
 * @param url URL of the collection page
 */
export function generateCollectionSchema(title: string, description: string, url: string): string {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": url,
        "inLanguage": "vi"
    };
    return JSON.stringify(schema);
}

/**
 * Generates a JSON-LD string for a Book (Comic)
 */
export function generateComicSchema(comic: any, siteUrl: string, siteName: string): string {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Book",
        "name": comic.title,
        "description": `Đọc truyện ${comic.title} online tại ${siteName}.`,
        "url": `${siteUrl}/truyen/${comic.slug}`,
        "image": comic.coverImage,
        "author": {
            "@type": "Person",
            "name": comic.author || "Đang cập nhật"
        },
        "genre": comic.categories?.map((c: any) => c.name) || [],
        "inLanguage": "vi",
        ...(comic.ratingScore && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": comic.ratingScore,
                "ratingCount": comic.ratingCount || comic.viewCount || 100
            }
        })
    };
    return JSON.stringify(schema);
}

/**
 * Generates a JSON-LD string for an Article (Chapter)
 */
export function generateChapterSchema(chapter: any, comicTitle: string, comicSlug: string, chapterUrl: string, firstImageUrl: string, siteUrl: string): string {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${comicTitle} - Chương ${chapter.chapterNumber}`,
        "description": `Đọc Chương ${chapter.chapterNumber} truyện ${comicTitle} online.`,
        "url": chapterUrl,
        "image": firstImageUrl,
        "isPartOf": {
            "@type": "ComicSeries",
            "name": comicTitle,
            "url": `${siteUrl}/truyen/${comicSlug}`
        },
        "inLanguage": "vi"
    };
    return JSON.stringify(schema);
}
