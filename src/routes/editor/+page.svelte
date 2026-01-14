<script lang="ts">
	import { onMount } from 'svelte';
	import { createGanttStore, setGanttContext } from '$lib/stores/gantt-store.svelte';
	import { createKeyboardStore, setKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { createOnboardingStore, setOnboardingContext } from '$lib/stores/onboarding-store.svelte';
	import { createPersistenceStore, setPersistenceContext } from '$lib/stores/persistence-store.svelte';
	import { createTemplateStore, setTemplateContext } from '$lib/stores/template-store.svelte';
	import { createClipboardWatcherStore, setClipboardWatcherContext } from '$lib/stores/clipboard-watcher.svelte';
	import { getThemeContext } from '$lib/stores/theme-store.svelte';
	import { BUILTIN_TEMPLATES } from '$lib/data/templates';
	import {
		LayoutGrid, Moon, Sun, Undo2, Redo2, Clock,
		HelpCircle, Plus, Table, GanttChart as GanttChartIcon
	} from '@lucide/svelte';

	import GanttChart from '$lib/components/gantt/GanttChart.svelte';
	import ZoomControls from '$lib/components/gantt/ZoomControls.svelte';
	import TableView from '$lib/components/table/TableView.svelte';
	import KeyboardHandler from '$lib/components/keyboard/KeyboardHandler.svelte';
	import CommandPalette from '$lib/components/keyboard/CommandPalette.svelte';
	import ShortcutsHelp from '$lib/components/keyboard/ShortcutsHelp.svelte';
	import Tutorial from '$lib/components/onboarding/Tutorial.svelte';
	import ContextualHint from '$lib/components/onboarding/ContextualHint.svelte';
	import TaskEditor from '$lib/components/editor/TaskEditor.svelte';
	import ImportExport from '$lib/components/io/ImportExport.svelte';
	import SmartImport from '$lib/components/io/SmartImport.svelte';
	import FileDropZone from '$lib/components/io/FileDropZone.svelte';
	import ClipboardToast from '$lib/components/ui/ClipboardToast.svelte';
	import ProjectPicker from '$lib/components/persistence/ProjectPicker.svelte';
	import SaveStatus from '$lib/components/persistence/SaveStatus.svelte';
	import VersionHistory from '$lib/components/persistence/VersionHistory.svelte';
	import FileBrowser from '$lib/components/persistence/FileBrowser.svelte';
	import { parseMermaidGantt, validateGanttData } from '$lib/utils/mermaid-parser';
	import { importFromJson } from '$lib/utils/mermaid-exporter';
	import type { FileType } from '$lib/components/io/FileDropZone.svelte';
	import { exportGanttToPDF } from '$lib/utils/pdf-exporter';
	import { exportToPNG } from '$lib/utils/png-exporter';

	// View state
	type ViewMode = 'gantt' | 'table';
	let currentView = $state<ViewMode>('gantt');
	let ganttElement = $state<HTMLElement | null>(null);

	// Platform detection for keyboard shortcuts display
	const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
	const modKey = isMac ? '⌘' : 'Ctrl';

	// Create stores
	const gantt = createGanttStore();
	const keyboard = createKeyboardStore();
	const onboarding = createOnboardingStore();
	const persistence = createPersistenceStore();
	const template = createTemplateStore(BUILTIN_TEMPLATES);
	const clipboardWatcher = createClipboardWatcherStore();
	const theme = getThemeContext();

	// Provide context
	setGanttContext(gantt);
	setKeyboardContext(keyboard);
	setOnboardingContext(onboarding);
	setPersistenceContext(persistence);
	setTemplateContext(template);
	setClipboardWatcherContext(clipboardWatcher);

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
		clipboardWatcher.start();

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

		// Listen for keyboard actions that need page-level access
		const handleAction = (e: Event) => {
			const action = (e as CustomEvent).detail?.action;
			switch (action) {
				case 'switchGanttView':
					currentView = 'gantt';
					break;
				case 'switchTableView':
					currentView = 'table';
					break;
				case 'exportPdf':
					if (ganttElement) {
						exportGanttToPDF(ganttElement, { filename: `${persistence.currentProject?.name ?? 'gantt'}.pdf` });
					}
					break;
				case 'exportPng':
					if (ganttElement) {
						exportToPNG(ganttElement, { filename: `${persistence.currentProject?.name ?? 'gantt'}.png` });
					}
					break;
				case 'fitAll':
					if (ganttElement) {
						gantt.fitAll(ganttElement.clientWidth);
					}
					break;
			}
		};
		document.addEventListener('gantt:action', handleAction);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			document.removeEventListener('gantt:action', handleAction);
			clipboardWatcher.stop();
		};
	});

	// Handle file drop
	function handleFileDrop(content: string, fileType: FileType, filename: string) {
		try {
			if (fileType === 'csv') {
				// Open CSV importer modal with content pre-filled
				keyboard.openImport({ content, format: 'csv' });
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

<div class="h-screen flex flex-col overflow-hidden bg-page">
	<!-- Keyboard handler (global) -->
	<KeyboardHandler />

	<!-- Header: Document-level operations -->
	<header class="h-14 flex-shrink-0 bg-surface border-b border-default">
		<div class="h-full px-4 flex items-center justify-between">
			<!-- Left: Brand + Project -->
			<div class="flex items-center gap-4">
				<a href="/" class="text-lg font-semibold text-primary hover:text-accent transition-colors">Mermaid Gantt</a>
				<span class="text-tertiary">/</span>
				<ProjectPicker />
				<button
					onclick={() => persistence.openFileBrowser()}
					class="btn-ghost"
					title="Browse Projects ({modKey}+B)"
				>
					<LayoutGrid size={16} />
				</button>
				<SaveStatus />
			</div>

			<!-- Right: Document actions -->
			<div class="flex items-center gap-2">
				<!-- New Task -->
				<button
					onclick={() => gantt.addTask()}
					class="btn-primary text-sm py-1.5"
				>
					<Plus size={16} />
					New Task
				</button>

				<div class="w-px h-6 bg-[var(--color-border)] mx-1"></div>

				<!-- Undo/Redo -->
				<button
					onclick={() => gantt.undo()}
					disabled={!gantt.canUndo}
					class="btn-ghost"
					title="Undo ({modKey}+Z)"
				>
					<Undo2 size={18} />
				</button>
				<button
					onclick={() => gantt.redo()}
					disabled={!gantt.canRedo}
					class="btn-ghost"
					title="Redo ({modKey}+Shift+Z)"
				>
					<Redo2 size={18} />
				</button>

				<!-- Version History -->
				<button
					onclick={() => persistence.openHistory()}
					class="btn-ghost"
					title="Version History ({modKey}+H)"
				>
					<Clock size={18} />
				</button>

				<div class="w-px h-6 bg-[var(--color-border)] mx-1"></div>

				<!-- Import/Export -->
				<button
					onclick={() => keyboard.openImport()}
					class="btn-secondary text-sm py-1.5"
					title="Import ({modKey}+O)"
				>
					Import
				</button>
				<button
					onclick={() => keyboard.openExport()}
					class="btn-secondary text-sm py-1.5"
					title="Export ({modKey}+S)"
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
					<HelpCircle size={18} />
				</button>
			</div>
		</div>
	</header>

	<!-- Content: Chart fills remaining space -->
	<main class="flex-1 min-h-0">
		{#if currentView === 'gantt'}
			<GanttChart />
		{:else}
			<TableView />
		{/if}
	</main>

	<!-- Footer: View controls + Status -->
	<footer class="h-10 flex-shrink-0 px-4 bg-surface border-t border-default">
		<div class="h-full flex items-center justify-between">
			<!-- Left: Stats -->
			<div class="flex items-center gap-4 text-sm text-secondary">
				<span>{gantt.data.tasks.length} task{gantt.data.tasks.length !== 1 ? 's' : ''}</span>
				<span class="text-tertiary">·</span>
				<span>{gantt.data.sections.length} section{gantt.data.sections.length !== 1 ? 's' : ''}</span>
				{#if gantt.clipboard}
					<span class="text-tertiary">·</span>
					<span class="text-accent">Copied</span>
				{/if}
			</div>

			<!-- Center: Contextual hints -->
			<ContextualHint />

			<!-- Right: View controls -->
			<div class="flex items-center gap-3">
				<!-- View switcher -->
				<div class="view-switcher">
					<button
						class="view-btn"
						class:active={currentView === 'gantt'}
						onclick={() => currentView = 'gantt'}
						title="Gantt Chart View"
					>
						<GanttChartIcon size={14} />
					</button>
					<button
						class="view-btn"
						class:active={currentView === 'table'}
						onclick={() => currentView = 'table'}
						title="Table View"
					>
						<Table size={14} />
					</button>
				</div>

				<!-- Zoom controls -->
				<ZoomControls compact />

				<!-- Theme toggle -->
				<button
					onclick={() => theme.toggleTheme()}
					class="btn-ghost p-1.5"
					title="Toggle theme"
				>
					{#if theme.resolvedTheme === 'light'}
						<Moon size={16} />
					{:else}
						<Sun size={16} />
					{/if}
				</button>
			</div>
		</div>
	</footer>

	<!-- Modals -->
	<CommandPalette />
	<ShortcutsHelp />
	<Tutorial />
	<TaskEditor />
	<ImportExport {ganttElement} />
	<SmartImport />
	<VersionHistory />
	<FileBrowser />
	<FileDropZone onFileDrop={handleFileDrop} />
	<ClipboardToast />
</div>

<style>
	.view-switcher {
		display: flex;
		background-color: var(--color-surface-elevated);
		border-radius: 0.375rem;
		padding: 2px;
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 6px;
		color: var(--color-text-secondary);
		background: transparent;
		border: none;
		border-radius: 0.25rem;
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
