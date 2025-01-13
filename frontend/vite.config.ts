import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const apiHost = process.env.IMMICH_BACKEND || 'https://data.immich.app/';

console.log(`Connecting to ${apiHost}`);

export default defineConfig({
  plugins: [sveltekit()],
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
