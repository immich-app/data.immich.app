import fetchRetry from 'fetch-retry';
import { Buffer } from 'node:buffer';

const fetch = fetchRetry(globalThis.fetch, {
  retries: 3,
  retryDelay: 1000,
});

export interface RedditSubredditData {
  subscribers: number;
}

export interface RedditAboutResponse {
  data: RedditSubredditData;
}

export class RedditRepository {
  private readonly userAgent = 'web:app.immich.data:v1.0.0 (by u/immichapp)';

  async getSubredditData(
    subreddit: string,
    oauthCredentials: { clientId: string; clientSecret: string },
  ): Promise<RedditSubredditData> {
    const tokenRequest = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'User-Agent': this.userAgent,
        Authorization: `Basic ${Buffer.from(`${oauthCredentials.clientId}:${oauthCredentials.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    if (!tokenRequest.ok) {
      throw new Error(`Failed to authenticate against Reddit: ${tokenRequest.status} ${tokenRequest.statusText}`);
    }

    const { access_token } = (await tokenRequest.json()) as { access_token: string };

    const url = `https://oauth.reddit.com/r/${subreddit}/about.json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit data: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as RedditAboutResponse;
    return data.data;
  }
}
