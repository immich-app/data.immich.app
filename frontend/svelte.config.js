import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

process.env.PUBLIC_IMMICH_BACKEND_URL = process.env.PUBLIC_IMMICH_BACKEND_URL || '/api';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      fallback: 'index.html',
      pages: '../dist/frontend',
    }),
  },
};

export default config;
