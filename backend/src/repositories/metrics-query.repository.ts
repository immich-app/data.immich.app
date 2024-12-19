import {
  IMetricsQueryRepository,
  QueryMaxOverTimeArgs,
  RangeQueryResponse,
} from 'src/interfaces/query-metrics.interface';

type PrometheusQueryResponse = {
  data: {
    result: Array<{
      metric: object;
      values: Array<[number, string]>;
    }>;
  };
};

export class MetricsQueryRepository implements IMetricsQueryRepository {
  constructor(
    private vmetricsApiUrl: string,
    private vmetricsApiToken: string,
    private environment: string,
  ) {}

  async queryMaxOverTime({ metricName, start, end, step }: QueryMaxOverTimeArgs): Promise<RangeQueryResponse> {
    const url = new URL(`${this.vmetricsApiUrl}/api/v1/query_range`);
    const query = `max(max_over_time(${metricName}{environment="${this.environment}", repository_name="immich"}[${step}]))`;
    const params = {
      query,
      start: `${start}`,
      end: `${end}`,
      step,
    };
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.vmetricsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    const {
      data: { result },
    } = (await new Response(response.body).json()) as PrometheusQueryResponse;

    return result.map((r) => ({
      values: r.values.map(([timestamp, value]) => [timestamp, parseInt(value)] as [number, number]),
    }));
  }
}
