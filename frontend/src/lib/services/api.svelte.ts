type GithubDataResponse = {
  issues: ReportData;
  pullRequests: ReportData;
  stars: ReportData;
  discussions: ReportData;
  mergedPullRequests: ReportData;
};
type ReportData = Array<[number, number]>;
type DataRecord = [number, number];

export const githubStars = $state<{ value?: DataRecord[] }>({});
export const githubIssues = $state<{ value?: DataRecord[] }>({});
export const githubPullRequests = $state<{ value?: DataRecord[] }>({});
export const githubDiscussions = $state<{ value?: DataRecord[] }>({});
export const githubMergedPullRequests = $state<{ value?: DataRecord[] }>({});

export const loadGithubData = async () => {
  const response = await fetch('/api/github');
  if (response.ok) {
    const { stars, issues, pullRequests, discussions, mergedPullRequests } =
      (await response.json()) as GithubDataResponse;

    githubStars.value = stars;
    githubIssues.value = issues;
    githubPullRequests.value = pullRequests;
    githubDiscussions.value = discussions;
    githubMergedPullRequests.value = mergedPullRequests;
  }
};

type RedditDataResponse = {
  subscribers: ReportData;
};

type DiscordDataResponse = {
  members: ReportData;
  online: ReportData;
  nitro: ReportData;
  serverTier: ReportData;
};

export const redditMembers = $state<{ value?: DataRecord[] }>({});
export const discordMembers = $state<{ value?: DataRecord[] }>({});
export const discordOnline = $state<{ value?: DataRecord[] }>({});
export const discordNitro = $state<{ value?: DataRecord[] }>({});
export const discordServerTier = $state<{ value?: DataRecord[] }>({});

export const loadRedditData = async () => {
  const response = await fetch('/api/reddit');
  if (response.ok) {
    const { subscribers } = (await response.json()) as RedditDataResponse;
    redditMembers.value = subscribers;
  }
};

export const loadDiscordData = async () => {
  const response = await fetch('/api/discord');
  if (response.ok) {
    const { members, online, nitro, serverTier } = (await response.json()) as DiscordDataResponse;
    discordMembers.value = members;
    discordOnline.value = online;
    discordNitro.value = nitro;
    discordServerTier.value = serverTier;
  }
};
