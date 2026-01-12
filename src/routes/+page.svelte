<script lang="ts">
	import { onMount } from 'svelte';
	import { createGanttStore, setGanttContext } from '$lib/stores/gantt-store.svelte';
	import { createKeyboardStore, setKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { createOnboardingStore, setOnboardingContext } from '$lib/stores/onboarding-store.svelte';

	import GanttChart from '$lib/components/gantt/GanttChart.svelte';
	import KeyboardHandler from '$lib/components/keyboard/KeyboardHandler.svelte';
	import CommandPalette from '$lib/components/keyboard/CommandPalette.svelte';
	import ShortcutsHelp from '$lib/components/keyboard/ShortcutsHelp.svelte';
	import Tutorial from '$lib/components/onboarding/Tutorial.svelte';
	import ContextualHint from '$lib/components/onboarding/ContextualHint.svelte';
	import TaskEditor from '$lib/components/editor/TaskEditor.svelte';
	import ImportExport from '$lib/components/io/ImportExport.svelte';

	// Create stores
	const gantt = createGanttStore();
	const keyboard = createKeyboardStore();
	const onboarding = createOnboardingStore();

	// Provide context
	setGanttContext(gantt);
	setKeyboardContext(keyboard);
	setOnboardingContext(onboarding);

	// Show tutorial on first visit
	onMount(() => {
		if (!onboarding.hasCompletedTutorial) {
			onboarding.startTutorial();
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Keyboard handler (global) -->
	<KeyboardHandler />

	<!-- Header -->
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<h1 class="text-xl font-semibold text-gray-900">Gantt Chart Editor</h1>
					{#if gantt.data.config.title}
						<span class="text-gray-400">/</span>
						<span class="text-gray-600">{gantt.data.config.title}</span>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<!-- Undo/Redo -->
					<button
						onclick={() => gantt.undo()}
						disabled={!gantt.canUndo}
						class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
						title="Undo (Ctrl+Z)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
						</svg>
					</button>
					<button
						onclick={() => gantt.redo()}
						disabled={!gantt.canRedo}
						class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
						title="Redo (Ctrl+Shift+Z)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
						</svg>
					</button>

					<div class="w-px h-6 bg-gray-200 mx-2"></div>

					<!-- Zoom controls -->
					<button
						onclick={() => gantt.zoomOut()}
						class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
						title="Zoom out (Ctrl+-)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
						</svg>
					</button>
					<span class="text-sm text-gray-500 min-w-12 text-center">
						{gantt.view.zoom === 1 ? 'Day' : gantt.view.zoom === 7 ? 'Week' : 'Month'}
					</span>
					<button
						onclick={() => gantt.zoomIn()}
						class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
						title="Zoom in (Ctrl++)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
						</svg>
					</button>

					<div class="w-px h-6 bg-gray-200 mx-2"></div>

					<!-- Import/Export -->
					<button
						onclick={() => keyboard.openImport()}
						class="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
						title="Import (Ctrl+O)"
					>
						Import
					</button>
					<button
						onclick={() => keyboard.openExport()}
						class="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
						title="Export (Ctrl+S)"
					>
						Export
					</button>

					<div class="w-px h-6 bg-gray-200 mx-2"></div>

					<!-- Help -->
					<button
						onclick={() => keyboard.openHelp()}
						class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
						title="Keyboard shortcuts (F1)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<!-- Quick hint bar -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2 text-sm text-gray-500">
				<span>Quick:</span>
				<kbd class="kbd kbd-sm">Ctrl</kbd>+<kbd class="kbd kbd-sm">K</kbd>
				<span class="text-gray-400">Command Palette</span>
				<span class="mx-2 text-gray-300">|</span>
				<kbd class="kbd kbd-sm">Ctrl</kbd>+<kbd class="kbd kbd-sm">N</kbd>
				<span class="text-gray-400">New Task</span>
				<span class="mx-2 text-gray-300">|</span>
				<kbd class="kbd kbd-sm">?</kbd>
				<span class="text-gray-400">All Shortcuts</span>
			</div>

			<button
				onclick={() => gantt.addTask()}
				class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				New Task
			</button>
		</div>

		<!-- Gantt chart -->
		<GanttChart />

		<!-- Task stats -->
		<div class="mt-4 flex items-center gap-6 text-sm text-gray-500">
			<span>{gantt.data.tasks.length} task{gantt.data.tasks.length !== 1 ? 's' : ''}</span>
			<span>{gantt.data.sections.length} section{gantt.data.sections.length !== 1 ? 's' : ''}</span>
			{#if gantt.clipboard}
				<span class="text-blue-600">Task copied to clipboard</span>
			{/if}
		</div>
	</main>

	<!-- Modals -->
	<CommandPalette />
	<ShortcutsHelp />
	<Tutorial />
	<TaskEditor />
	<ImportExport />
	<ContextualHint />
</div>
