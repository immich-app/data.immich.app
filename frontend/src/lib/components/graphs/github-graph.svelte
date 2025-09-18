<script lang="ts">
  import '$lib/app.css';
  import { debounce } from '$lib/utils';
  import { LoadingSpinner, Theme, theme } from '@immich/ui';
  import uPlot, { type Axis } from 'uplot';

  type DataRecord = [number, number];
  type Colors = 'yellow' | 'green' | 'purple' | 'blue' | 'orange';

  type Props = {
    id: string;
    label: string;
    data?: DataRecord[];
    cursorOpts: uPlot.Cursor;
    color: Colors;
  };

  const { id, data, cursorOpts, label, color }: Props = $props();

  let chartElement: HTMLDivElement | undefined = $state();
  let tooltipElement: HTMLDivElement | undefined = $state();
  let chartId = $state('');
  let tooltipDate = $state('');
  let tooltipValue = $state('');
  let mousePosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });
  let isDark = $derived(theme.value === Theme.Dark);

  let plot: uPlot;

  let colors = {
    yellow: 'rgb(255, 197, 0)',
    green: 'rgb(70, 183, 83)',
    purple: 'rgb(172, 124, 249)',
    blue: 'rgb(63, 106, 222)',
    orange: 'rgb(255, 69, 0)',
  };

  let areaColor = {
    yellow: 'rgba(255, 197, 0, 0.1)',
    green: 'rgba(70, 183, 83, 0.1)',
    purple: 'rgba(172, 124, 249, 0.1)',
    blue: 'rgba(63, 106, 222, 0.1)',
    orange: 'rgba(255, 69, 0, 0.1)',
  };

  const axis: Axis = {
    stroke: () => (isDark ? '#ccc' : 'black'),
    ticks: {
      stroke: () => (isDark ? '#444' : '#ddd'),
    },
    grid: {
      show: false,
    },
  };

  const setLegendToLatest = (u: uPlot) => {
    if (u.data && u.data[0].length > 0) {
      const latestIdx = u.data[0].length - 1;
      u.setLegend({ idx: latestIdx }, false);
    }
  };

  const options: uPlot.Options = {
    id,
    padding: [8, 8, 8, 8],
    cursor: cursorOpts,
    width: 500,
    height: 300,
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
        stroke: () => colors[color],
        width: 2,
        fill: () => areaColor[color],
        label,
      },
    ],

    axes: [axis, axis],

    hooks: {
      setCursor: [(u) => setCursorHook(u)],
      ready: [(u) => setLegendToLatest(u)],
    },
  };

  const setCursorHook = (u: uPlot) => {
    const { idx } = u.cursor;

    if (idx == null) {
      setLegendToLatest(u);
      if (u.root.id === chartId) {
        hideTooltipElement();
      }
      return;
    }

    if (u.root.id === chartId && tooltipElement) {
      const date = new Date(u.data[0][idx] * 1000).toLocaleDateString();
      const value = u.data[1][idx];

      tooltipDate = date;
      tooltipValue = value?.toLocaleString() || '';

      showTooltipElement();
    }
  };

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

  const onDataChange = (data?: DataRecord[]) => {
    if (!data || !chartElement) {
      return;
    }

    const xAxis: number[] = [];
    const yAxis: number[] = [];

    plot?.destroy();

    for (const [date, value] of data) {
      xAxis.push(date);
      yAxis.push(value);
    }

    plot = new uPlot(options, [new Float64Array(xAxis), new Float64Array(yAxis)], chartElement);
    plot.setSize({ width: chartElement.clientWidth, height: chartElement.clientHeight });
  };

  const onThemeChange = () => plot?.redraw(false);

  $effect(() => onDataChange(data));
  $effect(() => theme.value && onThemeChange());

  const onresize = debounce(() => {
    if (chartElement && plot) {
      plot.setSize({ width: chartElement.clientWidth, height: chartElement.clientHeight });
    }
  }, 150);

  const onmousemove = (event: MouseEvent) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  };
</script>

<svelte:window {onresize} {onmousemove} />

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="h-[275px] my-2">
  <div
    class="h-full w-full relative flex items-center justify-center"
    bind:this={chartElement}
    onmouseover={() => {
      showTooltipElement();
      chartId = id;
    }}
    onmouseleave={() => {
      hideTooltipElement();
      chartId = '';
    }}
  >
    {#if !data}
      <LoadingSpinner size="giant" />
    {/if}
  </div>
  <div
    bind:this={tooltipElement}
    style="top: {mousePosition.y - 32}px; left: {mousePosition.x - 112}px"
    class:hidden={!(chartId && tooltipValue)}
    class="absolute border shadow-md text-xs w-[100px] rounded-lg bg-light py-2 px-3 text-center font-mono"
  >
    <p>{tooltipDate}</p>
    <p class="font-bold">{tooltipValue}</p>
  </div>
</div>
