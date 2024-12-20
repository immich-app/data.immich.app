import { Point } from '@influxdata/influxdb-client';
import { IMetricsPushProviderRepository } from 'src/interfaces/metrics-provider.interface';
import { Metric } from 'src/interfaces/metrics.interface';

export class InfluxMetricsPushProvider implements IMetricsPushProviderRepository {
  private metrics: string[] = [];
  constructor(
    private influxApiUrl: string,
    private influxApiToken: string,
  ) {}

  pushMetric(metric: Metric) {
    const point = new Point(metric.fullName);
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
    const response = await fetch(`${this.influxApiUrl}/write`, {
      method: 'POST',
      body: this.metrics.join('\n'),
      headers: {
        Authorization: `Token ${this.influxApiToken}`,
      },
    });
    await response.body?.cancel();
    console.log(metrics);
  }
}
