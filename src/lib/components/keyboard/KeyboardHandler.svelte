<script lang="ts">
	import { onMount } from 'svelte';
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { getOnboardingContext } from '$lib/stores/onboarding-store.svelte';
	import { getPersistenceContext } from '$lib/stores/persistence-store.svelte';

	const gantt = getGanttContext();
	const keyboard = getKeyboardContext();
	const onboarding = getOnboardingContext();
	const persistence = getPersistenceContext();

	// Pending delete confirmation
	let pendingDeleteId = $state<string | null>(null);
	let pendingDeleteTitle = $state<string>('');

	// Listen for programmatic action dispatch (e.g., from CommandPalette)
	onMount(() => {
		const handleActionEvent = (e: Event) => {
			const action = (e as CustomEvent).detail?.action;
			if (action) {
				executeAction(action);
				onboarding.onAction(action);
			}
		};
		document.addEventListener('gantt:action', handleActionEvent);
		return () => document.removeEventListener('gantt:action', handleActionEvent);
	});

	function handleKeyDown(event: KeyboardEvent) {
		// Skip if user is typing in an input
		const target = event.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
			// Only handle Escape in inputs
			if (event.key === 'Escape') {
				keyboard.closeAllModals();
				gantt.view.editingTaskId = null;
				(target as HTMLElement).blur();
			}
			return;
		}

		// Find matching binding
		const binding = keyboard.findBinding(event);
		if (!binding) return;

		// Handle action
		const handled = executeAction(binding.action);

		if (handled) {
			event.preventDefault();
			event.stopPropagation();

			// Notify onboarding
			onboarding.onAction(binding.action);
		}
	}

	function executeAction(action: string): boolean {
		switch (action) {
			// Navigation
			case 'focusPrev':
				gantt.focusPreviousTask();
				return true;
			case 'focusNext':
				gantt.focusNextTask();
				return true;
			case 'focusFirst':
				gantt.focusFirstTask();
				return true;
			case 'focusLast':
				gantt.focusLastTask();
				return true;
			case 'scrollUp':
				gantt.view.scrollY = Math.max(0, gantt.view.scrollY - 100);
				return true;
			case 'scrollDown':
				gantt.view.scrollY += 100;
				return true;

			// Task actions
			case 'newTask':
				gantt.addTask();
				return true;
			case 'editTask':
			case 'renameTask':
				if (gantt.view.focusedTaskId) {
					gantt.view.selectedTaskId = gantt.view.focusedTaskId;
					gantt.view.editingTaskId = gantt.view.focusedTaskId;
				}
				return true;
			case 'deleteTask':
				if (gantt.view.focusedTaskId) {
					const task = gantt.data.tasks.find(t => t.id === gantt.view.focusedTaskId);
					if (task) {
						pendingDeleteId = task.id;
						pendingDeleteTitle = task.title;
					}
				}
				return true;
			case 'copyTask':
				if (gantt.view.focusedTaskId) {
					gantt.copyTask(gantt.view.focusedTaskId);
				}
				return true;
			case 'pasteTask':
				gantt.pasteTask();
				return true;
			case 'duplicateTask':
				if (gantt.view.focusedTaskId) {
					gantt.duplicateTask(gantt.view.focusedTaskId);
				}
				return true;
			case 'indentTask':
				if (gantt.view.focusedTaskId) {
					gantt.indentTask(gantt.view.focusedTaskId);
				}
				return true;
			case 'outdentTask':
				if (gantt.view.focusedTaskId) {
					gantt.outdentTask(gantt.view.focusedTaskId);
				}
				return true;
			case 'toggleMilestone':
				if (gantt.view.focusedTaskId) {
					gantt.toggleMilestone(gantt.view.focusedTaskId);
				}
				return true;
			case 'selectAll':
				gantt.selectAll();
				return true;

			// Timeline
			case 'zoomIn':
				gantt.zoomIn();
				return true;
			case 'zoomOut':
				gantt.zoomOut();
				return true;
			case 'resetZoom':
				gantt.resetZoom();
				return true;
			case 'moveStartLeft':
				if (gantt.view.focusedTaskId) {
					gantt.moveTaskStart(gantt.view.focusedTaskId, -1);
				}
				return true;
			case 'moveStartRight':
				if (gantt.view.focusedTaskId) {
					gantt.moveTaskStart(gantt.view.focusedTaskId, 1);
				}
				return true;
			case 'moveEndLeft':
				if (gantt.view.focusedTaskId) {
					gantt.moveTaskEnd(gantt.view.focusedTaskId, -1);
				}
				return true;
			case 'moveEndRight':
				if (gantt.view.focusedTaskId) {
					gantt.moveTaskEnd(gantt.view.focusedTaskId, 1);
				}
				return true;
			case 'moveTaskLeft':
				if (gantt.view.focusedTaskId) {
					gantt.moveTask(gantt.view.focusedTaskId, -1);
				}
				return true;
			case 'moveTaskRight':
				if (gantt.view.focusedTaskId) {
					gantt.moveTask(gantt.view.focusedTaskId, 1);
				}
				return true;

			// Global
			case 'openCommandPalette':
				keyboard.openCommandPalette();
				return true;
			case 'openHelp':
				keyboard.openHelp();
				return true;
			case 'openExport':
				keyboard.openExport();
				return true;
			case 'openImport':
				keyboard.openImport();
				return true;
			case 'openSmartImport':
				keyboard.openSmartImport();
				return true;
			case 'undo':
				gantt.undo();
				return true;
			case 'redo':
				gantt.redo();
				return true;
			case 'openHistory':
				persistence.openHistory();
				return true;
			case 'openFileBrowser':
				persistence.openFileBrowser();
				return true;
			case 'createSnapshot':
				persistence.createSnapshot();
				return true;
			case 'cancel':
				keyboard.closeAllModals();
				persistence.closeHistory();
				persistence.closeFileBrowser();
				gantt.view.editingTaskId = null;
				gantt.view.selectedTaskId = null;
				return true;

			// Page-level actions (dispatch event for page to handle)
			case 'switchGanttView':
			case 'switchTableView':
			case 'exportPdf':
			case 'exportPng':
			case 'fitAll':
				document.dispatchEvent(new CustomEvent('gantt:action', { detail: { action }, bubbles: true }));
				return true;

			default:
				return false;
		}
	}

	function confirmDelete(): void {
		if (pendingDeleteId) {
			gantt.deleteTask(pendingDeleteId);
			pendingDeleteId = null;
			pendingDeleteTitle = '';
		}
	}

	function cancelDelete(): void {
		pendingDeleteId = null;
		pendingDeleteTitle = '';
	}

	function handleDeleteDialogKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			confirmDelete();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancelDelete();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if pendingDeleteId}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal-backdrop flex items-center justify-center"
		onclick={cancelDelete}
		onkeydown={handleDeleteDialogKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-dialog-title"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="bg-surface rounded-xl shadow-2xl border border-default p-6 max-w-sm w-full mx-4"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 id="delete-dialog-title" class="text-lg font-semibold text-primary mb-2">
				Delete Task
			</h2>
			<p class="text-secondary mb-6">
				Are you sure you want to delete "<span class="font-medium text-primary">{pendingDeleteTitle}</span>"? This action cannot be undone.
			</p>
			<div class="flex gap-3 justify-end">
				<button
					class="px-4 py-2 text-sm font-medium rounded-lg bg-surface-elevated hover:bg-surface-hover text-secondary transition-colors"
					onclick={cancelDelete}
				>
					Cancel
				</button>
				<button
					class="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
					onclick={confirmDelete}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
