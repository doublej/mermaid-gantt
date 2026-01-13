import { getContext, setContext } from 'svelte';
import type { KeyBinding, KeyCategory, KeyModifier } from '$lib/types';

const KEYBOARD_CONTEXT = Symbol('keyboard');

export type KeyboardMode = 'normal' | 'editing' | 'command-palette' | 'help' | 'smart-import';

// All keyboard bindings
export const keyBindings: KeyBinding[] = [
	// Navigation
	{ key: 'ArrowUp', modifiers: [], action: 'focusPrev', description: 'Focus previous task', category: 'navigation' },
	{ key: 'ArrowDown', modifiers: [], action: 'focusNext', description: 'Focus next task', category: 'navigation' },
	{ key: 'ArrowLeft', modifiers: [], action: 'collapseSection', description: 'Collapse section', category: 'navigation' },
	{ key: 'ArrowRight', modifiers: [], action: 'expandSection', description: 'Expand section', category: 'navigation' },
	{ key: 'Home', modifiers: [], action: 'focusFirst', description: 'Focus first task', category: 'navigation' },
	{ key: 'End', modifiers: [], action: 'focusLast', description: 'Focus last task', category: 'navigation' },
	{ key: 'Tab', modifiers: [], action: 'focusNext', description: 'Focus next task', category: 'navigation' },
	{ key: 'Tab', modifiers: ['shift'], action: 'focusPrev', description: 'Focus previous task', category: 'navigation' },
	{ key: 'PageUp', modifiers: [], action: 'scrollUp', description: 'Scroll timeline up', category: 'navigation' },
	{ key: 'PageDown', modifiers: [], action: 'scrollDown', description: 'Scroll timeline down', category: 'navigation' },

	// Task Actions
	{ key: 'n', modifiers: ['ctrl'], action: 'newTask', description: 'Create new task', category: 'task' },
	{ key: 'N', modifiers: ['ctrl'], action: 'newTask', description: 'Create new task', category: 'task' },
	{ key: 'Enter', modifiers: [], action: 'editTask', description: 'Edit selected task', category: 'task' },
	{ key: 'Delete', modifiers: [], action: 'deleteTask', description: 'Delete task', category: 'task' },
	{ key: 'Backspace', modifiers: [], action: 'deleteTask', description: 'Delete task', category: 'task' },
	{ key: 'c', modifiers: ['ctrl'], action: 'copyTask', description: 'Copy task', category: 'task' },
	{ key: 'C', modifiers: ['ctrl'], action: 'copyTask', description: 'Copy task', category: 'task' },
	{ key: 'v', modifiers: ['ctrl'], action: 'pasteTask', description: 'Paste task', category: 'task' },
	{ key: 'V', modifiers: ['ctrl'], action: 'pasteTask', description: 'Paste task', category: 'task' },
	{ key: 'd', modifiers: ['ctrl'], action: 'duplicateTask', description: 'Duplicate task', category: 'task' },
	{ key: 'D', modifiers: ['ctrl'], action: 'duplicateTask', description: 'Duplicate task', category: 'task' },
	{ key: 'F2', modifiers: [], action: 'renameTask', description: 'Rename task inline', category: 'task' },

	// Timeline
	{ key: '=', modifiers: ['ctrl'], action: 'zoomIn', description: 'Zoom in', category: 'timeline' },
	{ key: '+', modifiers: ['ctrl'], action: 'zoomIn', description: 'Zoom in', category: 'timeline' },
	{ key: '-', modifiers: ['ctrl'], action: 'zoomOut', description: 'Zoom out', category: 'timeline' },
	{ key: '0', modifiers: ['ctrl'], action: 'resetZoom', description: 'Reset zoom', category: 'timeline' },
	{ key: 'ArrowLeft', modifiers: ['shift'], action: 'moveStartLeft', description: 'Move task start -1 day', category: 'timeline' },
	{ key: 'ArrowRight', modifiers: ['shift'], action: 'moveStartRight', description: 'Move task start +1 day', category: 'timeline' },
	{ key: 'ArrowLeft', modifiers: ['alt'], action: 'moveEndLeft', description: 'Move task end -1 day', category: 'timeline' },
	{ key: 'ArrowRight', modifiers: ['alt'], action: 'moveEndRight', description: 'Move task end +1 day', category: 'timeline' },
	{ key: 'ArrowLeft', modifiers: ['ctrl'], action: 'moveTaskLeft', description: 'Move entire task -1 day', category: 'timeline' },
	{ key: 'ArrowRight', modifiers: ['ctrl'], action: 'moveTaskRight', description: 'Move entire task +1 day', category: 'timeline' },

	// Global
	{ key: 'k', modifiers: ['ctrl'], action: 'openCommandPalette', description: 'Open command palette', category: 'global' },
	{ key: 'K', modifiers: ['ctrl'], action: 'openCommandPalette', description: 'Open command palette', category: 'global' },
	{ key: 'F1', modifiers: [], action: 'openHelp', description: 'Open keyboard shortcuts', category: 'global' },
	{ key: '?', modifiers: [], action: 'openHelp', description: 'Open keyboard shortcuts', category: 'global' },
	{ key: 's', modifiers: ['ctrl'], action: 'openExport', description: 'Export', category: 'global' },
	{ key: 'S', modifiers: ['ctrl'], action: 'openExport', description: 'Export', category: 'global' },
	{ key: 'o', modifiers: ['ctrl'], action: 'openImport', description: 'Import', category: 'global' },
	{ key: 'O', modifiers: ['ctrl'], action: 'openImport', description: 'Import', category: 'global' },
	{ key: 'i', modifiers: ['ctrl', 'shift'], action: 'openSmartImport', description: 'Smart import', category: 'global' },
	{ key: 'I', modifiers: ['ctrl', 'shift'], action: 'openSmartImport', description: 'Smart import', category: 'global' },
	{ key: 'z', modifiers: ['ctrl'], action: 'undo', description: 'Undo', category: 'global' },
	{ key: 'Z', modifiers: ['ctrl'], action: 'undo', description: 'Undo', category: 'global' },
	{ key: 'z', modifiers: ['ctrl', 'shift'], action: 'redo', description: 'Redo', category: 'global' },
	{ key: 'Z', modifiers: ['ctrl', 'shift'], action: 'redo', description: 'Redo', category: 'global' },
	{ key: 'y', modifiers: ['ctrl'], action: 'redo', description: 'Redo', category: 'global' },
	{ key: 'Y', modifiers: ['ctrl'], action: 'redo', description: 'Redo', category: 'global' },
	{ key: 'h', modifiers: ['ctrl'], action: 'openHistory', description: 'Version history', category: 'global' },
	{ key: 'H', modifiers: ['ctrl'], action: 'openHistory', description: 'Version history', category: 'global' },
	{ key: 'p', modifiers: ['ctrl'], action: 'exportPdf', description: 'Export PDF', category: 'global' },
	{ key: 'P', modifiers: ['ctrl'], action: 'exportPdf', description: 'Export PDF', category: 'global' },
	{ key: 's', modifiers: ['ctrl', 'shift'], action: 'createSnapshot', description: 'Create snapshot', category: 'global' },
	{ key: 'S', modifiers: ['ctrl', 'shift'], action: 'createSnapshot', description: 'Create snapshot', category: 'global' },
	{ key: 'e', modifiers: ['ctrl', 'shift'], action: 'exportPng', description: 'Export PNG', category: 'global' },
	{ key: 'E', modifiers: ['ctrl', 'shift'], action: 'exportPng', description: 'Export PNG', category: 'global' },
	{ key: '1', modifiers: ['ctrl'], action: 'switchGanttView', description: 'Switch to Gantt view', category: 'global' },
	{ key: '2', modifiers: ['ctrl'], action: 'switchTableView', description: 'Switch to Table view', category: 'global' },
	{ key: '0', modifiers: ['ctrl'], action: 'fitAll', description: 'Fit all (zoom to fit)', category: 'global' },
	{ key: ']', modifiers: ['ctrl'], action: 'indentTask', description: 'Indent task', category: 'task' },
	{ key: '[', modifiers: ['ctrl'], action: 'outdentTask', description: 'Outdent task', category: 'task' },
	{ key: 'm', modifiers: [], action: 'toggleMilestone', description: 'Toggle milestone', category: 'task' },
	{ key: 'M', modifiers: [], action: 'toggleMilestone', description: 'Toggle milestone', category: 'task' },
	{ key: 'a', modifiers: ['ctrl'], action: 'selectAll', description: 'Select all', category: 'global' },
	{ key: 'A', modifiers: ['ctrl'], action: 'selectAll', description: 'Select all', category: 'global' },
	{ key: 'Escape', modifiers: [], action: 'cancel', description: 'Cancel / Close modal', category: 'global' },
];

export class KeyboardStore {
	mode = $state<KeyboardMode>('normal');

	// Track which modals are open
	showCommandPalette = $state(false);
	showHelp = $state(false);
	showImportExport = $state(false);
	showSmartImport = $state(false);
	importExportMode = $state<'import' | 'export'>('export');
	smartImportInitialText = $state<string | null>(null);

	// Grouped bindings for display
	bindingsByCategory = $derived(
		keyBindings.reduce((acc, binding) => {
			if (!acc[binding.category]) {
				acc[binding.category] = [];
			}
			// Dedupe by action (keep first occurrence)
			const exists = acc[binding.category].some(b => b.action === binding.action);
			if (!exists) {
				acc[binding.category].push(binding);
			}
			return acc;
		}, {} as Record<KeyCategory, KeyBinding[]>)
	);

	// Find matching binding for a keyboard event
	findBinding(event: KeyboardEvent): KeyBinding | null {
		const modifiers: KeyModifier[] = [];
		if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
		if (event.shiftKey) modifiers.push('shift');
		if (event.altKey) modifiers.push('alt');

		return keyBindings.find(binding => {
			// Match key
			if (binding.key !== event.key) return false;

			// Match modifiers exactly
			const bindingMods = new Set(binding.modifiers);
			const eventMods = new Set(modifiers);

			if (bindingMods.size !== eventMods.size) return false;
			for (const mod of bindingMods) {
				if (!eventMods.has(mod)) return false;
			}

			return true;
		}) ?? null;
	}

	// Format key for display
	formatKey(binding: KeyBinding): string {
		const parts: string[] = [];

		if (binding.modifiers.includes('ctrl')) {
			parts.push(isMac() ? '⌘' : 'Ctrl');
		}
		if (binding.modifiers.includes('shift')) {
			parts.push(isMac() ? '⇧' : 'Shift');
		}
		if (binding.modifiers.includes('alt')) {
			parts.push(isMac() ? '⌥' : 'Alt');
		}

		// Format special keys
		const keyDisplay = formatKeyDisplay(binding.key);
		parts.push(keyDisplay);

		return parts.join(isMac() ? '' : '+');
	}

	// Open/close modals
	openCommandPalette(): void {
		this.closeAllModals();
		this.showCommandPalette = true;
		this.mode = 'command-palette';
	}

	openHelp(): void {
		this.closeAllModals();
		this.showHelp = true;
		this.mode = 'help';
	}

	openImport(): void {
		this.closeAllModals();
		this.showImportExport = true;
		this.importExportMode = 'import';
	}

	openExport(): void {
		this.closeAllModals();
		this.showImportExport = true;
		this.importExportMode = 'export';
	}

	openSmartImport(initialText: string | null = null): void {
		this.closeAllModals();
		this.showSmartImport = true;
		this.smartImportInitialText = initialText;
		this.mode = 'smart-import';
	}

	closeAllModals(): void {
		this.showCommandPalette = false;
		this.showHelp = false;
		this.showImportExport = false;
		this.showSmartImport = false;
		this.smartImportInitialText = null;
		this.mode = 'normal';
	}

	setMode(mode: KeyboardMode): void {
		this.mode = mode;
	}
}

// Helper functions
function isMac(): boolean {
	if (typeof navigator === 'undefined') return false;
	return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

function formatKeyDisplay(key: string): string {
	const keyMap: Record<string, string> = {
		'ArrowUp': '↑',
		'ArrowDown': '↓',
		'ArrowLeft': '←',
		'ArrowRight': '→',
		'Enter': '↵',
		'Escape': 'Esc',
		'Delete': 'Del',
		'Backspace': '⌫',
		'Tab': 'Tab',
		'PageUp': 'PgUp',
		'PageDown': 'PgDn',
		' ': 'Space',
	};
	return keyMap[key] ?? key.toUpperCase();
}

// Get unique bindings for command palette
export function getUniqueBindings(): KeyBinding[] {
	const seen = new Set<string>();
	return keyBindings.filter(binding => {
		if (seen.has(binding.action)) return false;
		seen.add(binding.action);
		return true;
	});
}

// Context helpers
export function createKeyboardStore(): KeyboardStore {
	return new KeyboardStore();
}

export function setKeyboardContext(store: KeyboardStore): void {
	setContext(KEYBOARD_CONTEXT, store);
}

export function getKeyboardContext(): KeyboardStore {
	const store = getContext<KeyboardStore>(KEYBOARD_CONTEXT);
	if (!store) {
		throw new Error('KeyboardStore not found in context');
	}
	return store;
}
