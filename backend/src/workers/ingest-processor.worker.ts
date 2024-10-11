import { Repository, User } from '@octokit/webhooks-types';
import { IMetricsRepository, Metric } from 'src/interfaces/metrics.interface';
import { QueueItem } from 'src/interfaces/queue.interface';

class GithubMetric extends Metric {
  withUser(user: User) {
    return this.addTag('username', user.login).addTag('user_id', user.id.toString());
  }

  withRepository(repository: Repository) {
    return this.addTag('repository_name', repository.full_name).addTag('repository_id', repository.id.toString());
  }
}

export class IngestProcessorWorker {
  constructor(
    private metricsRepository: IMetricsRepository,
    private envTag: string,
  ) {}

  async handleMessages(batch: MessageBatch<QueueItem>) {
    for (const message of batch.messages) {
      this.handleMessage(message);
    }
  }

  private handleMessage(message: Message<QueueItem>) {
    const metrics = {
      star: new GithubMetric('immich_data_repository_star'),
      issue: new GithubMetric('immich_data_repository_issue'),
      pullRequest: new GithubMetric('immich_data_repository_pull_request'),
      discussion: new GithubMetric('immich_data_repository_discussion'),
    };

    const { type, data } = message.body;

    switch (type) {
      case 'RepositoryStarCreatedV1': {
        metrics.star
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('total', data.repository.stargazers_count)
          .intField('count', 1);

        break;
      }

      case 'RepositoryStarDeletedV1': {
        metrics.star
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('total', data.repository.stargazers_count)
          .intField('count', -1);
        break;
      }

      case 'RepositoryIssueOpenedV1': {
        metrics.issue
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('total', data.repository.open_issues_count)
          .intField('count', 1);
        break;
      }

      case 'RepositoryIssueClosedV1': {
        metrics.issue

          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('total', data.repository.open_issues_count)
          .intField('count', -1);
        break;
      }

      case 'RepositoryIssueReopenedV1': {
        metrics.issue
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('total', data.repository.open_issues_count)
          .intField('count', 1);
        break;
      }

      case 'RepositoryPullRequestOpenedV1': {
        metrics.pullRequest
          //
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('count', 1);
        break;
      }

      case 'RepositoryPullRequestClosedV1': {
        metrics.pullRequest
          //
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('count', -1);
        break;
      }

      case 'RepositoryPullRequestReopenedV1': {
        metrics.pullRequest
          //
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('count', 1);
        break;
      }

      case 'RepositoryDiscussionCreatedV1': {
        metrics.discussion
          //
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('count', 1);
        break;
      }

      case 'RepositoryDiscussionClosedV1': {
        metrics.discussion
          //
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('count', -1);
        break;
      }

      case 'RepositoryDiscussionReopenedV1': {
        metrics.discussion
          //
          .withRepository(data.repository)
          .withUser(data.sender)
          .intField('count', 1);
        break;
      }
    }

    for (const metric of Object.values(metrics)) {
      this.metricsRepository.push(metric.addTag('environment', this.envTag));
    }
  }
}
