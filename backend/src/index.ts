/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMetricsRepository } from './interface';
import {
  CloudflareDeferredRepository,
  CloudflareMetricsRepository,
  HeaderMetricsProvider,
  InfluxMetricsProvider,
} from './repository';

enum Header {
  PMTILES_DEPLOYMENT_KEY = 'PMTiles-Deployment-Key',
  CACHE_CONTROL = 'Cache-Control',
  ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin',
  VARY = 'Vary',
  CONTENT_TYPE = 'Content-Type',
  CONTENT_ENCODING = 'Content-Encoding',
  SERVER_TIMING = 'Server-Timing',
}

async function handleRequest(
  request: Request<unknown, IncomingRequestCfProperties>,
  env: WorkerEnv,
  deferredRepository: CloudflareDeferredRepository,
  metrics: IMetricsRepository,
) {
  return new Response('Hello world!');
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const workerEnv = env as WorkerEnv;
    const deferredRepository = new CloudflareDeferredRepository(ctx);
    const headerProvider = new HeaderMetricsProvider();
    const influxProvider = new InfluxMetricsProvider(workerEnv.VMETRICS_API_TOKEN, env.ENVIRONMENT);
    deferredRepository.defer(() => influxProvider.flush());
    const metrics = new CloudflareMetricsRepository('data', request, [influxProvider, headerProvider]);

    try {
      const response = await metrics.monitorAsyncFunction({ name: 'handle_request' }, handleRequest)(
        request,
        workerEnv,
        deferredRepository,
        metrics,
      );
      response.headers.set(Header.SERVER_TIMING, headerProvider.getTimingHeader());
      deferredRepository.runDeferred();
      return response;
    } catch (e) {
      console.error(e);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
