<script lang="ts">
  import '$lib/app.css';
  import starData from '$lib/assets/data/star-data.json';
  import { VisAxis, VisCrosshair, VisArea, VisTooltip, VisXYContainer } from '@unovis/svelte';
  import { DateTime } from 'luxon';

  type DataRecord = [DateTime, number];

  const data = starData.map(([timestamp, value]) => [DateTime.fromSeconds(timestamp), value]);
  const x = ([timestamp]: DataRecord) => timestamp.toMillis();
  const y = ([, value]: DataRecord) => value;
  const tickFormatX = (value: number) => DateTime.fromMillis(value).toFormat('MMM yy');
  const tickFormatY = (i: number) =>
    new Intl.NumberFormat(navigator.language, { maximumSignificantDigits: 3 }).format(i);
  const template = ([timestamp, value]: DataRecord) =>
    `${timestamp.toLocaleString()} - ${value.toLocaleString()} discussions`;
</script>

<VisXYContainer {data} height={250} class="area-graph">
  <VisArea {x} {y} color="royalblue" />
  <!-- <VisBulletLegend {items} {onLegendItemClick} bulletSize="15px" /> -->
  <VisTooltip />
  <VisCrosshair {x} {y} {template} />
  <VisAxis tickFormat={tickFormatX} type="x" numTicks={6} gridLine={false} />
  <VisAxis tickFormat={tickFormatY} type="y" numTicks={4} gridLine={true} />
</VisXYContainer>
