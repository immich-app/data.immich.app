import {
  DiscussionCreatedEvent,
  DiscussionEvent,
  IssuesClosedEvent,
  IssuesEvent,
  IssuesOpenedEvent,
  IssuesReopenedEvent,
  PullRequestClosedEvent,
  PullRequestEvent,
  PullRequestOpenedEvent,
  PullRequestReopenedEvent,
  StarCreatedEvent,
  StarDeletedEvent,
  StarEvent,
} from '@octokit/webhooks-types';
import { IQueueRepository, QueueEvent, QueueItem } from 'src/interfaces/queue.interface';
import { DiscussionClosedEvent, DiscussionReopenedEvent, GithubWebhookEvent as Event } from 'src/types';

const isStarCreated = (event: Event): event is StarCreatedEvent => 'starred_at' in event && event.action === 'created';
const isStarDeleted = (event: Event): event is StarDeletedEvent => 'starred_at' in event && event.action === 'deleted';
const asStarId = (event: StarEvent) =>
  `${event.repository.full_name}-${event.sender.login}-${event.action}-${event.starred_at ?? Date.now()}`;

const isIssueOpened = (event: Event): event is IssuesOpenedEvent => 'issue' in event && event.action === 'opened';
const isIssueClosed = (event: Event): event is IssuesClosedEvent => 'issue' in event && event.action === 'closed';
const isIssueReopened = (event: Event): event is IssuesReopenedEvent => 'issue' in event && event.action === 'reopened';
const asIssueId = (event: IssuesEvent) =>
  `${event.repository.full_name}-${event.issue.number}-${event.action}-${event.issue.updated_at}`;

const isPullRequestOpened = (event: Event): event is PullRequestOpenedEvent =>
  'pull_request' in event && event.action === 'opened';
const isPullRequestClosed = (event: Event): event is PullRequestClosedEvent =>
  'pull_request' in event && event.action === 'closed';
const isPullRequestReopened = (event: Event): event is PullRequestReopenedEvent =>
  'pull_request' in event && event.action === 'reopened';
const asPullRequestId = (event: PullRequestEvent) =>
  `${event.repository.full_name}-${event.pull_request.number}-${event.action}-${event.pull_request.updated_at}`;

const isDiscussionCreated = (event: Event): event is DiscussionCreatedEvent =>
  'discussion' in event && event.action === 'created';
const isDiscussionClosed = (event: Event): event is DiscussionClosedEvent =>
  'discussion' in event && event.action === 'closed';
const isDiscussionReopened = (event: Event): event is DiscussionReopenedEvent =>
  'discussion' in event && event.action === 'reopened';
const asDiscussionId = (event: DiscussionEvent | DiscussionClosedEvent | DiscussionReopenedEvent) =>
  `${event.repository.full_name}-${event.discussion.number}-${event.action}-${event.discussion.updated_at}`;

export class IngestApiWorker {
  constructor(private queueRepository: IQueueRepository) {}

  async onGithubEvent(event: Event) {
    if (isStarCreated(event)) {
      return this.push(asStarId(event), 'RepositoryStarCreatedV1', event);
    }

    if (isStarDeleted(event)) {
      return this.push(asStarId(event), 'RepositoryStarDeletedV1', event);
    }

    if (isIssueOpened(event)) {
      return this.push(asIssueId(event), 'RepositoryIssueOpenedV1', event);
    }

    if (isIssueClosed(event)) {
      return this.push(asIssueId(event), 'RepositoryIssueClosedV1', event);
    }

    if (isIssueReopened(event)) {
      return this.push(asIssueId(event), 'RepositoryIssueReopenedV1', event);
    }

    if (isPullRequestOpened(event)) {
      return this.push(asPullRequestId(event), 'RepositoryPullRequestOpenedV1', event);
    }

    if (isPullRequestClosed(event)) {
      return this.push(asPullRequestId(event), 'RepositoryPullRequestClosedV1', event);
    }

    if (isPullRequestReopened(event)) {
      return this.push(asPullRequestId(event), 'RepositoryPullRequestReopenedV1', event);
    }

    if (isDiscussionCreated(event)) {
      return this.push(asDiscussionId(event), 'RepositoryDiscussionCreatedV1', event);
    }

    if (isDiscussionClosed(event)) {
      return this.push(asDiscussionId(event), 'RepositoryDiscussionClosedV1', event);
    }

    if (isDiscussionReopened(event)) {
      return this.push(asDiscussionId(event), 'RepositoryDiscussionReopenedV1', event);
    }
  }

  private async push<T extends QueueEvent>(id: string, type: T, data: QueueItem<T>['data']) {
    await this.queueRepository.push({ id, type, source: 'ingest-api-worker', data });
  }
}
