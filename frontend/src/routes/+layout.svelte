<script lang="ts">
  import '$lib/app.css';
  import PageContent from '$lib/components/layout/PageContent.svelte';
  import { backendUrl } from '$lib/environment';
  import {
    AppShell,
    AppShellHeader,
    CommandPaletteButton,
    commandPaletteManager,
    CommandPaletteProvider,
    ControlBar,
    ControlBarHeader,
    ControlBarOverflow,
    getSiteProviders,
    IconButton,
    Logo,
    ThemeSwitcher,
    TooltipProvider,
  } from '@immich/ui';
  import { siGithub } from 'simple-icons';
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  commandPaletteManager.enable();

  console.log(`Backend URL: ${backendUrl}`);
</script>

<CommandPaletteProvider providers={getSiteProviders()} />

<TooltipProvider>
  <AppShell>
    <AppShellHeader>
      <ControlBar static variant="ghost">
        <ControlBarHeader class="flex-row items-center">
          <a href="/">
            <Logo variant="inline" />
          </a>
        </ControlBarHeader>
        <ControlBarOverflow class="gap-0.5">
          <IconButton
            icon={siGithub}
            aria-label="GitHub"
            href="https://github.com/immich-app/data.immich.app"
            color="secondary"
            variant="ghost"
            shape="round"
          />
          <ThemeSwitcher color="secondary" />
          <CommandPaletteButton />
        </ControlBarOverflow>
      </ControlBar>
    </AppShellHeader>
    <PageContent>
      {@render children?.()}
    </PageContent>
  </AppShell>
</TooltipProvider>
