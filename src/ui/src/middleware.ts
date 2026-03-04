import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const url = context.url;

    // Pattern: /{comic-slug}/{uuid}
    // This matches the old chapter URLs: a slug followed by a UUID
    const chapterOldPattern = /^\/([^\/]+)\/([a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i;

    const match = url.pathname.match(chapterOldPattern);

    if (match) {
        const [, comicSlug, chapterId] = match;

        // We only redirect if we have the GRAPHQL_URL
        const graphqlUrl = import.meta.env.GRAPHQL_URL_INTERNAL || import.meta.env.PUBLIC_GRAPHQL_URL || 'http://localhost:18000/graphql';

        try {
            // Fetch just the chapter number from the GraphQL API for the UUID
            const response = await fetch(graphqlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `query { chapter(chapterId: "${chapterId}") { chapterNumber } }`
                })
            });

            const { data } = await response.json();

            if (data?.chapter?.chapterNumber) {
                // Redirect 301 to the new chap-{N} URL format
                return context.redirect(`/${comicSlug}/chap-${data.chapter.chapterNumber}`, 301);
            }
        } catch (e) {
            console.error('[Middleware] Error resolving chapter UUID to redirect:', e);
            // Fallback: let the request proceed to the old route if we failed to get chapterNumber
        }
    }

    return next();
});
