import { AsyncFn, Operation, Options } from 'src/types';

export interface IMetricsPushRepository {
  monitorAsyncFunction<T extends AsyncFn>(
    operation: Operation,
    call: T,
    options?: Options,
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
  push(metric: Metric): void;
}

export class Metric {
  private _tags: Map<string, string> = new Map();
  private _timestamp = new Date();
  private _fields = new Map<string, { value: any; type: 'duration' | 'int' }>();
  private _prefix?: string;

  constructor(private _name: string) {}

  static create(name: string) {
    return new Metric(name);
  }

  get tags() {
    return this._tags;
  }

  get timestamp() {
    return this._timestamp;
  }

  get fields() {
    return this._fields;
  }

  get name() {
    return this._name;
  }

  get prefix() {
    return this._prefix;
  }

  get fullName() {
    return this._prefix ? `${this._prefix}_${this._name}` : this._name;
  }

  setTimestamp(timestamp: Date) {
    this._timestamp = timestamp;
    return this;
  }

  setPrefix(prefix: string) {
    this._prefix = prefix;
    return this;
  }

  addTag(key: string, value: string) {
    this._tags.set(key, value);
    return this;
  }

  addTags(tags: { [key: string]: string }) {
    for (const [key, value] of Object.entries(tags)) {
      this._tags.set(key, value);
    }
    return this;
  }

  durationField(key: string, duration?: number) {
    this._fields.set(key, { value: duration ?? performance.now() - this._timestamp.getTime(), type: 'duration' });
    return this;
  }

  intField(key: string, value: number) {
    this._fields.set(key, { value, type: 'int' });
    return this;
  }
}
