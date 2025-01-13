import { createAppAuth } from '@octokit/auth-app';
import { graphql } from '@octokit/graphql';
import { GithubRepo } from 'src/constants';
import { GithubLanguagesResponse, IGithubRepository } from 'src/interfaces/github.interface';

export class GithubRepository implements IGithubRepository {
  private auth;
  private readonly graphqlWithAuth;

  constructor(githubAppId: string, githubPrivateKey: string, githubInstallationId: string) {
    this.auth = createAppAuth({
      appId: githubAppId,
      privateKey: githubPrivateKey,
      installationId: githubInstallationId,
    });

    this.graphqlWithAuth = graphql.defaults({
      request: {
        hook: this.auth.hook,
      },
    });
  }

  async getPullRequestsCounts(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        total: {
          totalCount: number;
        };
        open: {
          totalCount: number;
        };
        closed: {
          totalCount: number;
        };
        merged: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            total: pullRequests {
              totalCount
            }
            open: pullRequests(states: [OPEN]) {
              totalCount
            }
            closed: pullRequests(states: [CLOSED]) {
              totalCount
            }
            merged: pullRequests(states: [MERGED]) {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return {
      total: repository.total.totalCount,
      open: repository.open.totalCount,
      closed: repository.closed.totalCount,
      merged: repository.merged.totalCount,
    };
  }

  async getIssuesCounts(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        total: {
          totalCount: number;
        };
        open: {
          totalCount: number;
        };
        closed: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            total: issues {
              totalCount
            }
            open: issues(states: [OPEN]) {
              totalCount
            }
            closed: issues(states: [CLOSED]) {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return {
      total: repository.total.totalCount,
      open: repository.open.totalCount,
      closed: repository.closed.totalCount,
    };
  }

  async getDiscussionsCounts(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        total: {
          totalCount: number;
        };
        open: {
          totalCount: number;
        };
        closed: {
          totalCount: number;
        };
        answered: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            total: discussions {
              totalCount
            }
            open: discussions(states: [OPEN]) {
              totalCount
            }
            closed: discussions(states: [CLOSED]) {
              totalCount
            }
            answered: discussions(answered: true) {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return {
      total: repository.total.totalCount,
      open: repository.open.totalCount,
      closed: repository.closed.totalCount,
      answered: repository.answered.totalCount,
    };
  }

  async getReleasesCount(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        releases: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            releases {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.releases.totalCount;
  }

  async getForksCount(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        forkCount: number;
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            forkCount
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.forkCount;
  }

  async getStarsCount(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        stargazers: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            stargazers {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.stargazers.totalCount;
  }

  async getDiskUsage(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        diskUsage: number;
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            diskUsage
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.diskUsage;
  }

  async getBranchesCount(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        branches: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            branches: refs(refsPrefix: "refs/heads/") {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.branches.totalCount;
  }

  async getTagsCount(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        tags: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            tags: refs(refPrefix: "refs/tags/") {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.tags.totalCount;
  }

  async getCommitsCount(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        commits: {
          history: {
            totalCount: number;
          };
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            commits: object(expression: "main") {
              ... on Commit {
                history {
                  totalCount
                }
              }
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.commits.history.totalCount;
  }

  async getWatchersCount(repo: GithubRepo) {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        watchers: {
          totalCount: number;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            watchers {
              totalCount
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return repository.watchers.totalCount;
  }

  async getLanguages(repo: GithubRepo): Promise<GithubLanguagesResponse> {
    const { repository } = await this.graphqlWithAuth<{
      repository: {
        languages: {
          totalCount: number;
          totalSize: number;
          edges: Array<{
            node: {
              name: string;
            };
            size: number;
          }>;
        };
      };
    }>(
      `
        query ($org: String!, $repo: String!) {
          repository(owner: $org, name: $repo) {
            languages(first: 100) {
              totalCount
              totalSize
              edges {
                node {
                  name
                }
                size
              }
            }
          }
        }
      `,
      {
        org: repo.organization,
        repo: repo.name,
      },
    );

    return {
      totalCount: repository.languages.totalCount,
      totalSize: repository.languages.totalSize,
      languages: repository.languages.edges.map(({ node, size }) => ({ name: node.name, size })),
    };
  }
}
