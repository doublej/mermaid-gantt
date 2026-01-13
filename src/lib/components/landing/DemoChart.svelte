<script lang="ts">
	import { createGanttStore, setGanttContext } from '$lib/stores/gantt-store.svelte';
	import { createDemoData } from '$lib/data/demo-data';
	import GanttChart from '$lib/components/gantt/GanttChart.svelte';

	interface Props {
		interactive?: boolean;
		maxHeight?: string;
	}

	let { interactive = true, maxHeight = '340px' }: Props = $props();

	// Create isolated store with demo data
	const gantt = createGanttStore(createDemoData());
	setGanttContext(gantt);

	// Set to Week zoom for better landing page fit
	gantt.view.zoomLevel = 1;
</script>

<div
	class="demo-wrapper"
	class:non-interactive={!interactive}
	style:max-height={maxHeight}
>
	<GanttChart />
</div>

<style>
	.demo-wrapper {
		overflow: hidden;
		border-radius: var(--radius-card);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.demo-wrapper.non-interactive {
		pointer-events: none;
	}

	/* Constrain the chart height */
	.demo-wrapper :global(.gantt-container) {
		max-height: 100%;
	}
</style>
