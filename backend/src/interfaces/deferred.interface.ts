import { AsyncFn } from 'src/types';

export interface IDeferredRepository {
  defer(promise: AsyncFn): void;
  runDeferred(): void;
}
