import { DateTime } from 'luxon';
import { IMMICH_INCEPTION } from 'src/constants';
import { IMetricsQueryRepository } from 'src/interfaces/query-metrics.interface';

export class ApiWorker {
  constructor(private metricsRepository: IMetricsQueryRepository) {}

  async getGithubData() {
    const labels = ['repository_name="immich"'];
    return this.asTimeSeries({
      issues: { metricName: 'immich_data_repository_issue_open_total', labels },
      pullRequests: { metricName: 'immich_data_repository_pull_request_open_total', labels },
      stars: { metricName: 'immich_data_repository_star_total', labels },
      discussions: { metricName: 'immich_data_repository_discussion_total', labels },
      mergedPullRequests: { metricName: 'immich_data_repository_pull_request_merged_total', labels },
    });
  }

  async getRedditData() {
    return this.asTimeSeries({
      subscribers: { metricName: 'immich_data_repository_reddit_subscriber_total', labels: [] },
    });
  }

  async getDiscordData() {
    return this.asTimeSeries({
      members: { metricName: 'immich_data_repository_discord_member_total', labels: [] },
    });
  }

  async asTimeSeries(metrics: Record<string, { metricName: string; labels: string[] }>) {
    const promises = Object.entries(metrics).map(async ([key, value]) => {
      const results = await this.metricsRepository.queryMaxOverTime({
        metricName: value.metricName,
        start: IMMICH_INCEPTION.toMillis(),
        end: DateTime.now().toMillis(),
        step: '1d',
        labels: value.labels,
      });
      return [key, results[0]?.values ?? []];
    });

    return Object.fromEntries(await Promise.all(promises));
  }
}
