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
import { RedditIngestWorker } from 'src/workers/reddit-ingest.worker';

type FetchRequest = IRequest & Parameters<ExportedHandlerFetchHandler>[0];

const asEnvTag = (env: WorkerEnv) => [env.ENVIRONMENT, env.STAGE].filter(Boolean).join('_');

const newApiWorker = (request: FetchRequest, env: WorkerEnv, ctx: ExecutionContext) => {
  const deferredRepository = new CloudflareDeferredRepository(ctx);
  const influxProvider = new InfluxMetricsPushProvider(env.VMETRICS_DATA_API_URL, env.VMETRICS_DATA_WRITE_TOKEN);
  deferredRepository.defer(() => influxProvider.flush());
  const metrics = new MetricsQueryRepository(env.VMETRICS_DATA_API_URL, env.VMETRICS_DATA_READ_TOKEN, 'prod');

  return new ApiWorker(metrics);
};

const newIngestApiWorker = (request: FetchRequest, env: WorkerEnv) => {
  const queue = new CloudflareQueueRepository(env.DATA_QUEUE);
  return new IngestApiWorker(queue);
};

const slugAuth = (req: FetchRequest, env: WorkerEnv) => {
  const slug = env.SLUG;
  if (slug && req.params.slug !== slug) {
    return error(401, 'Unauthorized');
  }
};

const handleError = (err: Error) => {
  return error(500, err.message);
};

const router = AutoRouter<FetchRequest, [WorkerEnv, ExecutionContext]>()
  .get('/api/github', (...args) => newApiWorker(...args).getGithubData())
  .get('/api/reddit', (...args) => newApiWorker(...args).getRedditData())
  .post('/ingest/github/:slug', slugAuth, async (req, env) =>
    newIngestApiWorker(req, env)
      .onGithubEvent(await req.json())
      .catch(handleError)
      .then(() => new Response(null, { status: 204 })),
  );

export default {
  fetch: router.fetch,
  queue: async (batch, env) => {
    const influxProvider = new InfluxMetricsPushProvider(env.VMETRICS_DATA_API_URL, env.VMETRICS_DATA_WRITE_TOKEN);
    const metricsRepository = new MetricsPushRepository('immich_data_repository', {}, [influxProvider]);
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
  scheduled: async (event, env) => {
    const influxProvider = new InfluxMetricsPushProvider(env.VMETRICS_DATA_API_URL, env.VMETRICS_DATA_WRITE_TOKEN);
    const metricsRepository = new MetricsPushRepository('immich_data_repository', {}, [influxProvider]);
    const redditWorker = new RedditIngestWorker(metricsRepository, asEnvTag(env));

    try {
      await redditWorker.fetchAndStoreCurrentMetrics('immich');
      await influxProvider.flush();
    } catch (error) {
      console.error('Failed to fetch Reddit metrics:', error);
    }
  },
} satisfies ExportedHandler<WorkerEnv, QueueItem>;
