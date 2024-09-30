interface WorkerEnv extends Omit<Env, 'ENVIRONMENT' | 'DEPLOYMENT_KEY'> {
  ENVIRONMENT: string;
  DEPLOYMENT_KEY: string;
  VMETRICS_API_TOKEN: string;
}
