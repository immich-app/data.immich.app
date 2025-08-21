<script lang="ts">
  import { Heading, HStack, Icon, Link, Stack, Text, ThemeSwitcher, VStack } from '@immich/ui';
  import { mdiCubeOutline, mdiKey, mdiOfficeBuildingOutline, mdiServerOutline, mdiShoppingOutline } from '@mdi/js';
  import { siAndroid, siApple, siDiscord, siGithub, siImmich, siReddit } from 'simple-icons';
</script>

<div class="bg-dark/10 rounded-t-3xl mt-16 p-8">
  <div class="max-w-(--breakpoint-lg) mx-auto xl:py-8">
    <Stack gap={8}>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 place-center">
        <Stack>
          <Heading size="tiny">Social</Heading>
          <Link href="https://github.com/immich-app/immich" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={siGithub} size="1.5em" />
              <Text>GitHub</Text>
            </HStack>
          </Link>
          <Link href="https://discord.immich.app/" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={siDiscord} size="1.5em" />
              <Text>Discord</Text>
            </HStack>
          </Link>
          <Link href="https://www.reddit.com/r/immich/" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={siReddit.path} size="1.5em" />
              <Text>Reddit</Text>
            </HStack>
          </Link>
        </Stack>

        <Stack>
          <Heading size="tiny">Download</Heading>
          <Link
            href="https://play.google.com/store/apps/details?id=app.alextran.immich"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HStack>
              <Icon icon={siAndroid.path} size="1.5em" />
              <Text>Android</Text>
            </HStack>
          </Link>
          <Link href="https://apps.apple.com/us/app/immich/id1613945652" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={siApple.path} size="1.5em" />
              <Text>iOS</Text>
            </HStack>
          </Link>
          <Link href="https://get.immich.app/docker-compose" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={mdiServerOutline} size="1.5em" />
              <Text>Server</Text>
            </HStack>
          </Link>
        </Stack>

        <Stack>
          <Heading size="tiny">Sites</Heading>
          <Link href="https://immich.app" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={siImmich} size="1.5em" />
              <Text>Documentation</Text>
            </HStack>
          </Link>
          <Link href="https://my.immich.app" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={siImmich} size="1.5em" />
              <Text>My Immich</Text>
            </HStack>
          </Link>
          <Link href="https://api.immich.app" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={mdiCubeOutline} size="1.5em" />
              <Text>Immich API</Text>
            </HStack>
          </Link>
        </Stack>

        <Stack>
          <Heading size="tiny">Support</Heading>
          <Link href="https://buy.immich.app" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={mdiKey} size="1.5em" />
              <Text>Purchase</Text>
            </HStack>
          </Link>
          <Link href="https://immich.store/" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={mdiShoppingOutline} size="1.5em" />
              <Text>Merch</Text>
            </HStack>
          </Link>
        </Stack>

        <Stack>
          <Heading size="tiny">Company</Heading>
          <Link href="https://futo.org/" target="_blank" rel="noopener noreferrer">
            <HStack>
              <Icon icon={mdiOfficeBuildingOutline} size="1.5em" />
              <Text>FUTO</Text>
            </HStack>
          </Link>
        </Stack>
      </div>
      <VStack class="text-center">
        <Text size="large">This project is available under GNU AGPL v3 license.</Text>
        <Text color="muted" variant="italic">Privacy should not be a luxury</Text>
        <ThemeSwitcher color="secondary" />
      </VStack>
    </Stack>
  </div>
</div>
