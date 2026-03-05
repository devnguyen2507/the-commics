import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    site: process.env.SITE_URL || 'http://localhost:4321',
    integrations: [
        react(),
        sitemap({
            trailingSlash: "ignore",
        })
    ],

    output: process.env.OUTPUT_MODE === 'static' ? 'static' : 'server',
    adapter: node({ mode: 'standalone' }),

    vite: {
        plugins: [
            process.env.ANALYZE === 'true' && visualizer({
                open: true,
                filename: 'stats.html'
            }),
            tailwindcss({ optimize: { minify: true } }),
        ].filter(Boolean),

        build: {
            target: 'esnext',
        },
        resolve: {
            alias: {
                '@': path.resolve('./src'),
            },
        },
    },

    build: {
        inlineStylesheets: 'auto',
        assets: 'assets',
    },
});
