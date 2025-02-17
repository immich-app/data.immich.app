<script lang="ts">
  import '$lib/app.css';

  import { DateTime } from 'luxon';
  import { onMount } from 'svelte';
  import uPlot from 'uplot';

  type DataRecord = [DateTime, number];

  type Props = {
    data: DataRecord[];
    cursorOpts: uPlot.Cursor;
  };

  const { data, cursorOpts }: Props = $props();

  let chartElement: HTMLDivElement | undefined = $state();
  let chartWidth: number = $state(0);
  let chartHeight: number = $state(0);

  onMount(() => {
    if (!chartElement) return;
    // floats
    const xAxis: number[] = [];
    const yAxis: number[] = [];
    data.forEach((d) => {
      xAxis.push(d[0].toMillis() / 1000);
      yAxis.push(d[1]);
    });

    const formatData = [xAxis, yAxis];

    const opts: uPlot.Options = {
      padding: [16, 16, 16, 16],
      cursor: cursorOpts,
      width: 500,
      height: 500,
      scales: {},
      legend: {
        show: true,
      },
      axes: [
        {
          show: true,
          scale: 'x',
          values: (self, splits) => splits.map((split) => DateTime.fromMillis(split * 1000).toFormat('MMM yy')),
        },
        {
          show: true,
          scale: 'y',
          values: (self, splits) => splits.map((split) => split.toLocaleString()),
        },
      ],
      series: [
        {},
        {
          show: true,
          spanGaps: false,
          stroke: 'red',
          width: 1,
          fill: 'rgba(255, 0, 0, 0.1)',
        },
      ],
    };

    const plot = new uPlot(opts, formatData, chartElement);
    plot.setSize({ width: chartWidth, height: chartHeight });
  });
</script>

<div
  id="chart-id"
  class="h-[250px] w-full mb-8"
  bind:clientWidth={chartWidth}
  bind:clientHeight={chartHeight}
  bind:this={chartElement}
></div>
