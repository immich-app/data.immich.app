import { Metric } from 'src/interfaces/metrics.interface';

export interface IMetricsPushProviderRepository {
  pushMetric(metric: Metric): void;
  flush(): void;
}
