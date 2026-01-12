<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { formatDate } from '$lib/utils/date-utils';
	import type { TaskStatus } from '$lib/types';

	const gantt = getGanttContext();

	let titleInput: HTMLInputElement;

	const task = $derived(
		gantt.data.tasks.find((t) => t.id === gantt.view.editingTaskId) ?? null
	);

	// Local form state
	let title = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let status = $state<TaskStatus>(null);
	let sectionId = $state<string | null>(null);

	// Sync form state when task changes
	$effect(() => {
		if (task) {
			title = task.title;
			startDate = formatDate(task.startDate, 'YYYY-MM-DD');
			endDate = formatDate(task.endDate, 'YYYY-MM-DD');
			status = task.status;
			sectionId = task.sectionId;
		}
	});

	// Focus title input when opened
	$effect(() => {
		if (gantt.view.editingTaskId && titleInput) {
			setTimeout(() => {
				titleInput.focus();
				titleInput.select();
			}, 50);
		}
	});

	function save() {
		if (!task) return;

		gantt.updateTask(task.id, {
			title: title.trim() || 'Untitled',
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			status,
			sectionId
		});

		close();
	}

	function close() {
		gantt.view.editingTaskId = null;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			save();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

{#if task}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Edit task"
	>
		<div class="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">Edit Task</h2>
				<button
					onclick={close}
					class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={(e) => { e.preventDefault(); save(); }} class="p-6 space-y-4">
				<!-- Title -->
				<div>
					<label for="task-title" class="block text-sm font-medium text-gray-700 mb-1">
						Title
					</label>
					<input
						id="task-title"
						bind:this={titleInput}
						bind:value={title}
						type="text"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Task title"
					/>
				</div>

				<!-- Dates -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="task-start" class="block text-sm font-medium text-gray-700 mb-1">
							Start Date
						</label>
						<input
							id="task-start"
							bind:value={startDate}
							type="date"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<div>
						<label for="task-end" class="block text-sm font-medium text-gray-700 mb-1">
							End Date
						</label>
						<input
							id="task-end"
							bind:value={endDate}
							type="date"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- Status -->
				<div>
					<label for="task-status" class="block text-sm font-medium text-gray-700 mb-1">
						Status
					</label>
					<select
						id="task-status"
						bind:value={status}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value={null}>None</option>
						<option value="active">Active</option>
						<option value="done">Done</option>
						<option value="crit">Critical</option>
						<option value="milestone">Milestone</option>
					</select>
				</div>

				<!-- Section -->
				<div>
					<label for="task-section" class="block text-sm font-medium text-gray-700 mb-1">
						Section
					</label>
					<select
						id="task-section"
						bind:value={sectionId}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						{#each gantt.data.sections as section}
							<option value={section.id}>{section.name}</option>
						{/each}
					</select>
				</div>
			</form>

			<!-- Footer -->
			<div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
				<div class="flex items-center gap-2 text-sm text-gray-500">
					<kbd class="kbd kbd-sm">Ctrl</kbd>
					<span>+</span>
					<kbd class="kbd kbd-sm">Enter</kbd>
					<span>to save</span>
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={close}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={save}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
