import { IMetricsRepository } from 'src/interfaces/metrics.interface';

export class ApiWorker {
  constructor(private metricsRepository: IMetricsRepository) {}

  getGithubReports() {
    return [];
  }
}
