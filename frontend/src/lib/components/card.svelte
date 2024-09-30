<script lang="ts">
  import Icon from '$lib/components/icon.svelte';
  import LoadingSpinner from '$lib/components/loading-spinner.svelte';
  import { mdiAlertCircleOutline, mdiCheckCircleOutline } from '@mdi/js';
  import { fade } from 'svelte/transition';

  export let status: 'loading' | 'success' | 'error' | undefined = undefined;
</script>

<div
  class="flex gap-4 flex-col place-content-center place-items-center text-center mt-4 justify-between relative border p-10 rounded-3xl bg-gray-100"
>
  <div class="absolute -top-[24px] left-[calc(50%-24px)]">
    {#if status === 'loading'}
      <div in:fade={{ duration: 200 }}>
        <div class="bg-immich-bg rounded-full p-1 border">
          <LoadingSpinner size="48" />
        </div>
      </div>
    {:else if status === 'success'}
      <Icon path={mdiCheckCircleOutline} size="48" class="text-white rounded-full bg-immich-primary" />
    {:else if status === 'error'}
      <Icon path={mdiAlertCircleOutline} size="48" class="text-white rounded-full bg-red-500" />
    {/if}
  </div>

  <slot />
</div>
