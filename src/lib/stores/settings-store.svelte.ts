import { getContext, setContext } from 'svelte';

const SETTINGS_CONTEXT = Symbol('settings');
const STORAGE_KEY = 'gantt:settings';

export type LabelPosition = 'inside' | 'beside';

interface Settings {
	sortTasksByStartDate: boolean;
	sidebarWidth: number;
	labelPosition: LabelPosition;
}

function defaultSettings(): Settings {
	return {
		sortTasksByStartDate: false,
		sidebarWidth: 240,
		labelPosition: 'inside'
	};
}

export class SettingsStore {
	sortTasksByStartDate = $state(false);
	sidebarWidth = $state(240);
	labelPosition = $state<LabelPosition>('inside');

	constructor() {
		if (typeof window !== 'undefined') {
			this.load();
		}
	}

	private load(): void {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return;
			const defaults = defaultSettings();
			const settings: Settings = JSON.parse(stored);
			this.sortTasksByStartDate = settings.sortTasksByStartDate ?? defaults.sortTasksByStartDate;
			this.sidebarWidth = settings.sidebarWidth ?? defaults.sidebarWidth;
			this.labelPosition = settings.labelPosition ?? defaults.labelPosition;
		} catch {
			// Use defaults on parse error
		}
	}

	private save(): void {
		if (typeof window === 'undefined') return;
		const settings: Settings = {
			sortTasksByStartDate: this.sortTasksByStartDate,
			sidebarWidth: this.sidebarWidth,
			labelPosition: this.labelPosition
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	}

	setSortTasksByStartDate(value: boolean): void {
		this.sortTasksByStartDate = value;
		this.save();
	}

	toggleSortTasksByStartDate(): void {
		this.setSortTasksByStartDate(!this.sortTasksByStartDate);
	}

	setSidebarWidth(value: number): void {
		this.sidebarWidth = Math.max(150, Math.min(500, value));
		this.save();
	}

	setLabelPosition(value: LabelPosition): void {
		this.labelPosition = value;
		this.save();
	}
}

// Context helpers
export function createSettingsStore(): SettingsStore {
	return new SettingsStore();
}

export function setSettingsContext(store: SettingsStore): void {
	setContext(SETTINGS_CONTEXT, store);
}

export function getSettingsContext(): SettingsStore {
	const store = getContext<SettingsStore>(SETTINGS_CONTEXT);
	if (!store) {
		throw new Error('SettingsStore not found in context');
	}
	return store;
}
