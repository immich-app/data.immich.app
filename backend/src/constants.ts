export type GithubRepo = { name: string; organization: string };
export type GithubUser = { login: string; id: number };

export const GithubRepos: { [key: string]: GithubRepo } = {
  IMMICH: { name: 'immich', organization: 'immich-app' },
};
