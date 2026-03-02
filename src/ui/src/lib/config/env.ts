export const env = {
    PUBLIC_GRAPHQL_URL: import.meta.env.PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
    PUBLIC_CDN_URL: import.meta.env.PUBLIC_CDN_URL || 'https://cdn.imgflux.com',
    GTM_ID: import.meta.env.GTM_ID || '',
    GOOGLE_SITE_VERIFICATION: import.meta.env.GOOGLE_SITE_VERIFICATION || '',
};

export const getPublicEnv = () => ({
    PUBLIC_GRAPHQL_URL: env.PUBLIC_GRAPHQL_URL,
    PUBLIC_CDN_URL: env.PUBLIC_CDN_URL,
    GTM_ID: env.GTM_ID,
    GOOGLE_SITE_VERIFICATION: env.GOOGLE_SITE_VERIFICATION,
});
