import fetchRetry from 'fetch-retry';

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
  private readonly userAgent = 'Mozilla/5.0 (compatible; ImmichDataBot/1.0)';

  async getSubredditData(subreddit: string): Promise<RedditSubredditData> {
    const url = `https://www.reddit.com/r/${subreddit}/about.json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit data: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as RedditAboutResponse;
    return data.data;
  }
}
