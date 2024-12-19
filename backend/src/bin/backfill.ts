import { graphql } from '@octokit/graphql';
import { DateTime } from 'luxon';

const GITHUB_PAT = '';

type PageInfo = { endCursor: string; hasNextPage: boolean };
type Paginated<T> = T & { pageInfo: PageInfo };
type GithubStarGazer = { starredAt: string };
type GithubIssue = {
  createdAt: string;
  closedAt?: string;
  number: number;
  stateReason: 'COMPLETED' | 'NOT_PLANNED' | 'REOPENED';
};
type GithubPullRequest = {
  createdAt: string;
  closedAt?: string;
  number: number;
  additions: number;
  deletions: number;
  state: 'CLOSED' | 'MERGED' | 'OPEN';
};

const immichOrg = 'immich-app';
const immichRepo = 'immich';

const compare = (a: DateTime, b: DateTime) => {
  if (a.toMillis() === b.toMillis()) {
    return 0;
  }

  return a < b ? -1 : 1;
};

export class BackfillService {
  async backfillStars() {
    const stargazers = await this.getStargazers(immichOrg, immichRepo);
    console.log(`Loaded ${stargazers.length} stargazers`);

    const days: Record<string, { timestamp: number; delta: number; total: number }> = {};
    const items = stargazers
      .map(({ starredAt }) => ({ starredAt: DateTime.fromISO(starredAt) }))
      .sort((a, b) => compare(a.starredAt, b.starredAt));

    let total = 0;

    for (const { starredAt } of items) {
      const key = starredAt.toFormat('yyyy-LL-dd');
      if (!days[key]) {
        days[key] = {
          timestamp: starredAt.startOf('day').toUnixInteger(),
          delta: 0,
          total,
        };
      }

      days[key].delta++;
      days[key].total = ++total;
    }

    return Object.values(days).map(({ timestamp, total }) => [timestamp, total]);
  }

  async backfillIssues() {
    const issues = await this.getIssues(immichOrg, immichRepo);
    console.log(`Loaded ${issues.length} issues`);
    const days: Record<string, { timestamp: number; closed: number; open: number }> = {};

    const increment = (date: DateTime, type: 'open' | 'closed') => {
      const key = date.toFormat('yyyy-LL-dd');
      if (!days[key]) {
        days[key] = {
          timestamp: date.startOf('day').toUnixInteger(),
          open: 0,
          closed: 0,
        };
      }

      days[key][type]++;
    };

    for (const { createdAt, closedAt } of issues) {
      increment(DateTime.fromISO(createdAt), 'open');
      if (closedAt) {
        increment(DateTime.fromISO(closedAt), 'closed');
      }
    }

    let open = 0;
    let closed = 0;

    return [
      ...Object.keys(days)
        .sort()
        .map((key) => {
          const { timestamp, open: dailyOpen, closed: dailyClosed } = days[key];
          open += dailyOpen;
          closed += dailyClosed;

          return [timestamp, open - closed];
        }),
    ];
  }

  async backfillPullRequests() {
    const pullRequests = await this.getPullRequests(immichOrg, immichRepo);
    console.log(`Loaded ${pullRequests.length} pull requests`);
    const days: Record<string, { timestamp: number; closed: number; open: number }> = {};

    const increment = (date: DateTime, type: 'open' | 'closed') => {
      const key = date.toFormat('yyyy-LL-dd');
      if (!days[key]) {
        days[key] = {
          timestamp: date.startOf('day').toUnixInteger(),
          open: 0,
          closed: 0,
        };
      }

      days[key][type]++;
    };

    for (const { createdAt, closedAt } of pullRequests) {
      increment(DateTime.fromISO(createdAt), 'open');
      if (closedAt) {
        increment(DateTime.fromISO(closedAt), 'closed');
      }
    }

    let open = 0;
    let closed = 0;

    return [
      ...Object.keys(days)
        .sort()
        .map((key) => {
          const { timestamp, open: dailyOpen, closed: dailyClosed } = days[key];
          open += dailyOpen;
          closed += dailyClosed;

          return [timestamp, open - closed];
        }),
    ];
  }

  async getStargazers(org: string, repo: string) {
    const results: GithubStarGazer[] = [];
    let cursor: string | undefined;

    console.log(`Fetching stargazers for ${org}/${repo}`);

    do {
      const { repository } = await graphql<{
        repository: {
          stargazers: Paginated<{ edges: GithubStarGazer[] }>;
        };
      }>(
        `
          query ($org: String!, $repo: String!, $take: Int!, $cursor: String) {
            repository(owner: $org, name: $repo) {
              stargazers(first: $take, after: $cursor, orderBy: { field: STARRED_AT, direction: ASC }) {
                edges {
                  starredAt
                }
                pageInfo {
                  endCursor
                  hasNextPage
                }
              }
            }
          }
        `,
        {
          org,
          repo,
          take: 100,
          cursor,
          headers: {
            authorization: `token ${GITHUB_PAT}`,
          },
        },
      );

      results.push(...repository.stargazers.edges);
      if (results.length % 1000 === 0) {
        console.log(`Progress: ${results.length.toLocaleString()} stargazers`);
      }

      const { hasNextPage, endCursor } = repository.stargazers.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results;
  }

  async getIssues(org: string, repo: string) {
    const results: GithubIssue[] = [];
    let cursor: string | undefined;

    console.log(`Fetching issues for ${org}/${repo}`);

    do {
      const { repository } = await graphql<{ repository: { issues: Paginated<{ nodes: GithubIssue[] }> } }>(
        `
          query ($org: String!, $repo: String!, $take: Int!, $cursor: String) {
            repository(owner: $org, name: $repo) {
              issues(first: $take, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  createdAt
                  closedAt
                  number
                  stateReason
                }
              }
            }
          }
        `,
        {
          org,
          repo,
          take: 100,
          cursor,
          headers: {
            authorization: `token ${GITHUB_PAT}`,
          },
        },
      );

      results.push(...repository.issues.nodes);
      if (results.length % 1000 === 0) {
        console.log(`Progress: ${results.length.toLocaleString()} issues`);
      }

      const { hasNextPage, endCursor } = repository.issues.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results;
  }

  async getPullRequests(org: string, repo: string) {
    const results: GithubPullRequest[] = [];
    let cursor: string | undefined;

    console.log(`Fetching pull requests for ${org}/${repo}`);

    do {
      const { repository } = await graphql<{ repository: { pullRequests: Paginated<{ nodes: GithubPullRequest[] }> } }>(
        `
          query ($org: String!, $repo: String!, $take: Int!, $cursor: String) {
            repository(owner: $org, name: $repo) {
              pullRequests(first: $take, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  createdAt
                  closedAt
                  number
                  additions
                  deletions
                  state
                }
              }
            }
          }
        `,
        {
          org,
          repo,
          take: 100,
          cursor,
          headers: {
            authorization: `token ${GITHUB_PAT}`,
          },
        },
      );

      results.push(...repository.pullRequests.nodes);
      if (results.length % 1000 === 0) {
        console.log(`Progress: ${results.length.toLocaleString()} pull requests`);
      }

      const { hasNextPage, endCursor } = repository.pullRequests.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results;
  }
}

const main = async () => {
  const service = new BackfillService();
  const [stars, pullRequests, issues] = await Promise.all([
    service.backfillStars(),
    service.backfillPullRequests(),
    service.backfillIssues(),
  ]);
  // console.log(JSON.stringify({ stars, pullRequests, issues }, null, 4));
};

main();
