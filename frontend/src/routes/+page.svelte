<script lang="ts">
  import '$lib/app.css';
  import GithubGraph from '$lib/components/graphs/github-graph.svelte';
  import {
    githubDiscussions,
    githubIssues,
    githubPullRequests,
    githubStars,
    loadGithubData,
    loadRedditData,
    redditMembers,
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
  import { mdiAccountGroup, mdiBugOutline, mdiMessageOutline, mdiSourceBranch, mdiStarOutline } from '@mdi/js';
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
  void loadRedditData();
</script>

<Container size="giant" center>
  <Stack gap={8}>
    <section>
      <Heading size="large" class="flex gap-1 items-center" tag="h1">
        <span>GitHub</span>
      </Heading>
      <Text color="muted">
        <Link href="https://github.com/immich-app/immich">immich-app/immich</Link>
      </Text>
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
            <GithubGraph
              color="green"
              id="pull-requests-chart"
              data={githubPullRequests.value}
              {cursorOpts}
              label="PR"
            />
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

    <section>
      <Heading size="large" class="flex gap-1 items-center" tag="h1">
        <span>reddit</span>
      </Heading>
      <Text color="muted">
        <Link href="https://www.reddit.com/r/immich">r/immich</Link>
      </Text>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>
              <HStack>
                <Icon icon={mdiAccountGroup} />
                <span>Total Members</span>
              </HStack>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <GithubGraph
              color="orange"
              id="reddit-members"
              data={redditMembers.value}
              {cursorOpts}
              label="Reddit members"
            />
          </CardBody>
        </Card>
      </div>
    </section>
  </Stack>
</Container>
