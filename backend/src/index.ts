import { AutoRouter, error, IRequest } from 'itty-router';
import { QueueItem } from 'src/interfaces/queue.interface';
import { CloudflareDeferredRepository } from 'src/repositories/cloudflare-deterred.repository';
import { CloudflareMetricsRepository } from 'src/repositories/cloudflare-metrics.repository';
import { CloudflareQueueRepository } from 'src/repositories/cloudflare-queue.repository';
import { InfluxMetricsProvider } from 'src/repositories/influx-metrics-provider.repository';
import { ApiWorker } from 'src/workers/api.worker';
import { IngestApiWorker } from 'src/workers/ingest-api.worker';
import { IngestProcessorWorker } from 'src/workers/ingest-processor.worker';

type FetchRequest = IRequest & Parameters<ExportedHandlerFetchHandler>[0];

const asTags = (request: FetchRequest) => ({
  continent: request.cf?.continent ?? '',
  colo: request.cf?.colo ?? '',
  asOrg: request.cf?.asOrganization ?? '',
});

const newApiWorker = (request: FetchRequest, env: WorkerEnv, ctx: ExecutionContext) => {
  const deferredRepository = new CloudflareDeferredRepository(ctx);
  const influxProvider = new InfluxMetricsProvider(env.VMETRICS_API_TOKEN, env.ENVIRONMENT);
  deferredRepository.defer(() => influxProvider.flush());
  const metrics = new CloudflareMetricsRepository('data', asTags(request), [influxProvider]);

  return new ApiWorker(metrics);
};

const newIngestApiWorker = (request: FetchRequest, env: WorkerEnv) => {
  const queue = new CloudflareQueueRepository(env.DATA_QUEUE);
  return new IngestApiWorker(queue);
};

const withSlug = (req: FetchRequest, env: WorkerEnv) => {
  const slug = env.SLUG;
  if (slug && req.params.slug !== slug) {
    return error(401, 'Unauthorized');
  }
};

const handleError = (err: Error) => {
  return error(500, err.message);
};

const router = AutoRouter<FetchRequest, [WorkerEnv, ExecutionContext]>()
  .get('/api', (...args) => newApiWorker(...args).getGithubReports())
  .post('/ingest/github/:slug', withSlug, async (req, env) =>
    newIngestApiWorker(req, env)
      .onGithubEvent(await req.json())
      .catch(handleError)
      .then(() => new Response(null, { status: 204 })),
  );

export default {
  fetch: router.fetch,
  queue: (batch, env) => {
    const influxProvider = new InfluxMetricsProvider(env.VMETRICS_API_TOKEN, env.ENVIRONMENT);
    const metricsRepository = new CloudflareMetricsRepository('data', {}, [influxProvider]);
    const ingestProcessWorker = new IngestProcessorWorker(metricsRepository);

    if (batch.queue.startsWith('data-ingest')) {
      return ingestProcessWorker.process(batch);
    }
  },
} satisfies ExportedHandler<WorkerEnv, QueueItem>;
