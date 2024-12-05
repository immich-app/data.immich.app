export type GithubRepo = { name: string; organization: string };

export const GithubRepos: { [key: string]: GithubRepo } = {
  IMMICH: { name: 'immich', organization: 'immich-app' },
};
