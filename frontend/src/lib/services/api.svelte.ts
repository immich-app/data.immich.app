import { DateTime } from 'luxon';

type GithubDataResponse = {
  issues: GithubReportData;
  pullRequests: GithubReportData;
  stars: GithubReportData;
  discussions: GithubReportData;
};
type GithubReportData = Array<[number, number]>;
type GithubDataRecord = [DateTime, number];

type GithubData = {
  issues: GithubDataRecord[];
  pullRequests: GithubDataRecord[];
  stars: GithubDataRecord[];
  discussions: GithubDataRecord[];
};

export const githubData = $state<GithubData>({
  stars: [],
  issues: [],
  pullRequests: [],
  discussions: [],
});

const asTimestamp = ([timestamp, value]: [number, number]) =>
  [DateTime.fromSeconds(timestamp), value] as [DateTime, number];

export const loadGithubData = async () => {
  const response = await fetch('/api/github');
  if (response.ok) {
    const { stars, issues, pullRequests, discussions } = (await response.json()) as GithubDataResponse;

    githubData.stars = stars.map(asTimestamp);
    githubData.pullRequests = pullRequests.map(asTimestamp);
    githubData.issues = issues.map(asTimestamp);
    githubData.discussions = discussions.map(asTimestamp);
  }
};
