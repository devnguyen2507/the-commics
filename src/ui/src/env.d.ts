/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_GRAPHQL_URL: string;
    readonly PUBLIC_CDN_URL: string;
    readonly GTM_ID: string;
    readonly GOOGLE_SITE_VERIFICATION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
