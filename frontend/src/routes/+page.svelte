<script lang="ts">
  import '$lib/app.css';
  import GithubGraph from '$lib/components/graphs/github-graph.svelte';
  import {
    githubDiscussions,
    githubIssues,
    githubPullRequests,
    githubStars,
    loadGithubData,
  } from '$lib/services/api.svelte';
  import { Card, CardBody, CardHeader, CardTitle, Container, Heading, HStack, Icon, Text } from '@immich/ui';
  import { mdiBugOutline, mdiMessageOutline, mdiSourceBranch, mdiStarOutline } from '@mdi/js';
  import uPlot from 'uplot';
  import 'uplot/dist/uPlot.min.css';

  const cursorOpts: uPlot.Cursor = {
    lock: true,
    focus: {
      prox: 16,
    },
    y: false,
    sync: {
      key: 'sync',
    },
  };

  void loadGithubData();
</script>

<Container size="giant" center>
  <Heading size="large" class="flex gap-1 items-center" tag="h1">
    <span>GitHub Trends</span>
  </Heading>
  <Text color="muted">immich-app/immich</Text>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
    <Card>
      <CardHeader>
        <CardTitle>
          <HStack>
            <Icon icon={mdiStarOutline} />
            Stars
          </HStack>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <GithubGraph color="yellow" id="stars-chart" data={githubStars.value} {cursorOpts} label="Stars" />
      </CardBody>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>
          <HStack>
            <Icon icon={mdiBugOutline} />
            <span>Issues</span>
          </HStack>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <GithubGraph color="blue" id="issues-chart" data={githubIssues.value} {cursorOpts} label="Issues" />
      </CardBody>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>
          <HStack>
            <Icon icon={mdiSourceBranch} />
            <span>Open Pull Requests</span>
          </HStack>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <GithubGraph color="green" id="pull-requests-chart" data={githubPullRequests.value} {cursorOpts} label="PR" />
      </CardBody>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>
          <HStack>
            <Icon icon={mdiMessageOutline} />
            <span>Total Discussions</span>
          </HStack>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <GithubGraph color="purple" id="discussions-chart" data={githubDiscussions.value} {cursorOpts} label="Topics" />
      </CardBody>
    </Card>
  </div>
</Container>
