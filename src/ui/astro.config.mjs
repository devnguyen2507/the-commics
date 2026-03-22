import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    site: process.env.SITE_URL || 'http://localhost:4321',
    trailingSlash: 'always',
    integrations: [
        react()
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
        inlineStylesheets: 'always',
        assets: 'assets',
    },
});
