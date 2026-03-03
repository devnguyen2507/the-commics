import { env } from '../config/env';

/**
 * Normalizes an image URL from the backend to use the local CDN in development
 * if necessary, or just returns the URL if it's already correct.
 */
export function getImageUrl(url: string | null | undefined): string {
    if (!url) return 'https://placehold.co/300x400?text=No+Image';

    // In local development, we want to replace production domains with our local CDN
    // The backend might return http://cdn.imgflux.com/path
    // Our local CDN is at env.PUBLIC_CDN_URL (e.g., http://127.0.0.1:3005)

    if (url.includes('cdn.imgflux.com')) {
        const path = url.split('cdn.imgflux.com').pop();
        // Local imgflux expects /cdn-cgi/image/{opts}/{path}
        return `${env.PUBLIC_CDN_URL}/cdn-cgi/image/original${path}`;
    }

    return url;
}
