<script lang="ts">
	import { getGanttContext, ZOOM_LEVELS } from '$lib/stores/gantt-store.svelte';
	import { getDateRange, diffDays, addDays, addMonths } from '$lib/utils/date-utils';
	import GanttHeader from './GanttHeader.svelte';
	import GanttGrid from './GanttGrid.svelte';
	import GanttTask from './GanttTask.svelte';
	import GanttDependency from './GanttDependency.svelte';

	const gantt = getGanttContext();

	// Layout constants
	const ROW_HEIGHT = 40;
	const HEADER_HEIGHT = 48;
	const SIDEBAR_WIDTH = 200;

	// Day width derived from current zoom level
	const dayWidth = $derived(gantt.currentZoom.dayWidth);

	// Minimum 3-month span constant
	const MIN_DAYS = 90;

	// Calculate date range with padding and minimum span
	const dateRange = $derived.by(() => {
		const taskRange = getDateRange(gantt.data.tasks);

		// Apply manual overrides if set
		let start = gantt.view.dateRangeStart ?? addDays(taskRange.start, -2);
		let end = gantt.view.dateRangeEnd ?? addDays(taskRange.end, 7);

		// Ensure minimum 3-month span
		const span = diffDays(start, end);
		if (span < MIN_DAYS) {
			// Extend end to meet minimum
			end = addDays(start, MIN_DAYS);
		}

		return { start, end };
	});

	const totalDays = $derived(diffDays(dateRange.start, dateRange.end) + 1);
	const chartWidth = $derived(totalDays * dayWidth);
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
					x: startOffset * dayWidth,
					y: rowIndex * ROW_HEIGHT + HEADER_HEIGHT,
					width: duration * dayWidth,
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

<div class="gantt-wrapper">
<div
	class="gantt-container relative overflow-auto bg-white rounded-lg border border-gray-200 shadow-sm flex"
	data-gantt-chart
	onclick={handleClick}
	role="application"
	aria-label="Gantt chart editor"
>
	<!-- Sidebar with section/task names (sticky to stay visible on horizontal scroll) -->
	<div
		class="gantt-sidebar sticky left-0 top-0 z-20 bg-white border-r border-gray-200 shrink-0"
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
		class="gantt-chart shrink-0"
		style:width="{chartWidth}px"
		style:height="{chartHeight}px"
	>
		<svg width={chartWidth} height={chartHeight} class="block">
			<!-- Grid -->
			<GanttGrid
				startDate={dateRange.start}
				{totalDays}
				{dayWidth}
				rowCount={totalRows}
				rowHeight={ROW_HEIGHT}
				headerHeight={HEADER_HEIGHT}
			/>

			<!-- Header -->
			<GanttHeader
				startDate={dateRange.start}
				{totalDays}
				{dayWidth}
				height={HEADER_HEIGHT}
				zoomLevel={gantt.view.zoomLevel}
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
					{dayWidth}
					isFocused={gantt.view.focusedTaskId === pos.task.id}
					isSelected={gantt.view.selectedTaskId === pos.task.id}
				/>
			{/each}
		</svg>

	</div>

	<!-- Extend buttons at edges -->
	<button
		class="extend-btn"
		style:left="{SIDEBAR_WIDTH + 8}px"
		onclick={() => gantt.extendRangeStart(1)}
		title="Extend timeline 1 month earlier"
	>
		-1mo
	</button>
	<button
		class="extend-btn extend-btn-right"
		onclick={() => gantt.extendRangeEnd(1)}
		title="Extend timeline 1 month later"
	>
		+1mo
	</button>
</div>

<!-- Zoom controls (outside scrollable area) -->
<div class="zoom-controls">
	<button
		onclick={() => gantt.zoomIn()}
		disabled={gantt.view.zoomLevel === 0}
		class="zoom-btn"
		title="Zoom in"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
		</svg>
	</button>
	<div class="zoom-levels">
		{#each ZOOM_LEVELS as level, i}
			<button
				class="zoom-level"
				class:active={gantt.view.zoomLevel === i}
				onclick={() => gantt.view.zoomLevel = i}
			>
				{level.name}
			</button>
		{/each}
	</div>
	<button
		onclick={() => gantt.zoomOut()}
		disabled={gantt.view.zoomLevel === ZOOM_LEVELS.length - 1}
		class="zoom-btn"
		title="Zoom out"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
		</svg>
	</button>
</div>
</div>

<style>
	.gantt-wrapper {
		display: flex;
		flex-direction: column;
	}

	.gantt-container {
		min-height: 400px;
		max-height: calc(100vh - 200px);
	}

	.gantt-chart {
		position: relative;
	}

	.extend-btn {
		position: absolute;
		top: 56px;
		padding: 4px 8px;
		font-size: 11px;
		font-weight: 500;
		color: #6b7280;
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		cursor: pointer;
		opacity: 0.5;
		transition: opacity 0.15s, background 0.15s;
		z-index: 25;
	}

	.extend-btn:hover {
		opacity: 1;
		background: #f3f4f6;
		color: #374151;
	}

	.extend-btn-right {
		right: 8px;
	}

	.zoom-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 12px;
		padding: 8px;
	}

	.zoom-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px;
		color: #6b7280;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.zoom-btn:hover:not(:disabled) {
		background: #f3f4f6;
		color: #374151;
	}

	.zoom-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.zoom-levels {
		display: flex;
		gap: 2px;
		background: #f3f4f6;
		padding: 2px;
		border-radius: 6px;
	}

	.zoom-level {
		padding: 4px 10px;
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		background: transparent;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.zoom-level:hover {
		color: #374151;
	}

	.zoom-level.active {
		background: white;
		color: #111827;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}
</style>
