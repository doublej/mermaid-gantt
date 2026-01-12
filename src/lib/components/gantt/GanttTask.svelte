<script lang="ts">
	import type { Task } from '$lib/types';
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';

	interface Props {
		task: Task;
		x: number;
		y: number;
		width: number;
		height: number;
		isFocused: boolean;
		isSelected: boolean;
	}

	let { task, x, y, width, height, isFocused, isSelected }: Props = $props();

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

	function handleClick(event: MouseEvent) {
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
	class="gantt-task cursor-pointer"
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
		{@const centerX = x + width / 2}
		{@const centerY = y + height / 2}
		{@const size = height / 2}
		<polygon
			points="{centerX},{centerY - size} {centerX + size},{centerY} {centerX},{centerY + size} {centerX - size},{centerY}"
			fill={colors.fill}
			stroke={isSelected ? '#1d4ed8' : isFocused ? '#60a5fa' : colors.stroke}
			stroke-width={isSelected ? 3 : isFocused ? 2 : 1}
		/>
	{:else}
		<!-- Task bar -->
		<rect
			{x}
			{y}
			{width}
			{height}
			rx="4"
			fill={colors.fill}
			stroke={isSelected ? '#1d4ed8' : isFocused ? '#60a5fa' : colors.stroke}
			stroke-width={isSelected ? 3 : isFocused ? 2 : 1}
			class="transition-all duration-150"
		/>

		<!-- Progress overlay for done tasks -->
		{#if task.status === 'done'}
			<rect
				{x}
				{y}
				{width}
				{height}
				rx="4"
				fill="url(#done-pattern)"
				opacity="0.2"
			/>
		{/if}

		<!-- Task label (if width allows) -->
		{#if width > 60}
			<text
				x={x + 8}
				y={y + height / 2 + 4}
				fill={colors.text}
				class="text-xs font-medium pointer-events-none"
				style:text-shadow="0 1px 2px rgba(0,0,0,0.2)"
			>
				{task.title.length > Math.floor(width / 8) - 2
					? task.title.slice(0, Math.floor(width / 8) - 2) + '...'
					: task.title}
			</text>
		{/if}
	{/if}

	<!-- Focus ring -->
	{#if isFocused}
		<rect
			x={x - 2}
			y={y - 2}
			width={width + 4}
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
