<script lang="ts">
  import '$lib/app.css';
  import { backendUrl } from '$lib/environment';

  console.log(`Backend URL: ${backendUrl}`);
</script>

<section class="h-full flex flex-col align-center gap-2 max-w-screen-lg mx-auto bg-white pb-36">
  <slot />
</section>
