import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    integrations: [react(), node({ mode: 'standalone' })],

    output: 'server',
    adapter: node({ mode: 'standalone' }),

    vite: {
        plugins: [
            visualizer({ open: process.env.ANALYZE === 'true' }),
            tailwindcss({ optimize: { minify: true } }),
        ],

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
