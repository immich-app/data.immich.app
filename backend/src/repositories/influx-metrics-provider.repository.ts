import { Point } from '@influxdata/influxdb-client';
import { IMetricsProviderRepository } from 'src/interfaces/metrics-provider.interface';
import { Metric } from 'src/interfaces/metrics.interface';

export class InfluxMetricsProvider implements IMetricsProviderRepository {
  private metrics: string[] = [];
  constructor(
    private influxApiToken: string,
    private environment: string,
  ) {}

  pushMetric(metric: Metric) {
    const point = new Point(metric.name);
    for (const [key, value] of metric.tags) {
      point.tag(key, value);
    }
    for (const [key, { value, type }] of metric.fields) {
      if (type === 'duration') {
        point.intField(key, value);
      } else if (type === 'int') {
        point.intField(key, value);
      }
    }
    const influxLineProtocol = point.toLineProtocol()?.toString();
    if (influxLineProtocol) {
      this.metrics.push(influxLineProtocol);
    }
  }

  async flush() {
    if (this.metrics.length === 0) {
      return;
    }
    const metrics = this.metrics.join('\n');
    if (this.environment === 'prod') {
      const response = await fetch('https://cf-workers.monitoring.immich.cloud/write', {
        method: 'POST',
        body: this.metrics.join('\n'),
        headers: {
          Authorization: `Token ${this.influxApiToken}`,
        },
      });
      await response.body?.cancel();
    } else {
      console.log(metrics);
    }
  }
}