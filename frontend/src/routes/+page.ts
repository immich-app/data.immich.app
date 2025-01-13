import { loadGithubData } from '$lib/services/api.svelte';

export const ssr = false;

export const load = async () => {
  await loadGithubData();

  return {};
};
