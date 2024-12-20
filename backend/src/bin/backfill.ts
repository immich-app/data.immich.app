import { createAppAuth } from '@octokit/auth-app';
import { graphql } from '@octokit/graphql';
import { DateTime } from 'luxon';
import { InfluxMetricsPushProvider } from 'src/repositories/influx-metrics-provider.repository';
import { MetricsPushRepository } from 'src/repositories/metrics-push.repository';
import { Metric } from '../interfaces/metrics.interface';
import { GithubMetric } from '../workers/ingest-processor.worker';

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

if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_PEM_FILE || !process.env.GITHUB_INSTALLATION_ID) {
  throw new Error('Missing GitHub App credentials');
}

if (!process.env.VMETRICS_WRITE_TOKEN || !process.env.VMETRICS_API_URL || !process.env.VMETRICS_ADMIN_TOKEN) {
  throw new Error('Missing VMetrics API credentials');
}

if (!process.env.ENVIRONMENT) {
  throw new Error('Missing environment');
}

const influxProvider = new InfluxMetricsPushProvider(process.env.VMETRICS_API_URL, process.env.VMETRICS_WRITE_TOKEN);
const metricsRepository = new MetricsPushRepository('', {}, [influxProvider]);

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PEM_FILE,
  installationId: process.env.GITHUB_INSTALLATION_ID,
});

const graphqlWithAuth = graphql.defaults({
  request: {
    hook: auth.hook,
  },
});

const deleteTimeSeries = async (name: string, environment: string) => {
  const url = new URL(`${process.env.VMETRICS_API_URL}/api/v1/admin/tsdb/delete_series`);
  const match = `match[]=${name}{environment='${environment}'}`;
  url.search = new URLSearchParams({ ['match[]']: match }).toString();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.VMETRICS_ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status != 204) {
    throw new Error(`Failed to delete time series ${name}`);
  }
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

    const events: { timestamp: number; type: string; data: GithubIssue }[] = [];

    for (const issue of issues) {
      const { createdAt, closedAt } = issue;
      const created = DateTime.fromISO(createdAt).toMillis();
      const closed = closedAt ? DateTime.fromISO(closedAt).toMillis() : undefined;

      events.push({ timestamp: created, type: 'open', data: issue });
      if (closed) {
        events.push({ timestamp: closed, type: 'closed', data: issue });
      }
    }

    events.sort((a, b) => a.timestamp - b.timestamp);

    console.log(events);

    let opened = 0;
    let closed = 0;

    for (const { timestamp, type } of events) {
      const metric = new GithubMetric('issue');
      if (type === 'open') {
        opened++;
      } else {
        closed++;
      }

      metric
        .withRepository(githubRepo)
        .withUser(data.sender)
        .intField('total', opened)
        .intField('open_total', opened - closed)
        .intField('closed_total', closed)
        .intField('count', type === 'open' ? 1 : -1);
    }

    return [];
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
      const { repository } = await graphqlWithAuth<{
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
      const { repository } = await graphqlWithAuth<{ repository: { issues: Paginated<{ nodes: GithubIssue[] }> } }>(
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
      const { repository } = await graphqlWithAuth<{
        repository: { pullRequests: Paginated<{ nodes: GithubPullRequest[] }> };
      }>(
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
  const [stars] = await Promise.all([
    // service.backfillStars(),
    // service.backfillPullRequests(),
    service.backfillIssues(),
  ]);
  console.log(stars);
};

main();
