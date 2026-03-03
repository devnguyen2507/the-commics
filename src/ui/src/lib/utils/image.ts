import { env } from '../config/env';

/**
 * Normalizes an image URL from the backend to use the local CDN in development
 * if necessary, or just returns the URL if it's already correct.
 */
export function getImageUrl(url: string | null | undefined): string {
    if (!url) return 'https://placehold.co/300x400?text=No+Image';

    // If it's a relative path (doesn't start with http), it's a local storage path
    if (!url.startsWith('http')) {
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${env.PUBLIC_CDN_URL}/cdn-cgi/image/original${path}`;
    }

    // In local development, we want to replace production domains with our local CDN
    // The backend might return http://cdn.imgflux.com/path
    if (url.includes('cdn.imgflux.com')) {
        const path = url.split('cdn.imgflux.com').pop();
        return `${env.PUBLIC_CDN_URL}/cdn-cgi/image/original${path}`;
    }

    return url;
}
