import { getContext, setContext } from 'svelte';

const HOTKEY_TOAST_CONTEXT = Symbol('hotkey-toast');

export interface HotkeyHint {
	action: string;
	keys: string[];
}

// Map UI actions to their keyboard shortcuts
const ACTION_HOTKEYS: Record<string, string[]> = {
	newTask: ['Ctrl', 'N'],
	undo: ['Ctrl', 'Z'],
	redo: ['Ctrl', 'Shift', 'Z'],
	openHistory: ['Ctrl', 'H'],
	openImport: ['Ctrl', 'O'],
	openExport: ['Ctrl', 'S'],
	openHelp: ['F1'],
	openFileBrowser: ['Ctrl', 'B'],
	openMermaidPreview: ['Ctrl', 'M'],
	openSettings: ['Ctrl', ','],
	zoomIn: ['Ctrl', '+'],
	zoomOut: ['Ctrl', '-'],
};

export class HotkeyToastStore {
	currentHint = $state<HotkeyHint | null>(null);
	private hideTimeout: ReturnType<typeof setTimeout> | null = null;

	show(action: string): void {
		const keys = ACTION_HOTKEYS[action];
		if (!keys) return;

		// Clear any existing timeout
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
		}

		this.currentHint = { action, keys };

		// Auto-hide after 2.5 seconds
		this.hideTimeout = setTimeout(() => {
			this.currentHint = null;
		}, 2500);
	}

	hide(): void {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = null;
		}
		this.currentHint = null;
	}
}

// Context helpers
export function createHotkeyToastStore(): HotkeyToastStore {
	return new HotkeyToastStore();
}

export function setHotkeyToastContext(store: HotkeyToastStore): void {
	setContext(HOTKEY_TOAST_CONTEXT, store);
}

export function getHotkeyToastContext(): HotkeyToastStore {
	const store = getContext<HotkeyToastStore>(HOTKEY_TOAST_CONTEXT);
	if (!store) {
		throw new Error('HotkeyToastStore not found in context');
	}
	return store;
}
