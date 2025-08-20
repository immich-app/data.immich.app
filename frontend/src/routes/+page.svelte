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
  import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Container,
    Heading,
    HStack,
    Icon,
    Link,
    Stack,
    Text,
  } from '@immich/ui';
  import { mdiBugOutline, mdiMessageOutline, mdiSourceBranch, mdiStarOutline } from '@mdi/js';
  import { DateTime } from 'luxon';
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

  const commit = DateTime.fromISO('2022-02-03T15:56:28.000Z', { zone: 'America/Chicago' });
  const futo = DateTime.fromObject({ year: 2024, month: 5, day: 1 }, { zone: 'America/Chicago' });

  void loadGithubData();
</script>

<Container size="giant" center>
  <Stack gap={8}>
    <Heading size="title">Immich Data</Heading>

    <section class="flex flex-col gap-4">
      <Heading size="large" class="flex gap-1 items-center mt-4" tag="h1">Statistics</Heading>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card color="secondary">
          <CardHeader class="text-center">
            <CardTitle>
              <Link href="https://github.com/immich-app/immich/commit/af2efbdbbddc27cd06142f22253ccbbbbeec1f55"
                >1st Commit</Link
              >
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div class="flex justify-around align-middle h-full">
              <div class="text-center flex flex-col justify-between align-middle">
                <Text class="text-4xl">{commit.toRelative()}</Text>
                <Text color="muted">{commit.toLocaleString(DateTime.DATETIME_MED)}</Text>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card color="secondary">
          <CardHeader class="text-center">
            <CardTitle>
              <Link href="https://immich.app/blog/2024/immich-core-team-goes-fulltime">Joined FUTO</Link>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div class="flex justify-around align-middle h-full">
              <div class="text-center flex flex-col justify-between align-middle">
                <Text class="text-4xl">{futo.toRelative()}</Text>
                <Text color="muted">{futo.toLocaleString(DateTime.DATE_FULL)}</Text>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card color="secondary">
          <CardHeader class="text-center">
            <CardTitle>Last timezone issue</CardTitle>
          </CardHeader>
          <CardBody>
            <div class="flex justify-around align-middle h-full">
              <div class="text-center flex flex-col justify-between align-middle">
                <Text class="text-6xl">0</Text>
                <Text color="muted">days ago</Text>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <div>
        <Heading size="large" class="flex gap-1 items-center" tag="h1">
          <span>GitHub Trends</span>
        </Heading>
        <Text color="muted">immich-app/immich</Text>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card color="secondary">
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
        <Card color="secondary">
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
        <Card color="secondary">
          <CardHeader>
            <CardTitle>
              <HStack>
                <Icon icon={mdiSourceBranch} />
                <span>Open Pull Requests</span>
              </HStack>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <GithubGraph
              color="green"
              id="pull-requests-chart"
              data={githubPullRequests.value}
              {cursorOpts}
              label="PR"
            />
          </CardBody>
        </Card>
        <Card color="secondary">
          <CardHeader>
            <CardTitle>
              <HStack>
                <Icon icon={mdiMessageOutline} />
                <span>Total Discussions</span>
              </HStack>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <GithubGraph
              color="purple"
              id="discussions-chart"
              data={githubDiscussions.value}
              {cursorOpts}
              label="Topics"
            />
          </CardBody>
        </Card>
      </div>
    </section>
  </Stack>
</Container>
