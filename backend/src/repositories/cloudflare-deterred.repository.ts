import { IDeferredRepository } from 'src/interfaces/deferred.interface';
import { AsyncFn } from 'src/types';

export class CloudflareDeferredRepository implements IDeferredRepository {
  deferred: AsyncFn[] = [];
  constructor(private ctx: ExecutionContext) {}

  defer(call: AsyncFn): void {
    this.deferred.push(call);
  }

  runDeferred() {
    for (const call of this.deferred) {
      this.ctx.waitUntil(call());
    }
  }
}
