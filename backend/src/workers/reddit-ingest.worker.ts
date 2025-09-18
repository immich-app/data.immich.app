import { IMetricsPushRepository, Metric } from 'src/interfaces/metrics.interface';
import { RedditRepository } from 'src/repositories/reddit.repository';

export class RedditIngestWorker {
  private redditRepository = new RedditRepository();

  constructor(
    private metricsRepository: IMetricsPushRepository,
    private envTag: string,
  ) {}

  async fetchAndStoreCurrentMetrics(subreddit: string = 'immich') {
    try {
      const data = await this.redditRepository.getSubredditData(subreddit);

      const metric = new Metric('reddit_subscriber')
        .intField('total', data.subscribers)
        .addTag('environment', this.envTag);

      this.metricsRepository.push(metric);

      return data.subscribers;
    } catch (error) {
      console.error(`Failed to fetch Reddit data for r/${subreddit}:`, error);
      throw error;
    }
  }
}
