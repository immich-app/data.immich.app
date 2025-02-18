<script lang="ts">
  import '$lib/app.css';
  import 'uplot/dist/uPlot.min.css';
  import GithubStarsGraph from '$lib/components/graphs/github-stars-graph.svelte';
  import Icon from '$lib/components/icon.svelte';
  import { githubData } from '$lib/services/api.svelte';
  import { mdiBug, mdiGithub, mdiMessageOutline, mdiSourceBranch, mdiStarOutline } from '@mdi/js';
  import uPlot from 'uplot';

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
</script>

<main class="p-4 md:p-8">
  <div
    class="flex flex-col align-center gap-2 dark:border-immich-dark-gray dark:bg-immich-dark-gray rounded-lg md:rounded-2xl"
  >
    <div class="w-full h-full flex gap-2 place-items-center mb-2">
      <img src="/img/immich-logo.svg" alt={'immich-logo'} class="h-12 w-12" />
      <p class="dark:text-gray-100 text-2xl font-medium text-immich-primary">Immich Data</p>
    </div>

    <section class="flex flex-col gap-4 mt-8">
      <h2 class="flex gap-1 text-xl">
        <Icon path={mdiGithub} size="24" />
        <span>Repo Trends</span>
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 class="flex gap-1 text-lg">
            <Icon path={mdiStarOutline} size="24" />
            <span>Stars</span>
          </h3>
          <GithubStarsGraph color="yellow" id="stars-chart" data={githubData.stars} {cursorOpts} label={'Stars'} />
        </div>
        <div>
          <h3 class="flex gap-1 text-lg">
            <Icon path={mdiBug} size="24" />
            <span>Open Issues</span>
          </h3>
          <GithubStarsGraph color="blue" id="issues-chart" data={githubData.issues} {cursorOpts} label={'Issues'} />
        </div>
        <div>
          <h3 class="flex gap-1 text-lg">
            <Icon path={mdiSourceBranch} size="24" />
            <span>Open Pull Requests</span>
          </h3>
          <GithubStarsGraph
            color="green"
            id="pull-requests-chart"
            data={githubData.pullRequests}
            {cursorOpts}
            label={'PR'}
          />
        </div>
        <div>
          <h3 class="flex gap-1 text-lg">
            <Icon path={mdiMessageOutline} size="24" />
            <span>Total Discussions</span>
          </h3>
          <GithubStarsGraph
            color="purple"
            id="discussions-chart"
            data={githubData.discussions}
            {cursorOpts}
            label={'Topics'}
          />
        </div>
      </div>
    </section>
  </div>
</main>
