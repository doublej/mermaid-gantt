/**
 * Clipboard watcher store for Smart Import
 * Monitors clipboard for schedule-like content on window focus
 */

import { getContext, setContext } from 'svelte';
import { isLikelySchedule, extractPreview, type PreviewResult } from '$lib/utils/schedule-detector';

const CLIPBOARD_WATCHER_CONTEXT = Symbol('clipboard-watcher');

export interface DetectedSchedule {
	text: string;
	preview: PreviewResult;
	timestamp: number;
}

export class ClipboardWatcherStore {
	isEnabled = $state(true);
	lastClipboardText = $state('');
	detectedSchedule = $state<DetectedSchedule | null>(null);
	showNotification = $state(false);

	private focusHandler: (() => void) | null = null;
	private dismissTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Start watching clipboard on window focus
	 */
	start(): void {
		if (typeof window === 'undefined') return;

		this.focusHandler = () => {
			if (this.isEnabled) {
				this.checkClipboard();
			}
		};

		window.addEventListener('focus', this.focusHandler);
	}

	/**
	 * Stop watching clipboard
	 */
	stop(): void {
		if (this.focusHandler) {
			window.removeEventListener('focus', this.focusHandler);
			this.focusHandler = null;
		}
		if (this.dismissTimeout) {
			clearTimeout(this.dismissTimeout);
			this.dismissTimeout = null;
		}
	}

	/**
	 * Check clipboard for schedule content
	 */
	private async checkClipboard(): Promise<void> {
		try {
			// Only check if clipboard API is available
			if (!navigator.clipboard?.readText) return;

			const text = await navigator.clipboard.readText();

			// Skip if same as last check or empty
			if (!text || text === this.lastClipboardText) return;

			this.lastClipboardText = text;

			// Check if it looks like a schedule
			if (isLikelySchedule(text)) {
				const preview = extractPreview(text);

				this.detectedSchedule = {
					text,
					preview,
					timestamp: Date.now(),
				};
				this.showNotification = true;

				// Auto-dismiss after 15 seconds
				if (this.dismissTimeout) {
					clearTimeout(this.dismissTimeout);
				}
				this.dismissTimeout = setTimeout(() => {
					this.dismiss();
				}, 15000);
			}
		} catch {
			// Clipboard access denied or unavailable - silently ignore
		}
	}

	/**
	 * Dismiss the current notification
	 */
	dismiss(): void {
		this.showNotification = false;
		if (this.dismissTimeout) {
			clearTimeout(this.dismissTimeout);
			this.dismissTimeout = null;
		}
	}

	/**
	 * Enable/disable clipboard watching
	 */
	setEnabled(enabled: boolean): void {
		this.isEnabled = enabled;
		if (!enabled) {
			this.dismiss();
		}
	}

	/**
	 * Get the detected schedule text for import
	 */
	getDetectedText(): string | null {
		return this.detectedSchedule?.text ?? null;
	}

	/**
	 * Clear the detected schedule after import
	 */
	clearDetected(): void {
		this.detectedSchedule = null;
		this.showNotification = false;
	}
}

// Context helpers
export function createClipboardWatcherStore(): ClipboardWatcherStore {
	return new ClipboardWatcherStore();
}

export function setClipboardWatcherContext(store: ClipboardWatcherStore): void {
	setContext(CLIPBOARD_WATCHER_CONTEXT, store);
}

export function getClipboardWatcherContext(): ClipboardWatcherStore {
	const store = getContext<ClipboardWatcherStore>(CLIPBOARD_WATCHER_CONTEXT);
	if (!store) {
		throw new Error('ClipboardWatcherStore not found in context');
	}
	return store;
}
