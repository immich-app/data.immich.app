<script lang="ts">
  import '$lib/app.css';
  import { debounce } from '$lib/utils';
  import { Theme, theme } from '@immich/ui';
  import { DateTime } from 'luxon';
  import { onMount } from 'svelte';
  import uPlot, { type Axis } from 'uplot';

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
  let tooltipElement: HTMLDivElement | undefined = $state();
  let chartWidth: number = $state(0);
  let chartHeight: number = $state(0);
  let chartId = $state('');
  let tooltipDate = $state('');
  let tooltipValue = $state('');
  let mousePosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });

  const xAxis: number[] = [];
  const yAxis: number[] = [];

  for (const [date, value] of data) {
    xAxis.push(date.toMillis() / 1000);
    yAxis.push(value);
  }

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

  let plot: uPlot;

  let isDark = $derived(theme.value === Theme.Dark);

  const hideTooltipElement = () => {
    tooltipDate = '';
    tooltipValue = '';
    if (tooltipElement) {
      tooltipElement.style.display = 'none';
    }
  };

  const showTooltipElement = () => {
    if (tooltipElement) {
      tooltipElement.style.display = 'block';
    }
  };

  onMount(() => {
    if (!chartElement) {
      return;
    }

    const formatData: uPlot.AlignedData = [new Float64Array(xAxis), new Float64Array(yAxis)];

    const axis: Axis = {
      stroke: () => (isDark ? '#ccc' : 'black'),
      ticks: {
        stroke: () => (isDark ? '#444' : '#ddd'),
      },
      grid: {
        show: false,
      },
    };

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

      axes: [axis, axis],

      hooks: {
        setCursor: [
          (u) => {
            if (u.root.id != chartId || !tooltipElement) {
              return;
            }

            const { idx } = u.cursor;

            if (idx == null) {
              hideTooltipElement();
              return;
            }

            const date = new Date(u.data[0][idx] * 1000).toLocaleDateString();
            const value = u.data[1][idx];

            tooltipDate = date;
            tooltipValue = value?.toLocaleString() || '';

            showTooltipElement();
          },
        ],
        setSeries: [() => hideTooltipElement()],
      },
    };

    plot = new uPlot(opts, formatData, chartElement);
    plot.setSize({ width: chartWidth, height: chartHeight });
  });

  $effect(() => {
    if (plot && theme.value) {
      plot.redraw(false);
    }
  });

  const onResize = debounce(() => {
    plot?.setSize({ width: chartWidth, height: chartHeight });
  }, 150);

  const onMouseMove = (event: MouseEvent) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  };
</script>

<svelte:window onresize={onResize} onmousemove={onMouseMove} />

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="h-[275px] mb-10 w-full relative"
  bind:clientWidth={chartWidth}
  bind:clientHeight={chartHeight}
  bind:this={chartElement}
  onmouseover={() => {
    showTooltipElement();
    chartId = id;
  }}
  onmouseleave={() => {
    hideTooltipElement();
    chartId = '';
  }}
></div>
<div
  bind:this={tooltipElement}
  style="top: {mousePosition.y - 32}px; left: {mousePosition.x - 112}px"
  class="absolute border shadow-md text-xs w-[100px] rounded-lg bg-light py-2 px-3 text-center font-mono {chartId &&
  tooltipValue
    ? ''
    : 'hidden'}"
>
  <p>{tooltipDate}</p>
  <p class="font-bold">{tooltipValue}</p>
</div>
