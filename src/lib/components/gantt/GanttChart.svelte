<script lang="ts">
	import { onMount } from 'svelte';
	import { getGanttContext, ZOOM_LEVELS } from '$lib/stores/gantt-store.svelte';
	import { getDateRange, diffDays, addDays, addMonths } from '$lib/utils/date-utils';
	import GanttHeader from './GanttHeader.svelte';
	import GanttGrid from './GanttGrid.svelte';
	import GanttTask from './GanttTask.svelte';
	import GanttDependency from './GanttDependency.svelte';
	import ContextMenu from '../ui/ContextMenu.svelte';
	import type { MenuItem } from '$lib/types';

	const gantt = getGanttContext();

	// Container ref for wheel event listener
	let containerEl: HTMLDivElement | undefined = $state();

	// Track collapsed parent tasks
	let collapsedTasks = $state(new Set<string>());

	// Context menu state (lifted from GanttTask since it renders inside SVG)
	let contextMenuOpen = $state(false);
	let contextMenuX = $state(0);
	let contextMenuY = $state(0);
	let contextMenuItems = $state<MenuItem[]>([]);

	function handleTaskContextMenu(taskId: string, x: number, y: number, items: MenuItem[]) {
		contextMenuX = x;
		contextMenuY = y;
		contextMenuItems = items;
		contextMenuOpen = true;
	}

	function closeContextMenu() {
		contextMenuOpen = false;
	}

	// Layout constants
	const ROW_HEIGHT = 40;
	const HEADER_HEIGHT = 48;
	const SIDEBAR_WIDTH = 200;

	// Day width from store (supports smooth zoom)
	const dayWidth = $derived(gantt.view.dayWidth);

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

	// Task lookup map for O(1) parent lookups
	const taskMap = $derived(new Map(gantt.data.tasks.map(t => [t.id, t])));

	// Filter visible tasks (accounting for collapsed parents)
	const visibleTaskIds = $derived.by(() => {
		const visible = new Set<string>();
		for (const task of gantt.data.tasks) {
			// Check if any ancestor is collapsed
			let isHidden = false;
			let current = task;
			while (current.parentId) {
				if (collapsedTasks.has(current.parentId)) {
					isHidden = true;
					break;
				}
				const parent = taskMap.get(current.parentId);
				if (!parent) break;
				current = parent;
			}
			if (!isHidden) visible.add(task.id);
		}
		return visible;
	});

	// Total rows = sections + visible tasks
	const totalRows = $derived(
		gantt.data.sections.length + visibleTaskIds.size
	);
	const chartHeight = $derived(totalRows * ROW_HEIGHT + HEADER_HEIGHT);

	// Calculate task positions (accounting for section header rows and collapsed tasks)
	const taskPositions = $derived.by(() => {
		const positions: { task: typeof gantt.data.tasks[0]; x: number; y: number; width: number; height: number }[] = [];
		let rowIndex = 0;

		for (const { section, tasks } of gantt.tasksBySection) {
			// Section header takes one row
			rowIndex++;

			// Each visible task in section
			for (const task of tasks) {
				if (!visibleTaskIds.has(task.id)) continue;

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

	// Check if a task is visible (not hidden by collapsed parent)
	function isTaskVisible(taskId: string): boolean {
		let task = gantt.data.tasks.find(t => t.id === taskId);
		while (task?.parentId) {
			if (collapsedTasks.has(task.parentId)) return false;
			task = gantt.data.tasks.find(t => t.id === task!.parentId);
		}
		return true;
	}

	// Check if a task has visible children
	function hasChildren(taskId: string): boolean {
		return gantt.getChildTasks(taskId).length > 0;
	}

	// Toggle collapse state
	function toggleCollapse(taskId: string, event: MouseEvent) {
		event.stopPropagation();
		const newSet = new Set(collapsedTasks);
		if (newSet.has(taskId)) {
			newSet.delete(taskId);
		} else {
			newSet.add(taskId);
		}
		collapsedTasks = newSet;
	}

	function handleWheel(event: WheelEvent) {
		// Only zoom on Ctrl+wheel (or Cmd+wheel on Mac)
		if (!event.ctrlKey && !event.metaKey) return;
		event.preventDefault();

		// Calculate zoom based on scroll direction
		const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1; // Zoom out/in
		const newDayWidth = gantt.view.dayWidth * zoomFactor;

		// Apply smooth zoom
		gantt.setDayWidth(newDayWidth);
	}

	// Attach wheel listener with passive: false to allow preventDefault
	onMount(() => {
		if (containerEl) {
			containerEl.addEventListener('wheel', handleWheel, { passive: false });
			return () => containerEl?.removeEventListener('wheel', handleWheel);
		}
	});

	function handleClick(event: MouseEvent) {
		// Deselect when clicking on empty space
		const target = event.target as Element;
		if (target.closest('[data-task]')) return;
		gantt.view.selectedTaskId = null;
	}

	function handleTaskRowClick(taskId: string, event: MouseEvent) {
		// Handle multi-select with Ctrl/Cmd and Shift
		if (event.ctrlKey || event.metaKey) {
			gantt.selectTask(taskId, true);
		} else if (event.shiftKey && gantt.view.selectedTaskId) {
			gantt.selectTaskRange(gantt.view.selectedTaskId, taskId);
		} else {
			gantt.selectTask(taskId, false);
		}
	}
</script>

<div class="gantt-wrapper">
<div
	bind:this={containerEl}
	class="gantt-container"
	data-gantt-chart
	onclick={handleClick}
	role="application"
	aria-label="Gantt chart editor"
>
	<!-- Sidebar with section/task names (sticky to stay visible on horizontal scroll) -->
	<div
		class="gantt-sidebar"
		style:width="{SIDEBAR_WIDTH}px"
		style:height="{chartHeight}px"
	>
		<!-- Header spacer -->
		<div
			class="sidebar-header"
			style:height="{HEADER_HEIGHT}px"
		>
			{gantt.data.config.title || 'Tasks'}
		</div>

		<!-- Task list -->
		{#each gantt.tasksBySection as { section, tasks }}
			<!-- Section header -->
			<div
				class="section-header"
				style:height="{ROW_HEIGHT}px"
			>
				{section.name}
			</div>

			<!-- Tasks in section -->
			{#each tasks as task (task.id)}
				{@const isFocused = gantt.view.focusedTaskId === task.id}
				{@const isSelected = gantt.view.selectedTaskId === task.id}
				{@const isInMultiSelect = gantt.view.selectedTaskIds.length > 1 && gantt.view.selectedTaskIds.includes(task.id)}
				{@const level = gantt.getTaskLevel(task.id)}
				{@const taskHasChildren = hasChildren(task.id)}
				{@const isCollapsed = collapsedTasks.has(task.id)}
				{#if isTaskVisible(task.id)}
					<button
						class="task-row"
						class:focused={isFocused}
						class:selected={isSelected}
						class:multi-selected={isInMultiSelect}
						style:height="{ROW_HEIGHT}px"
						style:padding-left="{1 + level * 1}rem"
						data-task-name={task.id}
						data-task-focused={isFocused || undefined}
						onclick={(e) => handleTaskRowClick(task.id, e)}
					>
						<!-- Expand/collapse chevron for parent tasks -->
						{#if taskHasChildren}
							<button
								class="chevron-btn"
								class:collapsed={isCollapsed}
								onclick={(e) => toggleCollapse(task.id, e)}
								aria-label={isCollapsed ? 'Expand' : 'Collapse'}
							>
								<svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
						{:else}
							<span class="chevron-spacer"></span>
						{/if}

						<!-- Color dot -->
						{#if task.color}
							<span class="color-dot" style:background-color={task.color}></span>
						{/if}

						<!-- Task title -->
						<span class="task-title">{task.title}</span>
					</button>
				{/if}
			{/each}
		{/each}
	</div>

	<!-- Main chart area -->
	<div
		class="gantt-chart"
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
					isInMultiSelect={gantt.view.selectedTaskIds.length > 1 && gantt.view.selectedTaskIds.includes(pos.task.id)}
					onContextMenu={handleTaskContextMenu}
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

<!-- Context menu (rendered outside SVG) -->
{#if contextMenuOpen}
	<ContextMenu
		items={contextMenuItems}
		x={contextMenuX}
		y={contextMenuY}
		onClose={closeContextMenu}
	/>
{/if}

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
		position: relative;
		display: flex;
		overflow: auto;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
		min-height: 400px;
		max-height: calc(100vh - 200px);
	}

	.gantt-sidebar {
		position: sticky;
		left: 0;
		top: 0;
		z-index: 20;
		background-color: var(--color-surface);
		border-right: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		padding-left: 1rem;
		padding-right: 1rem;
		font-weight: 600;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.section-header {
		display: flex;
		align-items: center;
		padding: 0.25rem 1rem;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-tertiary);
		background-color: var(--color-surface-elevated);
		border-bottom: 1px solid var(--color-border);
	}

	.task-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding-right: 1rem;
		text-align: left;
		font-size: 0.875rem;
		color: var(--color-text);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.task-row:hover {
		background-color: var(--color-surface-elevated);
	}

	.task-row.focused {
		background-color: var(--color-accent-subtle);
		color: var(--color-accent);
	}

	.task-row.selected {
		box-shadow: inset 0 0 0 2px var(--color-accent);
	}

	.task-row.multi-selected {
		background-color: var(--color-accent-subtle);
		box-shadow: inset 0 0 0 1px var(--color-accent);
	}

	.task-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1rem;
		height: 1rem;
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--color-text-secondary);
		transition: transform 0.15s, color 0.15s;
	}

	.chevron-btn:hover {
		color: var(--color-text);
	}

	.chevron-btn.collapsed {
		transform: rotate(-90deg);
	}

	.chevron-icon {
		width: 0.75rem;
		height: 0.75rem;
	}

	.chevron-spacer {
		width: 1rem;
		flex-shrink: 0;
	}

	.color-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.gantt-chart {
		position: relative;
		flex-shrink: 0;
	}

	.extend-btn {
		position: absolute;
		top: 56px;
		padding: 4px 8px;
		font-size: 11px;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		cursor: pointer;
		opacity: 0.5;
		transition: opacity 0.15s, background 0.15s;
		z-index: 25;
	}

	.extend-btn:hover {
		opacity: 1;
		background: var(--color-surface-elevated);
		color: var(--color-text);
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
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.zoom-btn:hover:not(:disabled) {
		background: var(--color-surface-elevated);
		color: var(--color-text);
	}

	.zoom-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.zoom-levels {
		display: flex;
		gap: 2px;
		background: var(--color-surface-elevated);
		padding: 2px;
		border-radius: 6px;
	}

	.zoom-level {
		padding: 4px 10px;
		font-size: 12px;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: transparent;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.zoom-level:hover {
		color: var(--color-text);
	}

	.zoom-level.active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}
</style>
