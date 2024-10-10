import { IMetricsRepository } from 'src/interfaces/metrics.interface';
import { QueueItem } from 'src/interfaces/queue.interface';

export class IngestProcessorWorker {
  constructor(private metricsRepository: IMetricsRepository) {}

  async process(batch: MessageBatch<QueueItem>) {
    console.log(`Received ${batch.messages.length} messages`);
    // await this.metricsRepository.push({} as any);
  }
}
