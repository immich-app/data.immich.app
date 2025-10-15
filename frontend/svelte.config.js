import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

process.env.PUBLIC_IMMICH_BACKEND_URL = process.env.PUBLIC_IMMICH_BACKEND_URL || '/api';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: '../dist/frontend',
    }),
  },
};

export default config;
