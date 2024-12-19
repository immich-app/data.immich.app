import { IMetricsPushProviderRepository } from 'src/interfaces/metrics-provider.interface';
import { IMetricsPushRepository, Metric } from 'src/interfaces/metrics.interface';
import { monitorAsyncFunction } from 'src/monitor';
import { AsyncFn, Operation, Options } from 'src/types';

export class MetricsPushRepository implements IMetricsPushRepository {
  private readonly defaultTags: { [key: string]: string };

  constructor(
    private operationPrefix: string,
    tags: Record<string, string>,
    private metricsProviders: IMetricsPushProviderRepository[],
  ) {
    this.defaultTags = { ...tags };
  }

  monitorAsyncFunction<T extends AsyncFn>(
    operation: Operation,
    call: T,
    options: Options = {},
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    operation = { ...operation, tags: { ...operation.tags, ...this.defaultTags } };
    const callback = (metric: Metric) => {
      for (const provider of this.metricsProviders) {
        provider.pushMetric(metric);
      }
    };

    return monitorAsyncFunction(this.operationPrefix, operation, call, callback, options);
  }

  push(metric: Metric) {
    metric.addTags(this.defaultTags);
    for (const provider of this.metricsProviders) {
      provider.pushMetric(metric);
    }
  }
}
