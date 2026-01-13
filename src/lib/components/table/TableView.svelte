<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { formatDate, diffDays } from '$lib/utils/date-utils';
	import type { Task } from '$lib/types';

	const gantt = getGanttContext();

	// Sort configuration
	type SortKey = 'title' | 'section' | 'startDate' | 'endDate' | 'duration' | 'status';
	let sortKey = $state<SortKey>('startDate');
	let sortAsc = $state(true);

	// Get section name for a task
	function getSectionName(sectionId: string | null): string {
		if (!sectionId) return '-';
		return gantt.data.sections.find(s => s.id === sectionId)?.name ?? '-';
	}

	// Calculate duration in days
	function getDuration(task: Task): number {
		return diffDays(task.startDate, task.endDate) + 1;
	}

	// Format status for display
	function formatStatus(status: Task['status']): string {
		if (!status) return '-';
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	// Sorted tasks
	const sortedTasks = $derived.by(() => {
		const tasks = [...gantt.data.tasks];
		tasks.sort((a, b) => {
			let cmp = 0;
			switch (sortKey) {
				case 'title':
					cmp = a.title.localeCompare(b.title);
					break;
				case 'section':
					cmp = getSectionName(a.sectionId).localeCompare(getSectionName(b.sectionId));
					break;
				case 'startDate':
					cmp = a.startDate.getTime() - b.startDate.getTime();
					break;
				case 'endDate':
					cmp = a.endDate.getTime() - b.endDate.getTime();
					break;
				case 'duration':
					cmp = getDuration(a) - getDuration(b);
					break;
				case 'status':
					cmp = (a.status ?? '').localeCompare(b.status ?? '');
					break;
			}
			return sortAsc ? cmp : -cmp;
		});
		return tasks;
	});

	// Toggle sort
	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = key;
			sortAsc = true;
		}
	}

	// Handle row click
	function handleRowClick(task: Task) {
		gantt.view.focusedTaskId = task.id;
		gantt.view.selectedTaskId = task.id;
	}

	// Handle double click to edit
	function handleRowDoubleClick(task: Task) {
		gantt.view.editingTaskId = task.id;
	}

	// Get sort indicator
	function getSortIndicator(key: SortKey): string {
		if (sortKey !== key) return '';
		return sortAsc ? ' ↑' : ' ↓';
	}
</script>

<div class="table-wrapper">
	<table class="task-table">
		<thead>
			<tr>
				<th class="th-task" onclick={() => toggleSort('title')}>
					Task{getSortIndicator('title')}
				</th>
				<th class="th-section" onclick={() => toggleSort('section')}>
					Section{getSortIndicator('section')}
				</th>
				<th class="th-date" onclick={() => toggleSort('startDate')}>
					Start{getSortIndicator('startDate')}
				</th>
				<th class="th-date" onclick={() => toggleSort('endDate')}>
					End{getSortIndicator('endDate')}
				</th>
				<th class="th-duration" onclick={() => toggleSort('duration')}>
					Duration{getSortIndicator('duration')}
				</th>
				<th class="th-status" onclick={() => toggleSort('status')}>
					Status{getSortIndicator('status')}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each sortedTasks as task (task.id)}
				{@const isFocused = gantt.view.focusedTaskId === task.id}
				{@const isSelected = gantt.view.selectedTaskId === task.id}
				{@const level = gantt.getTaskLevel(task.id)}
				<tr
					class="task-row"
					class:focused={isFocused}
					class:selected={isSelected}
					onclick={() => handleRowClick(task)}
					ondblclick={() => handleRowDoubleClick(task)}
				>
					<td class="td-task" style:padding-left="{0.75 + level * 1}rem">
						{#if task.color}
							<span class="color-dot" style:background-color={task.color}></span>
						{/if}
						<span class="task-title">{task.title}</span>
						{#if task.isMilestone}
							<span class="milestone-badge">M</span>
						{/if}
					</td>
					<td class="td-section">{getSectionName(task.sectionId)}</td>
					<td class="td-date">{formatDate(task.startDate, 'MMM DD')}</td>
					<td class="td-date">{formatDate(task.endDate, 'MMM DD')}</td>
					<td class="td-duration">{getDuration(task)}d</td>
					<td class="td-status">
						{#if task.status}
							<span class="status-badge status-{task.status}">{formatStatus(task.status)}</span>
						{:else}
							<span class="text-tertiary">-</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if sortedTasks.length === 0}
		<div class="empty-state">
			<p>No tasks yet. Add a task to get started.</p>
		</div>
	{/if}
</div>

<style>
	.table-wrapper {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		overflow: auto;
		max-height: calc(100vh - 200px);
	}

	.task-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	thead {
		position: sticky;
		top: 0;
		z-index: 10;
		background-color: var(--color-surface-elevated);
	}

	th {
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-border);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
		transition: background-color 0.1s;
	}

	th:hover {
		background-color: var(--color-surface);
	}

	.th-task {
		min-width: 200px;
	}

	.th-section {
		min-width: 100px;
	}

	.th-date {
		min-width: 80px;
	}

	.th-duration {
		min-width: 70px;
		text-align: right;
	}

	.th-status {
		min-width: 80px;
	}

	.task-row {
		cursor: pointer;
		transition: background-color 0.1s;
	}

	.task-row:hover {
		background-color: var(--color-surface-elevated);
	}

	.task-row.focused {
		background-color: var(--color-accent-subtle);
	}

	.task-row.selected {
		box-shadow: inset 0 0 0 2px var(--color-accent);
	}

	td {
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.td-task {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.task-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.color-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.milestone-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--color-status-milestone);
		background-color: var(--color-accent-subtle);
		border-radius: 0.25rem;
		flex-shrink: 0;
	}

	.td-section {
		color: var(--color-text-secondary);
	}

	.td-date {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.td-duration {
		text-align: right;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.status-badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 9999px;
	}

	.status-active {
		background-color: var(--color-accent-subtle);
		color: var(--color-accent);
	}

	.status-done {
		background-color: rgba(101, 163, 13, 0.1);
		color: var(--color-status-done);
	}

	.status-crit {
		background-color: rgba(220, 38, 38, 0.1);
		color: var(--color-status-critical);
	}

	.status-milestone {
		background-color: rgba(124, 58, 237, 0.1);
		color: var(--color-status-milestone);
	}

	.empty-state {
		padding: 3rem;
		text-align: center;
		color: var(--color-text-secondary);
	}
</style>
