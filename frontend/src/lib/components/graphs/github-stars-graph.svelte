<script lang="ts">
  import '$lib/app.css';
  import { DateTime } from 'luxon';

  import { onMount } from 'svelte';
  import uPlot from 'uplot';

  type DataRecord = [DateTime, number];
  type Colors = 'yellow' | 'green' | 'purple' | 'blue';

  type Props = {
    id: string;
    label: string;
    data: DataRecord[];
    cursorOpts: uPlot.Cursor;
    color: Colors;
  };

  const { id, data, cursorOpts, label, color }: Props = $props();

  let chartElement: HTMLDivElement | undefined = $state();
  let tooltip: HTMLDivElement | undefined = $state();
  let chartWidth: number = $state(0);
  let chartHeight: number = $state(0);
  let chartId = $state('');

  let colors = {
    yellow: 'rgb(255, 197, 0)',
    green: 'rgb(70, 183, 83)',
    purple: 'rgb(172, 124, 249)',
    blue: 'rgb(63, 106, 222)',
  };

  let areaColor = {
    yellow: 'rgba(255, 197, 0, 0.1)',
    green: 'rgba(70, 183, 83, 0.1)',
    purple: 'rgba(172, 124, 249, 0.1)',
    blue: 'rgba(63, 106, 222, 0.1)',
  };

  let tooltipDate = $state('');
  let tooltipValue = $state('');

  onMount(() => {
    if (!chartElement) return;

    const xAxis: number[] = [];
    const yAxis: number[] = [];

    data.forEach((d) => {
      xAxis.push(d[0].toMillis() / 1000);
      yAxis.push(d[1]);
    });

    const formatData: uPlot.AlignedData = [new Float64Array(xAxis), new Float64Array(yAxis)];

    const opts: uPlot.Options = {
      id,
      padding: [16, 16, 16, 16],
      cursor: cursorOpts,
      width: 500,
      height: 500,
      scales: {},
      legend: {
        show: true,
      },
      series: [
        {
          value: '{YYYY}-{MM}-{DD}',
          label: 'Date',
        },
        {
          show: true,
          spanGaps: false,
          stroke: colors[color],
          width: 2,
          fill: areaColor[color],
          label,
        },
      ],

      hooks: {
        setCursor: [
          (u) => {
            if (u.root.id != chartId || !tooltip) {
              return;
            }

            const { left, top, idx } = u.cursor;
            if (idx == null) {
              return;
            }

            const date = new Date(u.data[0][idx] * 1000).toLocaleDateString();
            const value = u.data[1][idx];

            tooltip.style.left = `${left ? left - 25 : 0}px`;
            tooltip.style.top = `${top ? top - 20 : 0}px`;
            tooltip.style.display = 'block';

            tooltipDate = date;
            tooltipValue = value?.toString() || '';
          },
        ],
        setSeries: [
          () => {
            if (tooltip) {
              tooltip.style.display = 'none';
            }
          },
        ],
      },
    };

    const plot = new uPlot(opts, formatData, chartElement);
    plot.setSize({ width: chartWidth, height: chartHeight });
  });
</script>

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  {id}
  class="h-[275px] w-full mb-16 relative"
  bind:clientWidth={chartWidth}
  bind:clientHeight={chartHeight}
  bind:this={chartElement}
  onmouseover={() => {
    chartId = id;
  }}
  onmouseout={() => {
    chartId = '';
  }}
>
  <div
    bind:this={tooltip}
    class="absolute bg-gray-100 shadow-md text-black text-xs rounded-lg p-2 px-3 hidden text-center font-mono"
  >
    <p>
      {tooltipDate}
    </p>

    <p class="font-bold">{tooltipValue}</p>
  </div>
</div>
