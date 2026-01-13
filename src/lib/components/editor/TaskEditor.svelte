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
		class="modal-backdrop flex items-center justify-center"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Edit task"
		tabindex="-1"
	>
		<div class="modal-content">
			<!-- Header -->
			<div class="modal-header">
				<h2 class="text-lg font-semibold text-primary">Edit Task</h2>
				<button
					onclick={close}
					class="btn-ghost"
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
					<label for="task-title" class="form-label">
						Title
					</label>
					<input
						id="task-title"
						bind:this={titleInput}
						bind:value={title}
						type="text"
						class="form-input"
						placeholder="Task title"
					/>
				</div>

				<!-- Dates -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="task-start" class="form-label">
							Start Date
						</label>
						<input
							id="task-start"
							bind:value={startDate}
							type="date"
							class="form-input"
						/>
					</div>
					<div>
						<label for="task-end" class="form-label">
							End Date
						</label>
						<input
							id="task-end"
							bind:value={endDate}
							type="date"
							class="form-input"
						/>
					</div>
				</div>

				<!-- Status -->
				<div>
					<label for="task-status" class="form-label">
						Status
					</label>
					<select
						id="task-status"
						bind:value={status}
						class="form-input"
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
					<label for="task-section" class="form-label">
						Section
					</label>
					<select
						id="task-section"
						bind:value={sectionId}
						class="form-input"
					>
						{#each gantt.data.sections as section}
							<option value={section.id}>{section.name}</option>
						{/each}
					</select>
				</div>
			</form>

			<!-- Footer -->
			<div class="modal-footer">
				<div class="flex items-center gap-2 text-sm text-secondary">
					<kbd class="kbd kbd-sm">Ctrl</kbd>
					<span>+</span>
					<kbd class="kbd kbd-sm">Enter</kbd>
					<span>to save</span>
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={close}
						class="btn-secondary"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={save}
						class="btn-primary"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-content {
		width: 100%;
		max-width: 28rem;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.form-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.form-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		background-color: var(--color-surface);
		color: var(--color-text);
		font-size: 0.875rem;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-light);
	}
</style>
