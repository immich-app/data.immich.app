<script lang="ts">
  import '$lib/app.css';
  import { backendUrl } from '$lib/environment';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  console.log(`Backend URL: ${backendUrl}`);
</script>

<section class="h-full flex flex-col align-center gap-2 max-w-screen-lg mx-auto bg-white pb-36">
  {@render children?.()}
</section>
