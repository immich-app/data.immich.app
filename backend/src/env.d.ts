interface WorkerEnv extends Omit<Env, 'ENVIRONMENT' | 'STAGE' | 'DEPLOYMENT_KEY'> {
  SLUG: string;
  ENVIRONMENT: string;
  STAGE: string;
  DEPLOYMENT_KEY: string;
  VMETRICS_DATA_WRITE_TOKEN: string;
  VMETRICS_DATA_READ_TOKEN: string;
  VMETRICS_DATA_API_URL: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_PEM: string;
  GITHUB_APP_INSTALLATION_ID: string;
}
