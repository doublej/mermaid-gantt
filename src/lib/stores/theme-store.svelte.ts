import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

const THEME_KEY = Symbol('theme');
const STORAGE_KEY = 'gantt:theme';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function createThemeStore() {
	let theme = $state<Theme>(getInitialTheme());
	let systemPreference = $state<ResolvedTheme>(getSystemPreference());

	const resolvedTheme = $derived<ResolvedTheme>(
		theme === 'system' ? systemPreference : theme
	);

	// Listen for system preference changes
	if (browser) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', (e) => {
			systemPreference = e.matches ? 'dark' : 'light';
		});
	}

	// Apply theme to document
	$effect(() => {
		if (!browser) return;

		const root = document.documentElement;
		if (resolvedTheme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	});

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, newTheme);
		}
	}

	function toggleTheme() {
		const next: Theme = resolvedTheme === 'light' ? 'dark' : 'light';
		setTheme(next);
	}

	return {
		get theme() { return theme; },
		get resolvedTheme() { return resolvedTheme; },
		setTheme,
		toggleTheme
	};
}

function getInitialTheme(): Theme {
	if (!browser) return 'system';

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return 'light';
}

function getSystemPreference(): ResolvedTheme {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export type ThemeStore = ReturnType<typeof createThemeStore>;

export function setThemeContext(store: ThemeStore) {
	setContext(THEME_KEY, store);
}

export function getThemeContext(): ThemeStore {
	return getContext(THEME_KEY);
}
