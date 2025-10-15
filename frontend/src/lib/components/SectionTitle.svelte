<script lang="ts">
  import { Heading, Text, Link } from '@immich/ui';

  type Props = {
    title: string;
    link: {
      title: string;
      href: string;
    };
  };

  const { title, link }: Props = $props();
</script>

<Heading size="large" tag="h1">{title}</Heading>
<Text color="muted" class="mb-4">
  <Link href={link.href} underline={false}>{link.title}</Link>
</Text>
