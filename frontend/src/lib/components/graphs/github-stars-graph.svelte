<script lang="ts">
  import '$lib/app.css';
  import { VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/svelte';
  import { DateTime } from 'luxon';

  type DataRecord = [DateTime, number];

  type Props = {
    data: DataRecord[];
  };

  const { data }: Props = $props();

  const x = ([timestamp]: DataRecord) => timestamp.toMillis();
  const y = ([, value]: DataRecord) => value;
  const tickFormatX = (value: number) => DateTime.fromMillis(value).toFormat('MMM yy');
  const tickFormatY = (i: number) =>
    new Intl.NumberFormat(navigator.language, { maximumSignificantDigits: 3 }).format(i);
  const template = ([timestamp, value]: DataRecord) =>
    `${timestamp.toLocaleString()} - ${value.toLocaleString()} stars`;
</script>

<VisXYContainer {data} height={250} class="area-graph">
  <VisLine {x} {y} color="#ffc501" />
  <VisTooltip />
  <VisCrosshair {x} {y} {template} />
  <VisAxis tickFormat={tickFormatX} type="x" numTicks={6} gridLine />
  <VisAxis tickFormat={tickFormatY} type="y" numTicks={4} gridLine />
</VisXYContainer>
