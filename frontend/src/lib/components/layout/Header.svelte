<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import type { HeaderItem } from '$lib/types';
  import { Button, CloseButton, HStack, IconButton, Logo, NavbarItem, ThemeSwitcher } from '@immich/ui';
  import { mdiMenu, mdiOpenInNew } from '@mdi/js';
  import type { Snippet } from 'svelte';

  type Props = {
    items: HeaderItem[];
    children?: Snippet;
  };

  const isActive = (path: string, options?: { prefix?: boolean }) =>
    path === page.url.pathname || (options?.prefix && page.url.pathname.startsWith(path));

  let { items, children }: Props = $props();

  let menuOpen = $state(false);
  afterNavigate(() => {
    menuOpen = false;
  });
</script>

<nav class="flex items-center justify-between md:gap-2 p-2">
  <a href="/" class="flex gap-2 text-4xl">
    <Logo variant="inline" />
  </a>
  {@render children?.()}

  <HStack gap={0}>
    {#each items as item}
      <Button
        class="hidden md:flex"
        href={item.href}
        shape="round"
        leadingIcon={item.icon}
        trailingIcon={item.external ? mdiOpenInNew : undefined}
        variant={item.variant ?? 'ghost'}
        color={(item.color ?? isActive(item.href)) ? 'primary' : 'secondary'}>{item.title}</Button
      >
    {/each}
    <ThemeSwitcher size="large" />
    {#if items.length > 0}
      <span class="md:hidden">
        {#if menuOpen}
          <CloseButton class="md:hidden" size="large" onclick={() => (menuOpen = false)} />
        {:else}
          <IconButton
            size="large"
            shape="round"
            color="secondary"
            variant="ghost"
            class="md:hidden"
            icon={mdiMenu}
            aria-label="Open menu"
            onclick={() => (menuOpen = true)}
          />
        {/if}
      </span>
    {/if}
  </HStack>
</nav>

{#if menuOpen}
  <div class="h-dvh w-dvw bg-light/80 text-dark fixed left-0">
    <nav class="w-full absolute bg-light text-dark overflow-y-hidden py-4 border-t">
      <div class="flex flex-col">
        {#each items as item}
          <NavbarItem href={item.href} title={item.title} />
        {/each}
      </div>
    </nav>
  </div>
{/if}
