<script lang="ts">
  import { siteMetadata } from '$lib';
  import '$lib/app.css';
  import DateCard from '$lib/components/DateCard.svelte';
  import GraphCard from '$lib/components/GraphCard.svelte';
  import Graph from '$lib/components/Graph.svelte';
  import SectionGrid from '$lib/components/SectionGrid.svelte';
  import SectionTitle from '$lib/components/SectionTitle.svelte';
  import {
    discordMembers,
    githubDiscussions,
    githubIssues,
    githubMergedPullRequests,
    githubPullRequests,
    githubStars,
    load,
    redditMembers,
  } from '$lib/services/api.svelte';
  import { Constants, Container, Heading, SiteMetadata, Text } from '@immich/ui';
  import { mdiAccountGroup, mdiBugOutline, mdiMessageOutline, mdiSourceBranch, mdiStarOutline } from '@mdi/js';
  import { DateTime } from 'luxon';
  import { onMount } from 'svelte';
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

  onMount(() => {
    load();
  });

  const milestones = [
    {
      title: '1st Commit',
      href: 'https://github.com/immich-app/immich/commit/af2efbdbbddc27cd06142f22253ccbbbbeec1f55',
      date: DateTime.fromISO('2022-02-03T15:56:28.000Z', { zone: 'America/Chicago' }),
    },
    {
      title: 'Joined FUTO',
      href: 'https://immich.app/blog/2024/immich-core-team-goes-fulltime',
      date: DateTime.fromObject({ year: 2024, month: 5, day: 1 }, { zone: 'America/Chicago' }),
    },
    {
      title: 'Stable Release',
      href: 'https://immich.app/blog/stable-release',
      date: DateTime.fromObject({ year: 2025, month: 10, day: 1 }, { zone: 'America/Chicago' }),
    },
  ];
</script>

<SiteMetadata site={siteMetadata} />

<Container size="giant" center>
  <Heading size="giant" class="mb-1">{siteMetadata.title}</Heading>
  <Text color="muted" class="mb-8">{siteMetadata.description}</Text>

  <SectionTitle title="Milestones" link={{ title: 'Important dates for Immich', href: Constants.Pages.Roadmap }} />
  <div class="grid grid-cols-1 md:gric-cols-2 lg:grid-cols-4 gap-4 mb-4">
    {#each milestones as milestone (milestone.title)}
      <DateCard title={milestone.title} href={milestone.href} date={milestone.date} />
    {/each}
    <DateCard title="Last timezone issue" href={Constants.Pages.CursedKnowledge}>
      {#snippet date()}
        <Text class="text-4xl">-1</Text>
        <Text color="muted">days ago</Text>
      {/snippet}
    </DateCard>
  </div>

  <SectionTitle title="GitHub" link={{ title: 'immich-app/immich', href: Constants.Socials.Github }} />
  <SectionGrid>
    <GraphCard title="Stars" icon={mdiStarOutline}>
      <Graph color="yellow" id="stars-chart" data={githubStars.value} {cursorOpts} label="Stars" />
    </GraphCard>
    <GraphCard title="Issues" icon={mdiBugOutline}>
      <Graph color="blue" id="issues-chart" data={githubIssues.value} {cursorOpts} label="Issues" />
    </GraphCard>
    <GraphCard title="Open Pull Requests" icon={mdiSourceBranch}>
      <Graph
        color="green"
        id="pull-requests-chart"
        data={githubPullRequests.value}
        {cursorOpts}
        label="Open pull requests"
      />
    </GraphCard>
    <GraphCard title="Merged Pull Requests" icon={mdiSourceBranch}>
      <Graph
        color="green"
        id="merged-prs-chart"
        data={githubMergedPullRequests.value}
        {cursorOpts}
        label="Merged pull requests"
      />
    </GraphCard>
    <GraphCard title="Discussions" icon={mdiMessageOutline}>
      <Graph
        color="purple"
        id="discussions-chart"
        data={githubDiscussions.value}
        {cursorOpts}
        label="Total discussions"
      />
    </GraphCard>
  </SectionGrid>

  <SectionGrid>
    <div>
      <SectionTitle title="Reddit" link={{ title: 'r/immich', href: Constants.Socials.Reddit }} />
      <GraphCard title="Reddit Members" icon={mdiAccountGroup}>
        <Graph color="orange" id="reddit-members" data={redditMembers.value} {cursorOpts} label="Reddit members" />
      </GraphCard>
    </div>
    <div>
      <SectionTitle title="Discord" link={{ title: 'discord.immich.app', href: Constants.Socials.Discord }} />
      <GraphCard title="Discord Members" icon={mdiAccountGroup}>
        <Graph color="purple" id="discord-members" data={discordMembers.value} {cursorOpts} label="Discord members" />
      </GraphCard>
    </div>
  </SectionGrid>
</Container>
