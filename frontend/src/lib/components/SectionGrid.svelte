<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  };

  const { children }: Props = $props();
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">{@render children()}</div>
