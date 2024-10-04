<script lang="ts">
  import '$lib/app.css';
  import issueData from '$lib/assets/data/issue-data.json';
  import { VisAxis, VisCrosshair, VisArea, VisTooltip, VisXYContainer } from '@unovis/svelte';
  import { DateTime } from 'luxon';

  type DataRecord = [DateTime, number, number, number, number];

  const data = issueData.map(([timestamp, ...rest]) => [DateTime.fromSeconds(timestamp), ...rest]);
  const x = ([timestamp]: DataRecord) => timestamp.toMillis();
  const y = ([, , , total]: DataRecord) => total;
  const tickFormatX = (value: number) => DateTime.fromMillis(value).toFormat('MMM yy');
  const tickFormatY = (i: number) =>
    new Intl.NumberFormat(navigator.language, { maximumSignificantDigits: 3 }).format(i);
  const template = ([timestamp, value]: DataRecord) =>
    `${timestamp.toLocaleString()} - ${value.toLocaleString()} open issues`;
</script>

<VisXYContainer {data} height={250} class="area-graph">
  <VisArea {x} {y} color="#3fb950" />
  <VisTooltip />
  <VisCrosshair {x} {y} {template} />
  <VisAxis tickFormat={tickFormatX} type="x" numTicks={6} gridLine={false} />
  <VisAxis tickFormat={tickFormatY} type="y" numTicks={4} gridLine={true} />
</VisXYContainer>
