<script lang="ts">
  import { Card, CardBody, CardHeader, CardTitle, Link, Text } from '@immich/ui';
  import { DateTime } from 'luxon';
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    href: string;
    date: DateTime | Snippet;
  };

  const { title, href, date }: Props = $props();
</script>

<Card color="secondary">
  <CardHeader class="text-center">
    <CardTitle>
      <Link {href}>{title}</Link>
    </CardTitle>
  </CardHeader>
  <CardBody>
    <div class="flex justify-around align-middle h-full">
      <div class="text-center flex flex-col justify-between align-middle">
        {#if typeof date === 'function'}
          {@render date()}
        {:else}
          <Text class="text-4xl">{date.toRelative()}</Text>
          <Text color="muted">{date.toLocaleString(DateTime.DATE_FULL)}</Text>
        {/if}
      </div>
    </div>
  </CardBody>
</Card>
