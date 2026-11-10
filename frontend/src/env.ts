import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  PUBLIC_IMMICH_BACKEND_URL: { public: true, static: true, schema: (value) => value || '/api' },
});
