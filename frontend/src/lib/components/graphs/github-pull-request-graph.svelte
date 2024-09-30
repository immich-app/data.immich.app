<script lang="ts">
  import '$lib/app.css';
  import prData from '$lib/assets/data/pr-data.json';
  import { VisAxis, VisCrosshair, VisArea, VisTooltip, VisXYContainer } from '@unovis/svelte';
  import { DateTime } from 'luxon';

  type DataRecord = [DateTime, number, number, number];

  // remove headers
  prData.shift();

  const data = (prData as Array<[number, number, number, number]>).map(([timestamp, , , total]) => [
    DateTime.fromSeconds(timestamp),
    total,
  ]);
  const x = ([timestamp]: DataRecord) => timestamp.toMillis();
  const y = ([, value]: DataRecord) => value;
  const tickFormatX = (value: number) => DateTime.fromMillis(value).toFormat('MMM yy');
  const tickFormatY = (i: number) =>
    new Intl.NumberFormat(navigator.language, { maximumSignificantDigits: 3 }).format(i);
  const template = ([timestamp, value]: DataRecord) =>
    `${timestamp.toLocaleString()} - ${value.toLocaleString()} open pull requests`;
</script>

<VisXYContainer {data} height={250} class="area-graph">
  <VisArea {x} {y} color="#ab7df8" />
  <VisTooltip />
  <VisCrosshair {x} {y} {template} />
  <VisAxis tickFormat={tickFormatX} type="x" numTicks={6} gridLine={false} />
  <VisAxis tickFormat={tickFormatY} type="y" numTicks={4} gridLine={true} />
</VisXYContainer>
