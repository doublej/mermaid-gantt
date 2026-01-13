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
					// TODO: Add confirmation dialog
					gantt.deleteTask(gantt.view.focusedTaskId);
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

			default:
				return false;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />
