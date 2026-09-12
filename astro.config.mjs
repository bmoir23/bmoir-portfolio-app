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
