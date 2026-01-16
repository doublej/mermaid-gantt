import { getContext, setContext } from 'svelte';

const SETTINGS_CONTEXT = Symbol('settings');
const STORAGE_KEY = 'gantt:settings';

interface Settings {
	sortTasksByStartDate: boolean;
}

function defaultSettings(): Settings {
	return {
		sortTasksByStartDate: false
	};
}

export class SettingsStore {
	sortTasksByStartDate = $state(false);

	constructor() {
		if (typeof window !== 'undefined') {
			this.load();
		}
	}

	private load(): void {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const settings: Settings = JSON.parse(stored);
				this.sortTasksByStartDate = settings.sortTasksByStartDate ?? false;
			}
		} catch {
			// Use defaults on parse error
		}
	}

	private save(): void {
		if (typeof window === 'undefined') return;
		const settings: Settings = {
			sortTasksByStartDate: this.sortTasksByStartDate
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
