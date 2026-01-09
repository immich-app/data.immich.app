<script lang="ts">
  import '$lib/app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import PageContent from '$lib/components/layout/PageContent.svelte';
  import { backendUrl } from '$lib/environment';
  import { AppShell, AppShellHeader, initializeTheme, TooltipProvider } from '@immich/ui';
  import { siGithub } from 'simple-icons';
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  initializeTheme({ selector: 'html', lightClass: 'light', darkClass: 'dark' });

  console.log(`Backend URL: ${backendUrl}`);
</script>

<TooltipProvider>
  <AppShell>
    <AppShellHeader>
      <Header
        items={[
          {
            title: 'GitHub',
            href: 'https://github.com/immich-app/data.immich.app',
            icon: siGithub,
          },
        ]}
      />
    </AppShellHeader>
    <PageContent>
      {@render children?.()}
    </PageContent>
  </AppShell>
</TooltipProvider>
