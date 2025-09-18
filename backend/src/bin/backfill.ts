import { createAppAuth } from '@octokit/auth-app';
import { graphql } from '@octokit/graphql';
import { DateTime } from 'luxon';
import { GithubRepo, GithubUser } from 'src/constants';
import { InfluxMetricsPushProvider } from 'src/repositories/influx-metrics-provider.repository';
import { MetricsPushRepository } from 'src/repositories/metrics-push.repository';
import { GithubMetric } from 'src/workers/ingest-processor.worker';

type PageInfo = { endCursor: string; hasNextPage: boolean };
type Paginated<T> = T & { pageInfo: PageInfo };
type GithubStarGazer = { starredAt: string; user: { login: string; id: number } };
type TimelineEvent = { actor: GithubUser };
type GithubIssue = {
  createdAt: string;
  closedAt?: string;
  number: number;
  stateReason: 'COMPLETED' | 'NOT_PLANNED' | 'REOPENED';
  author: GithubUser;
  timelineItems: {
    nodes: TimelineEvent[];
  };
};
type GithubPullRequest = {
  createdAt: string;
  closedAt?: string;
  mergedAt?: string;
  number: number;
  state: 'CLOSED' | 'MERGED' | 'OPEN';
  author: GithubUser;
  timelineItems: {
    nodes: TimelineEvent[];
  };
};
type GithubDiscussion = {
  createdAt: string;
  closedAt?: string;
  answerChosenAt?: string;
  answerChosenBy?: GithubUser;
  number: number;
  category: { name: string };
  stateReason: 'RESOLVED' | 'OUTDATED' | 'DUPLICATE' | 'REOPENED';
  author: GithubUser;
};

const immichOrg = 'immich-app';

const compare = (a: DateTime, b: DateTime) => {
  if (a.toMillis() === b.toMillis()) {
    return 0;
  }

  return a < b ? -1 : 1;
};

if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_PEM_FILE || !process.env.GITHUB_INSTALLATION_ID) {
  throw new Error('Missing GitHub App credentials');
}

if (
  !process.env.VMETRICS_DATA_WRITE_TOKEN ||
  !process.env.VMETRICS_DATA_API_URL ||
  !process.env.VMETRICS_DATA_ADMIN_TOKEN
) {
  throw new Error('Missing VMetrics API credentials');
}

if (!process.env.ENVIRONMENT) {
  throw new Error('Missing environment');
}

const env = process.env.ENVIRONMENT;

const influxProvider = new InfluxMetricsPushProvider(
  process.env.VMETRICS_DATA_API_URL,
  process.env.VMETRICS_DATA_WRITE_TOKEN,
);
const metricsRepository = new MetricsPushRepository('immich_data_repository', {}, [influxProvider]);

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

const deleteTimeSeries = async (name_pattern: string, environment: string, repo: GithubRepo) => {
  const url = new URL(`${process.env.VMETRICS_DATA_API_URL}/api/v1/admin/tsdb/delete_series`);
  const match = `{__name__=~'${name_pattern}',environment='${environment}',org_name='${repo.organization}',repository_name='${repo.name}'}`;
  url.search = new URLSearchParams({ ['match[]']: match }).toString();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.VMETRICS_DATA_ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  console.log(`Deleting time series ${match}`);
  if (response.status != 204) {
    console.log(response.status);
    throw new Error(`Failed to delete time series ${match}`);
  }
};

export class BackfillService {
  async backfillStars(repo: GithubRepo) {
    const stargazers = await this.getStargazers(repo);
    console.log(`[${repo.name}] - Loaded ${stargazers.length} stargazers`);
    const deleteTime = DateTime.now();

    const items = stargazers
      .map(({ starredAt, user }) => ({ starredAt: DateTime.fromISO(starredAt), user }))
      .sort((a, b) => compare(a.starredAt, b.starredAt))
      .filter(({ starredAt }) => starredAt < deleteTime);

    let total = 0;

    for (const { starredAt, user } of items) {
      total++;
      const metric = new GithubMetric('star');

      metric
        .withRepository(repo)
        .withUser(user)
        .setTimestamp(starredAt.toJSDate())
        .intField('total', total)
        .intField('count', 1)
        .addTag('environment', env);

      metricsRepository.push(metric);
    }

    await deleteTimeSeries('immich_data_repository_star_.*', env, repo);
    await influxProvider.flush();

    console.log(`[${repo.name}] - Flushed ${total} stars`);
  }

  async backfillIssues(repo: GithubRepo) {
    const issues = await this.getIssues(repo);
    console.log(`[${repo.name}] - Loaded ${issues.length} issues`);

    await deleteTimeSeries('immich_data_repository_issue_.*', env, repo);
    const deleteTime = DateTime.now();

    const events: { timestamp: Date; type: string; data: GithubIssue }[] = [];

    for (const issue of issues) {
      const { createdAt, closedAt } = issue;
      const created = DateTime.fromISO(createdAt);
      const closed = closedAt ? DateTime.fromISO(closedAt) : undefined;

      if (created > deleteTime) {
        continue;
      }
      events.push({ timestamp: created.toJSDate(), type: 'open', data: issue });
      if (closed && closed < deleteTime) {
        events.push({ timestamp: closed.toJSDate(), type: 'closed', data: issue });
      }
    }

    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let opened = 0;
    let closed = 0;

    let count = 0;

    for (const {
      timestamp,
      type,
      data: { author, timelineItems },
    } of events) {
      count++;
      const metric = new GithubMetric('issue');
      if (type === 'open') {
        opened++;
      } else {
        closed++;
      }

      metric
        .withRepository(repo)
        .withUser(type === 'open' ? author : timelineItems.nodes[0].actor)
        .setTimestamp(timestamp)
        .intField('total', opened)
        .intField('open_total', opened - closed)
        .intField('closed_total', closed)
        .intField('count', type === 'open' ? 1 : -1)
        .addTag('environment', env);

      metricsRepository.push(metric);
    }

    await influxProvider.flush();
    console.log(`[${repo.name}] - Flushed ${count} issues`);
  }

  async backfillDiscussions(repo: GithubRepo) {
    const discussions = await this.getDiscussions(repo);
    console.log(`[${repo.name}] - Loaded ${discussions.length} discussions`);

    await deleteTimeSeries('immich_data_repository_discussion_.*', env, repo);
    const deleteTime = DateTime.now();

    const events: { timestamp: Date; type: string; data: GithubDiscussion }[] = [];

    for (const discussion of discussions) {
      const { createdAt, closedAt, answerChosenAt } = discussion;
      const created = DateTime.fromISO(createdAt);
      const closed = closedAt ? DateTime.fromISO(closedAt) : undefined;
      const answered = answerChosenAt ? DateTime.fromISO(answerChosenAt) : undefined;

      if (created > deleteTime) {
        continue;
      }
      events.push({ timestamp: created.toJSDate(), type: 'open', data: discussion });
      if (closed && closed < deleteTime) {
        events.push({ timestamp: closed.toJSDate(), type: 'closed', data: discussion });
      }
      if (answered && answered < deleteTime) {
        events.push({ timestamp: answered.toJSDate(), type: 'answered', data: discussion });
      }
    }

    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let opened = 0;
    let closed = 0;
    let answered = 0;
    let count = 0;

    for (const {
      timestamp,
      type,
      data: { author, answerChosenBy },
    } of events) {
      count++;
      const metric = new GithubMetric('discussion');
      if (type === 'open') {
        opened++;
      } else if (type === 'closed') {
        closed++;
      } else if (type === 'answered') {
        answered++;
      }

      metric
        .withRepository(repo)
        .withUser(type === 'answered' ? answerChosenBy : author)
        .setTimestamp(timestamp)
        .intField('total', opened)
        .intField('open_total', opened - closed)
        .intField('closed_total', closed)
        .intField('answered_total', answered)
        .intField('count', type === 'open' ? 1 : -1)
        .addTag('environment', env);

      metricsRepository.push(metric);
    }

    await influxProvider.flush();
    console.log(`[${repo.name}] - Flushed ${count} discussions`);
  }

  async backfillPullRequests(repo: GithubRepo) {
    const pullRequests = await this.getPullRequests(repo);
    console.log(`[${repo.name}] - Loaded ${pullRequests.length} pull requests`);

    await deleteTimeSeries('immich_data_repository_pull_request_.*', env, repo);
    const deleteTime = DateTime.now();

    const events: { timestamp: Date; type: string; data: GithubPullRequest }[] = [];

    for (const pullRequest of pullRequests) {
      const { createdAt, closedAt, mergedAt } = pullRequest;
      const created = DateTime.fromISO(createdAt);
      const closed = closedAt ? DateTime.fromISO(closedAt) : undefined;
      const merged = mergedAt ? DateTime.fromISO(mergedAt) : undefined;

      if (created > deleteTime) {
        continue;
      }
      events.push({ timestamp: created.toJSDate(), type: 'open', data: pullRequest });
      if (closed && !merged && closed < deleteTime) {
        events.push({ timestamp: closed.toJSDate(), type: 'closed', data: pullRequest });
      }
      if (merged && merged < deleteTime) {
        events.push({ timestamp: merged.toJSDate(), type: 'merged', data: pullRequest });
      }
    }

    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let opened = 0;
    let closed = 0;
    let merged = 0;
    let count = 0;

    for (const {
      timestamp,
      type,
      data: { author, timelineItems },
    } of events) {
      count++;
      const metric = new GithubMetric('pull_request');
      if (type === 'open') {
        opened++;
      } else if (type === 'closed') {
        closed++;
      } else if (type === 'merged') {
        merged++;
      }

      metric
        .withRepository(repo)
        .withUser(type === 'open' ? author : timelineItems.nodes[0].actor)
        .setTimestamp(timestamp)
        .intField('total', opened)
        .intField('open_total', opened - closed - merged)
        .intField('closed_total', closed)
        .intField('merged_total', merged)
        .intField('count', type === 'open' ? 1 : -1)
        .addTag('environment', env);

      metricsRepository.push(metric);
    }

    await influxProvider.flush();
    console.log(`[${repo.name}] - Flushed ${count} pull requests`);
  }

  async getStargazers(repo: GithubRepo) {
    const results: GithubStarGazer[] = [];
    let cursor: string | undefined;
    const org = repo.organization;

    console.log(`[${repo.name}] - Fetching stargazers`);

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
                  user: node {
                    login
                    id: databaseId
                  }
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
          repo: repo.name,
          take: 100,
          cursor,
        },
      );

      results.push(...repository.stargazers.edges);
      if (results.length % 1000 === 0) {
        console.log(`[${repo.name}] - Progress: ${results.length.toLocaleString()} stargazers`);
      }

      const { hasNextPage, endCursor } = repository.stargazers.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results;
  }

  async getIssues(repo: GithubRepo) {
    const results: GithubIssue[] = [];
    let cursor: string | undefined;
    const org = repo.organization;

    console.log(`[${repo.name}] - Fetching issues`);

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
                  author {
                    login
                    ... on User {
                      id: databaseId
                    }
                    ... on Bot {
                      id: databaseId
                    }
                  }
                  timelineItems(itemTypes:[CLOSED_EVENT, CONVERTED_TO_DISCUSSION_EVENT], last: 1){
                    nodes {
                      ... on ClosedEvent {
                        actor {
                          login
                          ... on User {
                            id: databaseId
                          }
                          ... on Bot {
                            id: databaseId
                          }
                        }
                      }
                      ... on ConvertedToDiscussionEvent {
                        actor {
                          login
                          ... on User {
                            id: databaseId
                          }
                          ... on Bot {
                            id: databaseId
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        {
          org,
          repo: repo.name,
          take: 100,
          cursor,
        },
      );

      results.push(...repository.issues.nodes);
      if (results.length % 1000 === 0) {
        console.log(`[${repo.name}] - Progress: ${results.length.toLocaleString()} issues`);
      }

      const { hasNextPage, endCursor } = repository.issues.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results;
  }

  async getPullRequests(repo: GithubRepo) {
    const results: GithubPullRequest[] = [];
    let cursor: string | undefined;
    const org = repo.organization;

    console.log(`[${repo.name}] - Fetching pull requests`);

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
                  mergedAt
                  number
                  state
                  author {
                    login
                    ... on User {
                      id: databaseId
                    }
                    ... on Bot {
                      id: databaseId
                    }
                  }
                  timelineItems(itemTypes: [CLOSED_EVENT, MERGED_EVENT], last: 1) {
                    nodes {
                      ... on ClosedEvent {
                        actor {
                          login
                          ... on User {
                            id: databaseId
                          }
                          ... on Bot {
                            id: databaseId
                          }
                        }
                      }
                      ... on MergedEvent {
                        actor {
                          login
                          ... on User {
                            id: databaseId
                          }
                          ... on Bot {
                            id: databaseId
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        {
          org,
          repo: repo.name,
          take: 100,
          cursor,
        },
      );

      results.push(...repository.pullRequests.nodes);
      if (results.length % 1000 === 0) {
        console.log(`[${repo.name}] - Progress: ${results.length.toLocaleString()} pull requests`);
      }

      const { hasNextPage, endCursor } = repository.pullRequests.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results;
  }

  async getDiscussions(repo: GithubRepo) {
    const results: GithubDiscussion[] = [];
    let cursor: string | undefined;
    const org = repo.organization;

    console.log(`[${repo.name}] - Fetching discussions`);

    do {
      const { repository } = await graphqlWithAuth<{
        repository: { discussions: Paginated<{ nodes: GithubDiscussion[] }> };
      }>(
        `
          query ($org: String!, $repo: String!, $take: Int!, $cursor: String) {
            repository(owner: $org, name: $repo) {
              discussions(first: $take, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  createdAt
                  closedAt
                  answerChosenAt
                  answerChosenBy {
                    login
                    ... on User {
                      id: databaseId
                    }
                    ... on Bot {
                      id: databaseId
                    }
                  }
                  number
                  category {
                    name
                  }
                  stateReason
                  author {
                    login
                    ... on User {
                      id: databaseId
                    }
                    ... on Bot {
                      id: databaseId
                    }
                  }
                }
              }
            }
          }
        `,
        {
          org,
          repo: repo.name,
          take: 100,
          cursor,
        },
      );

      results.push(...repository.discussions.nodes);
      if (results.length % 1000 === 0) {
        console.log(`[${repo.name}] - Progress: ${results.length.toLocaleString()} discussions`);
      }

      const { hasNextPage, endCursor } = repository.discussions.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results;
  }

  async getGithubReposForOrg(org: string): Promise<GithubRepo[]> {
    const results: { name: string }[] = [];
    let cursor: string | undefined;

    console.log(`Fetching repositories for ${org}`);

    do {
      const { organization } = await graphqlWithAuth<{
        organization: { repositories: Paginated<{ nodes: { name: string }[] }> };
      }>(
        `
          query ($org: String!, $take: Int!, $cursor: String) {
            organization(login: $org) {
              repositories(first: $take, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  name
                }
              }
            }
          }
        `,
        {
          org,
          take: 100,
          cursor,
        },
      );

      results.push(...organization.repositories.nodes);
      if (results.length % 1000 === 0) {
        console.log(`Progress: ${results.length.toLocaleString()} discussions`);
      }

      const { hasNextPage, endCursor } = organization.repositories.pageInfo;
      cursor = hasNextPage ? endCursor : undefined;
    } while (cursor);

    return results.map(({ name }) => ({
      organization: org,
      name,
    }));
  }
}

const main = async () => {
  const service = new BackfillService();
  const repos = await service.getGithubReposForOrg(immichOrg);
  const promises: Promise<unknown>[] = [];
  for (const repo of repos) {
    promises.push(
      ...[
        service.backfillStars(repo),
        service.backfillPullRequests(repo),
        service.backfillIssues(repo),
        service.backfillDiscussions(repo),
      ],
    );
  }
  await Promise.all(promises);
};

main()
  .then(() => console.log('Done'))
  .catch(console.error);
