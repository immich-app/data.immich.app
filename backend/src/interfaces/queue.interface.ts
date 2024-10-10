import {
  DiscussionCreatedEvent,
  IssuesClosedEvent,
  IssuesOpenedEvent,
  IssuesReopenedEvent,
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
  PullRequestReopenedEvent,
  StarCreatedEvent,
  StarDeletedEvent,
} from '@octokit/webhooks-types';
import { DiscussionClosedEvent, DiscussionReopenedEvent } from 'src/types';

export enum EventType {
  GITHUB_STAR_CREATED = 'github.starCreated',
}

type QueueEventMap = {
  RepositoryStarCreatedV1: StarCreatedEvent;
  RepositoryStarDeletedV1: StarDeletedEvent;
  RepositoryIssueOpenedV1: IssuesOpenedEvent;
  RepositoryIssueClosedV1: IssuesClosedEvent;
  RepositoryIssueReopenedV1: IssuesReopenedEvent;
  RepositoryPullRequestOpenedV1: PullRequestOpenedEvent;
  RepositoryPullRequestClosedV1: PullRequestClosedEvent;
  RepositoryPullRequestReopenedV1: PullRequestReopenedEvent;
  RepositoryDiscussionCreatedV1: DiscussionCreatedEvent;
  RepositoryDiscussionClosedV1: DiscussionClosedEvent;
  RepositoryDiscussionReopenedV1: DiscussionReopenedEvent;
};

export type QueueEvent = keyof QueueEventMap;

export type QueueItem<T extends QueueEvent = QueueEvent> = {
  id: string;
  source: string;
  type: T;
  data: QueueEventMap[T];
};

export interface IQueueRepository {
  push<T extends QueueEvent>(item: QueueItem<T>): Promise<void>;
}
