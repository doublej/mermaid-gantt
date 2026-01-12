<script lang="ts">
	import type { Task } from '$lib/types';
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';

	interface Props {
		task: Task;
		x: number;
		y: number;
		width: number;
		height: number;
		dayWidth: number;
		isFocused: boolean;
		isSelected: boolean;
	}

	let { task, x, y, width, height, dayWidth, isFocused, isSelected }: Props = $props();

	const gantt = getGanttContext();

	// Status-based colors
	const colors = $derived.by(() => {
		switch (task.status) {
			case 'done':
				return { fill: '#6b7280', stroke: '#4b5563', text: '#ffffff' };
			case 'crit':
				return { fill: '#ef4444', stroke: '#dc2626', text: '#ffffff' };
			case 'milestone':
				return { fill: '#8b5cf6', stroke: '#7c3aed', text: '#ffffff' };
			case 'active':
			default:
				return { fill: '#3b82f6', stroke: '#2563eb', text: '#ffffff' };
		}
	});

	// Milestone is rendered as diamond
	const isMilestone = $derived(task.status === 'milestone');

	// Drag state
	type DragMode = 'none' | 'move' | 'resize-start' | 'resize-end';
	let dragMode = $state<DragMode>('none');
	let dragStartX = $state(0);
	let previewDelta = $state(0);

	const isDragging = $derived(dragMode !== 'none');
	const EDGE_WIDTH = 8;

	// Preview positions during drag
	const previewX = $derived.by(() => {
		if (dragMode === 'move') return x + previewDelta;
		if (dragMode === 'resize-start') return x + previewDelta;
		return x;
	});

	const previewWidth = $derived.by(() => {
		if (dragMode === 'move') return width;
		if (dragMode === 'resize-start') return Math.max(dayWidth, width - previewDelta);
		if (dragMode === 'resize-end') return Math.max(dayWidth, width + previewDelta);
		return width;
	});

	function cleanupDragListeners() {
		window.removeEventListener('mousemove', handleDrag);
		window.removeEventListener('mouseup', endDrag);
		window.removeEventListener('keydown', handleEscape);
	}

	function resetDragState() {
		dragMode = 'none';
		previewDelta = 0;
	}

	function startDrag(event: MouseEvent, mode: DragMode) {
		event.stopPropagation();
		event.preventDefault();
		dragMode = mode;
		dragStartX = event.clientX;
		previewDelta = 0;
		window.addEventListener('mousemove', handleDrag);
		window.addEventListener('mouseup', endDrag);
		window.addEventListener('keydown', handleEscape);
	}

	function handleDrag(event: MouseEvent) {
		const rawDelta = event.clientX - dragStartX;
		previewDelta = Math.round(rawDelta / dayWidth) * dayWidth;
	}

	function endDrag() {
		cleanupDragListeners();
		const daysMoved = Math.round(previewDelta / dayWidth);
		if (daysMoved !== 0) {
			if (dragMode === 'move') gantt.moveTask(task.id, daysMoved);
			else if (dragMode === 'resize-start') gantt.moveTaskStart(task.id, daysMoved);
			else if (dragMode === 'resize-end') gantt.moveTaskEnd(task.id, daysMoved);
		}
		resetDragState();
	}

	function handleEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			cleanupDragListeners();
			resetDragState();
		}
	}

	function handleClick(event: MouseEvent) {
		if (isDragging) return;
		event.stopPropagation();
		gantt.view.focusedTaskId = task.id;
		gantt.view.selectedTaskId = task.id;
	}

	function handleDoubleClick(event: MouseEvent) {
		event.stopPropagation();
		gantt.view.editingTaskId = task.id;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			gantt.view.selectedTaskId = task.id;
		}
	}
</script>

<g
	class="gantt-task"
	data-task={task.id}
	data-task-focused={isFocused || undefined}
	data-task-selected={isSelected || undefined}
	onclick={handleClick}
	ondblclick={handleDoubleClick}
	onkeydown={handleKeyDown}
	role="button"
	aria-label="{task.title}, {task.startDate.toLocaleDateString()} to {task.endDate.toLocaleDateString()}"
	aria-pressed={isSelected}
	tabindex={isFocused ? 0 : -1}
>
	{#if isMilestone}
		<!-- Milestone diamond -->
		{@const centerX = previewX + previewWidth / 2}
		{@const centerY = y + height / 2}
		{@const size = height / 2}

		<!-- Ghost during drag -->
		{#if isDragging}
			{@const origCenterX = x + width / 2}
			<polygon
				points="{origCenterX},{centerY - size} {origCenterX + size},{centerY} {origCenterX},{centerY + size} {origCenterX - size},{centerY}"
				fill={colors.fill}
				opacity="0.3"
				stroke="none"
			/>
		{/if}

		<polygon
			points="{centerX},{centerY - size} {centerX + size},{centerY} {centerX},{centerY + size} {centerX - size},{centerY}"
			fill={colors.fill}
			stroke={isSelected ? '#1d4ed8' : isFocused ? '#60a5fa' : colors.stroke}
			stroke-width={isSelected ? 3 : isFocused ? 2 : 1}
			class:opacity-80={isDragging}
		/>

		<!-- Move handle (whole diamond) -->
		<polygon
			points="{centerX},{centerY - size} {centerX + size},{centerY} {centerX},{centerY + size} {centerX - size},{centerY}"
			fill="transparent"
			class="cursor-grab"
			onmousedown={(e) => startDrag(e, 'move')}
		/>
	{:else}
		<!-- Ghost during drag -->
		{#if isDragging}
			<rect
				{x}
				{y}
				{width}
				{height}
				rx="4"
				fill={colors.fill}
				opacity="0.3"
				stroke="none"
			/>
		{/if}

		<!-- Task bar -->
		<rect
			x={previewX}
			{y}
			width={previewWidth}
			{height}
			rx="4"
			fill={colors.fill}
			stroke={isSelected ? '#1d4ed8' : isFocused ? '#60a5fa' : colors.stroke}
			stroke-width={isSelected ? 3 : isFocused ? 2 : 1}
			class="transition-colors duration-150"
			class:opacity-80={isDragging}
		/>

		<!-- Progress overlay for done tasks -->
		{#if task.status === 'done'}
			<rect
				x={previewX}
				{y}
				width={previewWidth}
				{height}
				rx="4"
				fill="url(#done-pattern)"
				opacity="0.2"
			/>
		{/if}

		<!-- Task label (if width allows) -->
		{#if previewWidth > 60}
			<text
				x={previewX + 8}
				y={y + height / 2 + 4}
				fill={colors.text}
				class="text-xs font-medium pointer-events-none"
				style:text-shadow="0 1px 2px rgba(0,0,0,0.2)"
			>
				{task.title.length > Math.floor(previewWidth / 8) - 2
					? task.title.slice(0, Math.floor(previewWidth / 8) - 2) + '...'
					: task.title}
			</text>
		{/if}

		<!-- Hit zones for dragging -->
		<!-- Left resize handle -->
		<rect
			x={previewX}
			{y}
			width={EDGE_WIDTH}
			{height}
			fill="transparent"
			class="cursor-ew-resize"
			onmousedown={(e) => startDrag(e, 'resize-start')}
		/>

		<!-- Center move area -->
		<rect
			x={previewX + EDGE_WIDTH}
			{y}
			width={Math.max(0, previewWidth - EDGE_WIDTH * 2)}
			{height}
			fill="transparent"
			class="cursor-grab"
			onmousedown={(e) => startDrag(e, 'move')}
		/>

		<!-- Right resize handle -->
		<rect
			x={previewX + previewWidth - EDGE_WIDTH}
			{y}
			width={EDGE_WIDTH}
			{height}
			fill="transparent"
			class="cursor-ew-resize"
			onmousedown={(e) => startDrag(e, 'resize-end')}
		/>
	{/if}

	<!-- Focus ring -->
	{#if isFocused && !isDragging}
		<rect
			x={previewX - 2}
			y={y - 2}
			width={previewWidth + 4}
			height={height + 4}
			rx="6"
			fill="none"
			stroke="#3b82f6"
			stroke-width="2"
			stroke-dasharray="4 2"
			class="animate-pulse"
		/>
	{/if}
</g>

<!-- Pattern for done tasks -->
<defs>
	<pattern id="done-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
		<path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="#ffffff" stroke-width="1" />
	</pattern>
</defs>
