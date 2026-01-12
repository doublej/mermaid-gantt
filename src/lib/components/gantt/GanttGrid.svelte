<script lang="ts">
	import { addDays, isWeekend } from '$lib/utils/date-utils';

	interface Props {
		startDate: Date;
		totalDays: number;
		dayWidth: number;
		rowCount: number;
		rowHeight: number;
		headerHeight: number;
	}

	let { startDate, totalDays, dayWidth, rowCount, rowHeight, headerHeight }: Props = $props();

	const gridHeight = $derived(rowCount * rowHeight);
	const totalWidth = $derived(totalDays * dayWidth);

	// Generate vertical lines and weekend backgrounds
	const verticalLines = $derived.by(() => {
		const lines: { x: number; isWeekend: boolean }[] = [];
		for (let i = 0; i <= totalDays; i++) {
			const date = addDays(startDate, i);
			lines.push({
				x: i * dayWidth,
				isWeekend: isWeekend(date)
			});
		}
		return lines;
	});

	// Today marker
	const todayOffset = $derived.by(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const start = new Date(startDate);
		start.setHours(0, 0, 0, 0);
		const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		return diff >= 0 && diff <= totalDays ? diff : null;
	});
</script>

<g class="gantt-grid">
	<!-- Row backgrounds (alternating) -->
	{#each Array(rowCount) as _, i}
		<rect
			x="0"
			y={headerHeight + i * rowHeight}
			width={totalWidth}
			height={rowHeight}
			fill={i % 2 === 0 ? '#ffffff' : '#fafafa'}
		/>
	{/each}

	<!-- Weekend backgrounds -->
	{#each verticalLines as { x, isWeekend: weekend }, i}
		{#if weekend && i < totalDays}
			<rect
				{x}
				y={headerHeight}
				width={dayWidth}
				height={gridHeight}
				fill="#f9fafb"
				opacity="0.7"
			/>
		{/if}
	{/each}

	<!-- Vertical lines -->
	{#each verticalLines as { x }}
		<line
			x1={x}
			y1={headerHeight}
			x2={x}
			y2={headerHeight + gridHeight}
			stroke="#e5e7eb"
			stroke-width="1"
		/>
	{/each}

	<!-- Horizontal lines -->
	{#each Array(rowCount + 1) as _, i}
		<line
			x1="0"
			y1={headerHeight + i * rowHeight}
			x2={totalWidth}
			y2={headerHeight + i * rowHeight}
			stroke="#e5e7eb"
			stroke-width="1"
		/>
	{/each}

	<!-- Today marker -->
	{#if todayOffset !== null}
		<line
			x1={todayOffset * dayWidth + dayWidth / 2}
			y1={headerHeight}
			x2={todayOffset * dayWidth + dayWidth / 2}
			y2={headerHeight + gridHeight}
			stroke="#ef4444"
			stroke-width="2"
			stroke-dasharray="4 4"
		/>
		<circle
			cx={todayOffset * dayWidth + dayWidth / 2}
			cy={headerHeight}
			r="4"
			fill="#ef4444"
		/>
	{/if}
</g>
