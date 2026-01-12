<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getDateRange, diffDays, addDays } from '$lib/utils/date-utils';
	import GanttHeader from './GanttHeader.svelte';
	import GanttGrid from './GanttGrid.svelte';
	import GanttTask from './GanttTask.svelte';
	import GanttDependency from './GanttDependency.svelte';

	const gantt = getGanttContext();

	// Layout constants
	const ROW_HEIGHT = 40;
	const HEADER_HEIGHT = 48;
	const SIDEBAR_WIDTH = 200;
	const DAY_WIDTH = 40;

	// Calculate date range with padding
	const dateRange = $derived.by(() => {
		const range = getDateRange(gantt.data.tasks);
		return {
			start: addDays(range.start, -2),
			end: addDays(range.end, 7)
		};
	});

	const totalDays = $derived(diffDays(dateRange.start, dateRange.end) + 1);
	const chartWidth = $derived(totalDays * DAY_WIDTH);
	// Total rows = sections + tasks
	const totalRows = $derived(gantt.data.sections.length + gantt.data.tasks.length);
	const chartHeight = $derived(totalRows * ROW_HEIGHT + HEADER_HEIGHT);

	// Calculate task positions (accounting for section header rows)
	const taskPositions = $derived.by(() => {
		const positions: { task: typeof gantt.data.tasks[0]; x: number; y: number; width: number; height: number }[] = [];
		let rowIndex = 0;

		for (const { section, tasks } of gantt.tasksBySection) {
			// Section header takes one row
			rowIndex++;

			// Each task in section
			for (const task of tasks) {
				const startOffset = diffDays(dateRange.start, task.startDate);
				const duration = diffDays(task.startDate, task.endDate) + 1;

				positions.push({
					task,
					x: startOffset * DAY_WIDTH,
					y: rowIndex * ROW_HEIGHT + HEADER_HEIGHT,
					width: duration * DAY_WIDTH,
					height: ROW_HEIGHT - 8
				});
				rowIndex++;
			}
		}

		return positions;
	});

	// Build position lookup for dependencies
	const positionMap = $derived(
		new Map(taskPositions.map((p) => [p.task.id, p]))
	);

	function handleClick(event: MouseEvent) {
		// Deselect when clicking on empty space
		const target = event.target as Element;
		if (target.closest('[data-task]')) return;
		gantt.view.selectedTaskId = null;
	}
</script>

<div
	class="gantt-container relative overflow-auto bg-white rounded-lg border border-gray-200 shadow-sm"
	data-gantt-chart
	onclick={handleClick}
	role="application"
	aria-label="Gantt chart editor"
>
	<!-- Sidebar with section/task names -->
	<div
		class="gantt-sidebar absolute left-0 top-0 z-20 bg-white border-r border-gray-200"
		style:width="{SIDEBAR_WIDTH}px"
		style:height="{chartHeight}px"
	>
		<!-- Header spacer -->
		<div
			class="flex items-center px-4 font-semibold text-gray-700 border-b border-gray-200 bg-gray-50"
			style:height="{HEADER_HEIGHT}px"
		>
			{gantt.data.config.title || 'Tasks'}
		</div>

		<!-- Task list -->
		{#each gantt.tasksBySection as { section, tasks }}
			<!-- Section header -->
			<div
				class="flex items-center px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100"
				style:height="{ROW_HEIGHT}px"
			>
				{section.name}
			</div>

			<!-- Tasks in section -->
			{#each tasks as task (task.id)}
				{@const isFocused = gantt.view.focusedTaskId === task.id}
				{@const isSelected = gantt.view.selectedTaskId === task.id}
				<button
					class="flex items-center w-full px-4 text-left text-sm truncate transition-colors
						{isFocused ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'}
						{isSelected ? 'ring-2 ring-inset ring-blue-500' : ''}"
					style:height="{ROW_HEIGHT}px"
					data-task-name={task.id}
					data-task-focused={isFocused || undefined}
					onclick={() => {
						gantt.view.focusedTaskId = task.id;
						gantt.view.selectedTaskId = task.id;
					}}
				>
					{task.title}
				</button>
			{/each}
		{/each}
	</div>

	<!-- Main chart area -->
	<div
		class="gantt-chart"
		style:margin-left="{SIDEBAR_WIDTH}px"
		style:width="{chartWidth}px"
		style:height="{chartHeight}px"
	>
		<svg width={chartWidth} height={chartHeight} class="block">
			<!-- Grid -->
			<GanttGrid
				startDate={dateRange.start}
				{totalDays}
				dayWidth={DAY_WIDTH}
				rowCount={totalRows}
				rowHeight={ROW_HEIGHT}
				headerHeight={HEADER_HEIGHT}
			/>

			<!-- Header -->
			<GanttHeader
				startDate={dateRange.start}
				{totalDays}
				dayWidth={DAY_WIDTH}
				height={HEADER_HEIGHT}
				zoom={gantt.view.zoom}
			/>

			<!-- Dependencies (behind tasks) -->
			{#each gantt.data.tasks as task (task.id)}
				{#each task.dependencies as depId (depId)}
					{@const fromPos = positionMap.get(depId)}
					{@const toPos = positionMap.get(task.id)}
					{#if fromPos && toPos}
						<GanttDependency
							fromX={fromPos.x + fromPos.width}
							fromY={fromPos.y + fromPos.height / 2 + 4}
							toX={toPos.x}
							toY={toPos.y + toPos.height / 2 + 4}
						/>
					{/if}
				{/each}
			{/each}

			<!-- Tasks -->
			{#each taskPositions as pos (pos.task.id)}
				<GanttTask
					task={pos.task}
					x={pos.x}
					y={pos.y + 4}
					width={pos.width}
					height={pos.height}
					isFocused={gantt.view.focusedTaskId === pos.task.id}
					isSelected={gantt.view.selectedTaskId === pos.task.id}
				/>
			{/each}
		</svg>
	</div>
</div>

<style>
	.gantt-container {
		min-height: 400px;
		max-height: calc(100vh - 200px);
	}
</style>
