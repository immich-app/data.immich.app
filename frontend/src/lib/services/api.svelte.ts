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

export const redditMembers = $state<{ value?: DataRecord[] }>({});

export const loadRedditData = async () => {
  const response = await fetch('/api/reddit');
  if (response.ok) {
    const { subscribers } = (await response.json()) as RedditDataResponse;
    redditMembers.value = subscribers;
  }
};
