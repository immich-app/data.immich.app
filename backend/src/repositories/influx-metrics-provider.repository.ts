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
    point.timestamp(metric.timestamp);
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

  flush(): Promise<void> {
    if (this.metrics.length === 0) {
      return Promise.resolve();
    }
    const metrics = this.metrics.join('\n');
    this.metrics = [];
    const send = async () => {
      const response = await fetch(`${this.influxApiUrl}/write`, {
        method: 'POST',
        body: metrics,
        headers: {
          Authorization: `Token ${this.influxApiToken}`,
          'Stream-Mode': '1',
        },
      });
      await response.body?.cancel();
      if (response.status !== 204) {
        throw new Error(`InfluxDB write failed with status ${response.status}`);
      }
    };

    return send();
  }
}
