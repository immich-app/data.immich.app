<script lang="ts">
  import '$lib/app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import PageContent from '$lib/components/layout/PageContent.svelte';
  import { backendUrl } from '$lib/environment';
  import { AppShell, AppShellHeader } from '@immich/ui';
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  console.log(`Backend URL: ${backendUrl}`);
</script>

<AppShell>
  <AppShellHeader>
    <Header
      items={[
        {
          title: 'GitHub',
          href: 'https://github.com/immich-app/data.immich.app',
          external: true,
        },
      ]}
    />
  </AppShellHeader>
  <PageContent>
    {@render children?.()}
  </PageContent>
</AppShell>
