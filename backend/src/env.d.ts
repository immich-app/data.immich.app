interface WorkerEnv extends Omit<Env, 'ENVIRONMENT' | 'STAGE' | 'DEPLOYMENT_KEY'> {
  SLUG: string;
  ENVIRONMENT: string;
  STAGE: string;
  DEPLOYMENT_KEY: string;
  VMETRICS_API_TOKEN: string;
  VMETRICS_API_URL: string;
}
