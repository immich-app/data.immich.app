import { DateTime } from 'luxon';

export type GithubRepo = { name: string; organization: string };
export type GithubUser = { login: string; id: number };

export const GithubRepos: { [key: string]: GithubRepo } = {
  IMMICH: { name: 'immich', organization: 'immich-app' },
};

export const IMMICH_INCEPTION = DateTime.fromISO('2022-02-01T00:00:00Z');
