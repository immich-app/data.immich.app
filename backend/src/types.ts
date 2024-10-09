import { DiscussionCreatedEvent, DiscussionDeletedEvent, WebhookEvent } from '@octokit/webhooks-types';

export type AsyncFn = (...args: any[]) => Promise<any>;
export type Class = { new (...args: any[]): any };
export type Operation = { name: string; tags?: { [key: string]: string } };
export type Options = { monitorInvocations?: boolean; acceptedErrors?: Class[] };
export type GithubWebhookEvent = WebhookEvent | DiscussionClosedEvent | DiscussionReopenedEvent;
export type DiscussionClosedEvent = Omit<DiscussionDeletedEvent, 'action'> & { action: 'closed' };
export type DiscussionReopenedEvent = Omit<DiscussionCreatedEvent, 'action'> & { action: 'reopened' };
