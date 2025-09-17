type GithubDataResponse = {
  issues: GithubReportData;
  pullRequests: GithubReportData;
  stars: GithubReportData;
  discussions: GithubReportData;
  mergedPullRequests: GithubReportData;
};
type GithubReportData = Array<[number, number]>;
type GithubDataRecord = [number, number];

export const githubStars = $state<{ value?: GithubDataRecord[] }>({});
export const githubIssues = $state<{ value?: GithubDataRecord[] }>({});
export const githubPullRequests = $state<{ value?: GithubDataRecord[] }>({});
export const githubDiscussions = $state<{ value?: GithubDataRecord[] }>({});
export const githubMergedPullRequests = $state<{ value?: GithubDataRecord[] }>({});

export const loadGithubData = async () => {
  const response = await fetch('/api/github');
  if (response.ok) {
    const { stars, issues, pullRequests, discussions, mergedPullRequests } = (await response.json()) as GithubDataResponse;

    githubStars.value = stars;
    githubIssues.value = issues;
    githubPullRequests.value = pullRequests;
    githubDiscussions.value = discussions;
    githubMergedPullRequests.value = mergedPullRequests;
  }
};
