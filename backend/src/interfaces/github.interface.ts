import { GithubRepo } from 'src/constants';

export const IGithubRepository = 'IGithubRepository';

export type GithubPullRequestState = 'OPEN' | 'CLOSED' | 'MERGED';
export type GithubIssueState = 'OPEN' | 'CLOSED';
export type GithubDiscussionState = 'OPEN' | 'CLOSED';

export type GithubLanguagesResponse = {
  totalCount: number;
  totalSize: number;
  languages: Array<{ name: string; size: number }>;
};

export type PullRequestCountsResponse = {
  open: number;
  closed: number;
  merged: number;
  total: number;
};

export type IssuesCountsResponse = {
  open: number;
  closed: number;
  total: number;
};

export type DiscussionsCountsResponse = {
  open: number;
  closed: number;
  total: number;
};

export interface IGithubRepository {
  getPullRequestsCounts(repo: GithubRepo): Promise<PullRequestCountsResponse>;
  getIssuesCounts(repo: GithubRepo): Promise<IssuesCountsResponse>;
  getDiscussionsCounts(repo: GithubRepo): Promise<DiscussionsCountsResponse>;
  getReleasesCount(repo: GithubRepo): Promise<number>;
  getForksCount(repo: GithubRepo): Promise<number>;
  getStarsCount(repo: GithubRepo): Promise<number>;
  getDiskUsage(repo: GithubRepo): Promise<number>;
  getBranchesCount(repo: GithubRepo): Promise<number>;
  getTagsCount(repo: GithubRepo): Promise<number>;
  getCommitsCount(repo: GithubRepo): Promise<number>;
  getWatchersCount(repo: GithubRepo): Promise<number>;
  getLanguages(repo: GithubRepo): Promise<GithubLanguagesResponse>;
}
