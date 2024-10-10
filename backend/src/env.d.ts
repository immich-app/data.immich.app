interface WorkerEnv extends Omit<Env, 'ENVIRONMENT' | 'DEPLOYMENT_KEY'> {
  SLUG: string;
  ENVIRONMENT: string;
  DEPLOYMENT_KEY: string;
  VMETRICS_API_TOKEN: string;
}
