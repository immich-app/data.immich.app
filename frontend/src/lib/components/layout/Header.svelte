<script lang="ts">
  import { page } from '$app/state';
  import type { HeaderItem } from '$lib/types';
  import { Button, HStack, isExternalLink, Logo, ThemeSwitcher } from '@immich/ui';
  import { mdiOpenInNew } from '@mdi/js';
  import type { Snippet } from 'svelte';

  type Props = {
    items: HeaderItem[];
    children?: Snippet;
  };

  const isActive = (path: string, options?: { prefix?: boolean }) =>
    path === page.url.pathname || (options?.prefix && page.url.pathname.startsWith(path));

  let { items, children }: Props = $props();
</script>

<nav class="w-full flex items-center justify-between md:gap-2 p-2">
  <a href="/" class="flex gap-2 text-4xl">
    <Logo variant="inline" />
  </a>
  {@render children?.()}

  <HStack gap={0}>
    {#each items as item, index (index)}
      <Button
        href={item.href}
        shape="round"
        leadingIcon={item.icon}
        trailingIcon={isExternalLink(item.href) ? mdiOpenInNew : undefined}
        variant={item.variant ?? 'ghost'}
        color={(item.color ?? isActive(item.href)) ? 'primary' : 'secondary'}>{item.title}</Button
      >
    {/each}
    <ThemeSwitcher />
  </HStack>
</nav>
