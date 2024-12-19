import { IMetricsQueryRepository } from 'src/interfaces/query-metrics.interface';

export class ApiWorker {
  constructor(private metricsRepository: IMetricsQueryRepository) {}

  async getGithubReports() {
    const metrics = {
      issues: { metricName: 'immich_data_repository_issue_open_total' },
      pullRequests: { metricName: 'immich_data_repository_pull_request_open_total' },
      stars: { metricName: 'immich_data_repository_star_total' },
      discussions: { metricName: 'immich_data_repository_discussion_total' },
    };

    const start = new Date().getTime() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
    const end = new Date().getTime();

    const promises = Object.entries(metrics).map(async ([key, value]) => {
      const response = await this.metricsRepository.queryMaxOverTime({
        metricName: value.metricName,
        start,
        end,
        step: '1d',
      });
      return [key, response[0] ?? []];
    });

    const promResponses = Object.fromEntries(await Promise.all(promises));
    return promResponses;
  }
}
