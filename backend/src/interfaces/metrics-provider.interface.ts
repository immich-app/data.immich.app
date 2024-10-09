import { Metric } from 'src/interfaces/metrics.interface';

export interface IMetricsProviderRepository {
  pushMetric(metric: Metric): void;
  flush(): void;
}
