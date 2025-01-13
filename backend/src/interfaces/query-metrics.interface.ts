export interface IMetricsQueryRepository {
  queryMaxOverTime(args: QueryMaxOverTimeArgs): Promise<RangeQueryResponse>;
}

export type RangeQueryResponse = { values: [number, number][] }[];
export type QueryMaxOverTimeArgs = { metricName: string; start: number; end: number; step: string };
