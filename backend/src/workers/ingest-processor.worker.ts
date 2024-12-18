import { User } from '@octokit/webhooks-types';
import { GithubRepo } from 'src/constants';
import { IGithubRepository } from 'src/interfaces/github.interface';
import { IMetricsRepository, Metric } from 'src/interfaces/metrics.interface';
import { QueueItem } from 'src/interfaces/queue.interface';

class GithubMetric extends Metric {
  withUser(user: User) {
    return this.addTag('username', user.login).addTag('user_id', user.id.toString());
  }

  withRepository(repo: GithubRepo) {
    return this.addTag('org_name', repo.organization).addTag('repository_name', repo.name);
  }
}

export class IngestProcessorWorker {
  constructor(
    private metricsRepository: IMetricsRepository,
    private githubRepository: IGithubRepository,
    private envTag: string,
  ) {}

  async handleMessages(batch: MessageBatch<QueueItem>) {
    const promises = batch.messages.map((message) => this.handleMessage(message));
    await Promise.all(promises);
  }

  private async handleMessage(message: Message<QueueItem>) {
    const metrics = {
      star: new GithubMetric('immich_data_repository_star'),
      issue: new GithubMetric('immich_data_repository_issue'),
      pullRequest: new GithubMetric('immich_data_repository_pull_request'),
      discussion: new GithubMetric('immich_data_repository_discussion'),
    };

    const { type, data } = message.body;
    const githubRepo: GithubRepo = { name: data.repository.name, organization: data.repository.owner.login };

    const issueMetric = async (count: number) => {
      const issueCount = await this.githubRepository.getIssuesCounts(githubRepo);

      metrics.issue
        .withRepository(githubRepo)
        .withUser(data.sender)
        .intField('total', issueCount.total)
        .intField('open_total', issueCount.open)
        .intField('closed_total', issueCount.closed)
        .intField('count', count);
    };

    const prMetric = async (count: number) => {
      const prCount = await this.githubRepository.getPullRequestsCounts(githubRepo);

      metrics.pullRequest
        .withRepository(githubRepo)
        .withUser(data.sender)
        .intField('total', prCount.total)
        .intField('open_total', prCount.open)
        .intField('closed_total', prCount.closed)
        .intField('merged_total', prCount.merged)
        .intField('count', count);
    };

    const discussionMetric = async (count: number) => {
      const discussionCount = await this.githubRepository.getDiscussionsCounts(githubRepo);

      metrics.discussion
        .withRepository(githubRepo)
        .withUser(data.sender)
        .intField('total', discussionCount.total)
        .intField('open_total', discussionCount.open)
        .intField('closed_total', discussionCount.closed)
        .intField('count', count);
    };

    switch (type) {
      case 'RepositoryStarCreatedV1': {
        metrics.star
          .withRepository(githubRepo)
          .withUser(data.sender)
          .intField('total', data.repository.stargazers_count)
          .intField('count', 1);
        break;
      }

      case 'RepositoryStarDeletedV1': {
        metrics.star
          .withRepository(githubRepo)
          .withUser(data.sender)
          .intField('total', data.repository.stargazers_count)
          .intField('count', -1);
        break;
      }

      case 'RepositoryIssueOpenedV1':
      case 'RepositoryIssueReopenedV1': {
        await issueMetric(1);
        break;
      }

      case 'RepositoryIssueClosedV1': {
        await issueMetric(-1);
        break;
      }

      case 'RepositoryPullRequestOpenedV1':
      case 'RepositoryPullRequestReopenedV1': {
        await prMetric(1);
        break;
      }

      case 'RepositoryPullRequestClosedV1': {
        await prMetric(-1);
        break;
      }

      case 'RepositoryDiscussionCreatedV1':
      case 'RepositoryDiscussionReopenedV1': {
        await discussionMetric(1);
        break;
      }

      case 'RepositoryDiscussionClosedV1': {
        await discussionMetric(-1);
        break;
      }
    }

    for (const metric of Object.values(metrics)) {
      this.metricsRepository.push(metric.addTag('environment', this.envTag));
    }
  }
}
