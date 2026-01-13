<script lang="ts">
	import { onMount } from 'svelte';
	import { createGanttStore, setGanttContext } from '$lib/stores/gantt-store.svelte';
	import { createKeyboardStore, setKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { createOnboardingStore, setOnboardingContext } from '$lib/stores/onboarding-store.svelte';
	import { createPersistenceStore, setPersistenceContext } from '$lib/stores/persistence-store.svelte';
	import { getThemeContext } from '$lib/stores/theme-store.svelte';

	import GanttChart from '$lib/components/gantt/GanttChart.svelte';
	import TableView from '$lib/components/table/TableView.svelte';
	import KeyboardHandler from '$lib/components/keyboard/KeyboardHandler.svelte';
	import CommandPalette from '$lib/components/keyboard/CommandPalette.svelte';
	import ShortcutsHelp from '$lib/components/keyboard/ShortcutsHelp.svelte';
	import Tutorial from '$lib/components/onboarding/Tutorial.svelte';
	import ContextualHint from '$lib/components/onboarding/ContextualHint.svelte';
	import TaskEditor from '$lib/components/editor/TaskEditor.svelte';
	import ImportExport from '$lib/components/io/ImportExport.svelte';
	import FileDropZone from '$lib/components/io/FileDropZone.svelte';
	import ProjectPicker from '$lib/components/persistence/ProjectPicker.svelte';
	import SaveStatus from '$lib/components/persistence/SaveStatus.svelte';
	import VersionHistory from '$lib/components/persistence/VersionHistory.svelte';
	import FileBrowser from '$lib/components/persistence/FileBrowser.svelte';
	import { parseMermaidGantt, validateGanttData } from '$lib/utils/mermaid-parser';
	import { importFromJson } from '$lib/utils/mermaid-exporter';
	import type { FileType } from '$lib/components/io/FileDropZone.svelte';

	// View state
	type ViewMode = 'gantt' | 'table';
	let currentView = $state<ViewMode>('gantt');
	let ganttElement = $state<HTMLElement | null>(null);

	// Create stores
	const gantt = createGanttStore();
	const keyboard = createKeyboardStore();
	const onboarding = createOnboardingStore();
	const persistence = createPersistenceStore();
	const theme = getThemeContext();

	// Provide context
	setGanttContext(gantt);
	setKeyboardContext(keyboard);
	setOnboardingContext(onboarding);
	setPersistenceContext(persistence);

	// Track data hash for change detection
	let lastDataHash = '';

	// Watch for data changes and trigger autosave
	$effect(() => {
		const currentHash = JSON.stringify(gantt.data);
		if (lastDataHash && currentHash !== lastDataHash) {
			persistence.markDirty();
		}
		lastDataHash = currentHash;
	});

	// Show tutorial on first visit + setup persistence
	onMount(() => {
		persistence.setupAutosave(gantt);

		if (!onboarding.hasCompletedTutorial) {
			onboarding.startTutorial();
		}

		// Save on page unload
		const handleBeforeUnload = () => {
			persistence.handleBeforeUnload();
		};
		window.addEventListener('beforeunload', handleBeforeUnload);

		// Get gantt chart element for export
		ganttElement = document.querySelector('[data-gantt-chart]') as HTMLElement | null;

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	// Handle file drop
	function handleFileDrop(content: string, fileType: FileType, filename: string) {
		try {
			if (fileType === 'csv') {
				// Open CSV importer modal
				keyboard.openImport();
				return;
			}

			let data;
			if (fileType === 'json') {
				data = importFromJson(content);
			} else {
				// Mermaid or unknown - try parsing as Mermaid
				data = parseMermaidGantt(content);
			}

			const errors = validateGanttData(data);
			if (errors.length > 0) {
				console.error('Import validation errors:', errors);
				return;
			}

			gantt.importData(data);
		} catch (err) {
			console.error('Failed to import file:', err);
		}
	}
</script>

<svelte:head>
	<title>{persistence.currentProject?.name ?? 'Editor'} - Mermaid Gantt</title>
</svelte:head>

<div class="min-h-screen bg-page">
	<!-- Keyboard handler (global) -->
	<KeyboardHandler />

	<!-- Header -->
	<header class="bg-surface border-b border-default">
		<div class="w-full px-4">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<a href="/" class="text-xl font-semibold text-primary hover:text-accent transition-colors">Mermaid Gantt</a>
					<span class="text-tertiary">/</span>
					<ProjectPicker />
					<button
						onclick={() => persistence.openFileBrowser()}
						class="btn-ghost"
						title="Browse Projects (Ctrl+P)"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<SaveStatus />
				</div>

				<div class="flex items-center gap-2">
					<!-- Theme toggle -->
					<button
						onclick={() => theme.toggleTheme()}
						class="btn-ghost"
						title="Toggle theme"
					>
						{#if theme.resolvedTheme === 'light'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
							</svg>
						{:else}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						{/if}
					</button>

					<div class="w-px h-6 bg-[var(--color-border)] mx-1"></div>

					<!-- Undo/Redo -->
					<button
						onclick={() => gantt.undo()}
						disabled={!gantt.canUndo}
						class="btn-ghost"
						title="Undo (Ctrl+Z)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
						</svg>
					</button>
					<button
						onclick={() => gantt.redo()}
						disabled={!gantt.canRedo}
						class="btn-ghost"
						title="Redo (Ctrl+Shift+Z)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
						</svg>
					</button>

					<div class="w-px h-6 bg-[var(--color-border)] mx-1"></div>

					<!-- Version History -->
					<button
						onclick={() => persistence.openHistory()}
						class="btn-ghost"
						title="Version History (Ctrl+H)"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</button>

					<div class="w-px h-6 bg-[var(--color-border)] mx-1"></div>

					<!-- Import/Export -->
					<button
						onclick={() => keyboard.openImport()}
						class="btn-secondary text-sm py-1.5"
						title="Import (Ctrl+O)"
					>
						Import
					</button>
					<button
						onclick={() => keyboard.openExport()}
						class="btn-secondary text-sm py-1.5"
						title="Export (Ctrl+S)"
					>
						Export
					</button>

					<div class="w-px h-6 bg-[var(--color-border)] mx-1"></div>

					<!-- Help -->
					<button
						onclick={() => keyboard.openHelp()}
						class="btn-ghost"
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
	<main class="w-full px-4 py-6">
		<!-- Quick hint bar -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2 text-sm text-secondary">
				<span>Quick:</span>
				<kbd class="kbd kbd-sm">Ctrl</kbd>+<kbd class="kbd kbd-sm">K</kbd>
				<span class="text-tertiary">Command Palette</span>
				<span class="mx-2 text-tertiary">|</span>
				<kbd class="kbd kbd-sm">Ctrl</kbd>+<kbd class="kbd kbd-sm">N</kbd>
				<span class="text-tertiary">New Task</span>
				<span class="mx-2 text-tertiary">|</span>
				<kbd class="kbd kbd-sm">?</kbd>
				<span class="text-tertiary">All Shortcuts</span>
			</div>

			<div class="flex items-center gap-3">
				<!-- View switcher -->
				<div class="view-switcher">
					<button
						class="view-btn"
						class:active={currentView === 'gantt'}
						onclick={() => currentView = 'gantt'}
						title="Gantt Chart View"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
						</svg>
						Gantt
					</button>
					<button
						class="view-btn"
						class:active={currentView === 'table'}
						onclick={() => currentView = 'table'}
						title="Table View"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						Table
					</button>
				</div>

				<button
					onclick={() => gantt.addTask()}
					class="btn-primary"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					New Task
				</button>
			</div>
		</div>

		<!-- Main view -->
		{#if currentView === 'gantt'}
			<GanttChart />
		{:else}
			<TableView />
		{/if}

		<!-- Task stats -->
		<div class="mt-4 flex items-center gap-6 text-sm text-secondary">
			<span>{gantt.data.tasks.length} task{gantt.data.tasks.length !== 1 ? 's' : ''}</span>
			<span>{gantt.data.sections.length} section{gantt.data.sections.length !== 1 ? 's' : ''}</span>
			{#if gantt.clipboard}
				<span class="text-accent">Task copied to clipboard</span>
			{/if}
		</div>
	</main>

	<!-- Modals -->
	<CommandPalette />
	<ShortcutsHelp />
	<Tutorial />
	<TaskEditor />
	<ImportExport {ganttElement} />
	<ContextualHint />
	<VersionHistory />
	<FileBrowser />
	<FileDropZone onFileDrop={handleFileDrop} />
</div>

<style>
	.view-switcher {
		display: flex;
		background-color: var(--color-surface-elevated);
		border-radius: 0.5rem;
		padding: 0.125rem;
	}

	.view-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.15s, color 0.15s;
	}

	.view-btn:hover {
		color: var(--color-text);
	}

	.view-btn.active {
		background-color: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}
</style>
