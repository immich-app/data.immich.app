interface WorkerEnv extends Omit<Env, 'ENVIRONMENT' | 'STAGE' | 'DEPLOYMENT_KEY'> {
  SLUG: string;
  ENVIRONMENT: string;
  STAGE: string;
  DEPLOYMENT_KEY: string;
  VMETRICS_API_TOKEN: string;
  VMETRICS_API_URL: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_PEM: string;
  GITHUB_APP_INSTALLATION_ID: string;
}
