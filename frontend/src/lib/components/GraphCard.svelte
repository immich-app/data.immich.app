<script lang="ts">
  import { Card, CardBody, CardHeader, CardTitle, HStack, Icon, type IconLike } from '@immich/ui';
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    icon: IconLike;
    children: Snippet;
  };

  const { title, icon, children }: Props = $props();
</script>

<Card color="secondary">
  <CardHeader>
    <CardTitle>
      <HStack>
        <Icon {icon} />
        <span>{title}</span>
      </HStack>
    </CardTitle>
  </CardHeader>
  <CardBody>
    {@render children()}
  </CardBody>
</Card>
