// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { remarkCodeMeta } from './src/lib/remark-code-meta.ts';
import { CONFIG } from './src/data/config.ts';

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  keepBackground: false,
};

// https://astro.build/config
export default defineConfig({
  site: CONFIG.site.url,
  output: 'server',

  adapter: cloudflare({
    // Use local binding mocks (Miniflare) for `astro dev`/`preview` instead of
    // opening a remote proxy session, which requires a CLOUDFLARE_API_TOKEN.
    // Production deploys use the real bindings from wrangler.jsonc regardless.
    remoteBindings: false,
  }),

  vite: {
    plugins: [tailwindcss()],
    // Ensure a single React instance in the workerd SSR bundle. Without this the
    // Cloudflare adapter's SSR environment can load two copies of React, so the
    // dispatcher set by react-dom/server is invisible to island components and
    // hooks throw "Cannot read properties of null (reading 'useState')".
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    // Pre-bundle React into a single optimized instance so the dev module runner
    // doesn't occasionally instantiate a second copy (which nulls the SSR
    // dispatcher). Production builds already ship a single React instance.
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/server.edge',
      ],
    },
  },

  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkGfm, remarkCodeMeta],
      rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      syntaxHighlight: false,
    }),
    sitemap(),
  ],

  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkGfm, remarkCodeMeta],
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
});
