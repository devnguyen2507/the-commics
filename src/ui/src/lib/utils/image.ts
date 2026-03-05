import { env } from '../config/env';

/**
 * Normalizes an image URL from the backend to use the local CDN in development
 * if necessary, or just returns the URL if it's already correct.
 */
export function getImageUrl(url: string | null | undefined): string {
    if (!url) return '/placeholder.svg';

    // In static mode (e.g. for landing pages on Cloudflare without API/CDN), return placeholder
    if (env.OUTPUT_MODE === 'static') {
        return '/placeholder.svg'
    }

    let path = url;

    // If it's a full URL, we only process it if it's our production CDN domain
    if (url.startsWith('http')) {
        if (url.includes('cdn.imgflux.com')) {
            path = url.split('cdn.imgflux.com').pop() || '';
        } else {
            // Other external URLs (like backups) are returned as-is
            return url;
        }
    }

    // Default: Ensure leading slash and prefix with local CDN
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${env.PUBLIC_CDN_URL}/cdn-cgi/image/original${cleanPath}`;
}
