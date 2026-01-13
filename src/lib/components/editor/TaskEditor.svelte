<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { formatDate } from '$lib/utils/date-utils';
	import type { TaskStatus } from '$lib/types';
	import ColorPicker from '$lib/components/ui/ColorPicker.svelte';
	import TagInput from '$lib/components/ui/TagInput.svelte';

	const gantt = getGanttContext();

	let titleInput: HTMLInputElement;

	const task = $derived(
		gantt.data.tasks.find((t) => t.id === gantt.view.editingTaskId) ?? null
	);

	// Get potential parent tasks (same section, excluding self and descendants)
	const potentialParents = $derived.by(() => {
		if (!task) return [];
		const descendants = new Set(gantt.getDescendants(task.id).map(t => t.id));
		return gantt.data.tasks.filter(t =>
			t.sectionId === task.sectionId &&
			t.id !== task.id &&
			!descendants.has(t.id)
		);
	});

	// Local form state
	let title = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let status = $state<TaskStatus>(null);
	let sectionId = $state<string | null>(null);
	let parentId = $state<string | null>(null);
	let isMilestone = $state(false);
	let color = $state<string | null>(null);
	let tags = $state<string[]>([]);
	let estimatedHours = $state<number | null>(null);
	let actualHours = $state<number | null>(null);
	let estimatedCost = $state<number | null>(null);
	let actualCost = $state<number | null>(null);
	let notes = $state<string | null>(null);

	// Sync form state when task changes
	$effect(() => {
		if (task) {
			title = task.title;
			startDate = formatDate(task.startDate, 'YYYY-MM-DD');
			endDate = formatDate(task.endDate, 'YYYY-MM-DD');
			status = task.status;
			sectionId = task.sectionId;
			parentId = task.parentId;
			isMilestone = task.isMilestone;
			color = task.color;
			tags = [...task.tags];
			estimatedHours = task.estimatedHours;
			actualHours = task.actualHours;
			estimatedCost = task.estimatedCost;
			actualCost = task.actualCost;
			notes = task.notes;
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
			sectionId,
			parentId,
			isMilestone,
			color,
			tags,
			estimatedHours,
			actualHours,
			estimatedCost,
			actualCost,
			notes: notes?.trim() || null
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
			<form onsubmit={(e) => { e.preventDefault(); save(); }} class="form-body">
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

				<!-- Status & Section row -->
				<div class="grid grid-cols-2 gap-4">
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
				</div>

				<!-- Parent Task -->
				<div>
					<label for="task-parent" class="form-label">
						Parent Task
					</label>
					<select
						id="task-parent"
						bind:value={parentId}
						class="form-input"
					>
						<option value={null}>None (top level)</option>
						{#each potentialParents as parent}
							<option value={parent.id}>{parent.title}</option>
						{/each}
					</select>
				</div>

				<!-- Is Milestone checkbox -->
				<div class="checkbox-row">
					<input
						id="task-milestone"
						type="checkbox"
						bind:checked={isMilestone}
						class="form-checkbox"
					/>
					<label for="task-milestone" class="checkbox-label">
						Mark as milestone (single-day diamond marker)
					</label>
				</div>

				<!-- Color -->
				<div>
					<label class="form-label">
						Color
					</label>
					<ColorPicker value={color} onchange={(c) => color = c} />
				</div>

				<!-- Tags -->
				<div>
					<label class="form-label">
						Tags
					</label>
					<TagInput value={tags} onchange={(t) => tags = t} />
				</div>

				<!-- Hours row -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="task-est-hours" class="form-label">
							Estimated Hours
						</label>
						<input
							id="task-est-hours"
							type="number"
							min="0"
							step="0.5"
							bind:value={estimatedHours}
							class="form-input"
							placeholder="0"
						/>
					</div>
					<div>
						<label for="task-act-hours" class="form-label">
							Actual Hours
						</label>
						<input
							id="task-act-hours"
							type="number"
							min="0"
							step="0.5"
							bind:value={actualHours}
							class="form-input"
							placeholder="0"
						/>
					</div>
				</div>

				<!-- Cost row -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="task-est-cost" class="form-label">
							Estimated Cost
						</label>
						<input
							id="task-est-cost"
							type="number"
							min="0"
							step="0.01"
							bind:value={estimatedCost}
							class="form-input"
							placeholder="0.00"
						/>
					</div>
					<div>
						<label for="task-act-cost" class="form-label">
							Actual Cost
						</label>
						<input
							id="task-act-cost"
							type="number"
							min="0"
							step="0.01"
							bind:value={actualCost}
							class="form-input"
							placeholder="0.00"
						/>
					</div>
				</div>

				<!-- Notes -->
				<div>
					<label for="task-notes" class="form-label">
						Notes
					</label>
					<textarea
						id="task-notes"
						bind:value={notes}
						class="form-input form-textarea"
						placeholder="Additional notes..."
						rows="3"
					></textarea>
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
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 32rem;
		max-height: calc(100vh - 4rem);
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
		flex-shrink: 0;
	}

	.form-body {
		padding: 1.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
		flex-shrink: 0;
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

	.form-textarea {
		resize: vertical;
		min-height: 4rem;
	}

	.checkbox-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.form-checkbox {
		width: 1rem;
		height: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
		background-color: var(--color-surface);
		cursor: pointer;
		accent-color: var(--color-accent);
	}

	.checkbox-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		cursor: pointer;
	}
</style>
