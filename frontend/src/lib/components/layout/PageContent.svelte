<script lang="ts">
  import { SiteFooter } from '@immich/ui';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = {
    children: Snippet;
    class?: string;
  } & HTMLAttributes<HTMLDivElement>;

  let { children, class: className, ...restProps }: Props = $props();
</script>

<div {...restProps} class="flex flex-col h-full mx-auto">
  <div class="grow {className ? className : ''}">
    <div class="w-full h-full px-4 py-10 sm:px-20 lg:p-10">
      {@render children?.()}
    </div>
  </div>
  <SiteFooter />
</div>
