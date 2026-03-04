// process.env = đọc lúc runtime trong Node.js (SSR) → không bị bake lúc docker build
// import.meta.env = đọc lúc build time (Vite) → bị bake vào bundle

// Utility class to get runtime env reliably in Astro SSR without Vite statically replacing it
const getRuntimeEnv = (key: string, defaultValue: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    return defaultValue;
};

export const env = {
    // SSR-only: server-side fetch URL, đọc lúc runtime
    GRAPHQL_URL_INTERNAL: getRuntimeEnv('GRAPHQL_URL_INTERNAL', 'http://localhost:18000/graphql'),

    // Public: baked lúc build, dùng cho client-side / meta tags
    PUBLIC_GRAPHQL_URL: import.meta.env.PUBLIC_GRAPHQL_URL || 'http://localhost:18000/graphql',
    PUBLIC_CDN_URL: getRuntimeEnv('PUBLIC_CDN_URL', import.meta.env.PUBLIC_CDN_URL || 'https://cdn.imgflux.com'),
    GTM_ID: import.meta.env.GTM_ID || '',
    GOOGLE_SITE_VERIFICATION: import.meta.env.GOOGLE_SITE_VERIFICATION || '',

    // Pagination Limits (tweakable)
    PUBLIC_HOME_COMICS_LIMIT: parseInt(import.meta.env.PUBLIC_HOME_COMICS_LIMIT || '24', 10),
    PUBLIC_PAGE_COMICS_LIMIT: parseInt(import.meta.env.PUBLIC_PAGE_COMICS_LIMIT || '24', 10),

    // Runtime vars (process.env only)
    SITE_URL: getRuntimeEnv('SITE_URL', 'http://localhost:4321'),
    CACHE_URL: getRuntimeEnv('CACHE_URL', ''),
    REVALIDATE_SECRET: getRuntimeEnv('REVALIDATE_SECRET', ''),
};

export const getPublicEnv = () => ({
    PUBLIC_GRAPHQL_URL: env.PUBLIC_GRAPHQL_URL,
    PUBLIC_CDN_URL: env.PUBLIC_CDN_URL,
    GTM_ID: env.GTM_ID,
    GOOGLE_SITE_VERIFICATION: env.GOOGLE_SITE_VERIFICATION,
});
