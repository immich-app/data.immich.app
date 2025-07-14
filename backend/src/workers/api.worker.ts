import { DateTime } from 'luxon';
import { IMMICH_INCEPTION } from 'src/constants';
import { IMetricsQueryRepository } from 'src/interfaces/query-metrics.interface';

export class ApiWorker {
  constructor(private metricsRepository: IMetricsQueryRepository) {}

  async getGithubData() {
    return this.asTimeSeries({
      issues: { metricName: 'immich_data_repository_issue_open_total' },
      pullRequests: { metricName: 'immich_data_repository_pull_request_open_total' },
      stars: { metricName: 'immich_data_repository_star_total' },
      discussions: { metricName: 'immich_data_repository_discussion_total' },
      mergedPullRequests: { metricName: 'immich_data_repository_pull_request_merged_total' },
    });
  }

  async getRedditData() {
    return this.asTimeSeries({
      subscribers: { metricName: 'immich_data_repository_reddit_subscriber_total' },
    });
  }

  async asTimeSeries(metrics: Record<string, { metricName: string }>) {
    const promises = Object.entries(metrics).map(async ([key, value]) => {
      const results = await this.metricsRepository.queryMaxOverTime({
        metricName: value.metricName,
        start: IMMICH_INCEPTION.toMillis(),
        end: DateTime.now().toMillis(),
        step: '1d',
      });
      return [key, results[0]?.values ?? []];
    });

    return Object.fromEntries(await Promise.all(promises));
  }
}
