import { IQueueRepository, QueueItem } from 'src/interfaces/queue.interface';

export class CloudflareQueueRepository implements IQueueRepository {
  constructor(private queue: Queue) {}

  async push(item: QueueItem) {
    await this.queue.send(item);
  }
}
