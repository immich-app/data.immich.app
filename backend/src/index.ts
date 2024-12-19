import { AutoRouter, error, IRequest } from 'itty-router';
import { QueueItem } from 'src/interfaces/queue.interface';
import { CloudflareDeferredRepository } from 'src/repositories/cloudflare-deterred.repository';
import { CloudflareQueueRepository } from 'src/repositories/cloudflare-queue.repository';
import { GithubRepository } from 'src/repositories/github.repository';
import { InfluxMetricsPushProvider } from 'src/repositories/influx-metrics-provider.repository';
import { MetricsPushRepository } from 'src/repositories/metrics-push.repository';
import { MetricsQueryRepository } from 'src/repositories/metrics-query.repository';
import { ApiWorker } from 'src/workers/api.worker';
import { IngestApiWorker } from 'src/workers/ingest-api.worker';
import { IngestProcessorWorker } from 'src/workers/ingest-processor.worker';

type FetchRequest = IRequest & Parameters<ExportedHandlerFetchHandler>[0];

const asTags = (request: FetchRequest) => ({
  continent: request.cf?.continent ?? '',
  colo: request.cf?.colo ?? '',
  asOrg: request.cf?.asOrganization ?? '',
});

const asEnvTag = (env: WorkerEnv) => [env.ENVIRONMENT, env.STAGE].filter(Boolean).join('_');

const newApiWorker = (request: FetchRequest, env: WorkerEnv, ctx: ExecutionContext) => {
  const deferredRepository = new CloudflareDeferredRepository(ctx);
  const influxProvider = new InfluxMetricsPushProvider(env.VMETRICS_API_URL, env.VMETRICS_WRITE_TOKEN);
  deferredRepository.defer(() => influxProvider.flush());
  const metrics = new MetricsQueryRepository(env.VMETRICS_API_URL, env.VMETRICS_READ_TOKEN, 'prod');

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
  .get('/api/github', (...args) => newApiWorker(...args).getGithubReports())
  .post('/ingest/github/:slug', withSlug, async (req, env) =>
    newIngestApiWorker(req, env)
      .onGithubEvent(await req.json())
      .catch(handleError)
      .then(() => new Response(null, { status: 204 })),
  );

export default {
  fetch: router.fetch,
  queue: async (batch, env) => {
    const influxProvider = new InfluxMetricsPushProvider(env.VMETRICS_API_URL, env.VMETRICS_WRITE_TOKEN);
    const metricsRepository = new MetricsPushRepository('data', {}, [influxProvider]);
    const githubRepository = new GithubRepository(
      env.GITHUB_APP_ID,
      env.GITHUB_APP_PEM,
      env.GITHUB_APP_INSTALLATION_ID,
    );
    const ingestProcessWorker = new IngestProcessorWorker(metricsRepository, githubRepository, asEnvTag(env));

    if (batch.queue.startsWith('data-ingest')) {
      await ingestProcessWorker.handleMessages(batch);
    }

    await influxProvider.flush();
  },
} satisfies ExportedHandler<WorkerEnv, QueueItem>;
