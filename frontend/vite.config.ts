import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const apiHost = process.env.IMMICH_BACKEND || 'https://data.immich.app/';

console.log(`Connecting to ${apiHost}`);

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({ pages: '../dist/frontend' }),
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: apiHost,
        secure: true,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
