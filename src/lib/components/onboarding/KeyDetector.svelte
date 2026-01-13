<script lang="ts">
	import type { KeyboardLesson } from '$lib/data/keyboard-lessons';

	interface Props {
		lesson: KeyboardLesson;
		onMatch?: () => void;
	}

	let { lesson, onMatch }: Props = $props();

	let pressedKeys = $state<Set<string>>(new Set());
	let matched = $state(false);

	function formatKey(key: string): string {
		const keyMap: Record<string, string> = {
			'ArrowUp': '↑',
			'ArrowDown': '↓',
			'ArrowLeft': '←',
			'ArrowRight': '→',
			'Enter': 'Enter',
			'Escape': 'Esc',
			'Delete': 'Del',
			'Backspace': 'Backspace',
			'Tab': 'Tab',
			'PageUp': 'PgUp',
			'PageDown': 'PgDn',
			' ': 'Space',
			'Control': 'Ctrl',
			'Meta': 'Cmd',
			'Shift': 'Shift',
			'Alt': 'Alt'
		};
		return keyMap[key] ?? key.toUpperCase();
	}

	function normalizeKey(key: string): string {
		if (key === 'Meta') return 'Cmd';
		if (key === 'Control') return 'Ctrl';
		return key;
	}

	function handleKeyDown(e: KeyboardEvent): void {
		e.preventDefault();

		const key = normalizeKey(e.key);

		// Add the key to pressed set
		if (key === 'Ctrl' || key === 'Cmd' || key === 'Shift' || key === 'Alt') {
			pressedKeys.add(key);
		} else {
			pressedKeys.add(key);
		}

		// Check if keys match
		checkMatch();
	}

	function handleKeyUp(e: KeyboardEvent): void {
		const key = normalizeKey(e.key);
		pressedKeys.delete(key);
	}

	function checkMatch(): void {
		if (matched) return;

		const expectedKeys = new Set(
			lesson.keys.map((k) => (k === 'Ctrl' && isMac() ? 'Cmd' : k))
		);
		const actualKeys = new Set(pressedKeys);

		if (expectedKeys.size === actualKeys.size) {
			let allMatch = true;
			for (const key of expectedKeys) {
				if (!actualKeys.has(key)) {
					allMatch = false;
					break;
				}
			}

			if (allMatch) {
				matched = true;
				pressedKeys.clear();
				onMatch?.();
			}
		}
	}

	function isMac(): boolean {
		if (typeof navigator === 'undefined') return false;
		return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	}

	function getPressedKeysDisplay(): string[] {
		return Array.from(pressedKeys).map(formatKey);
	}

	function getExpectedKeysDisplay(): string[] {
		return lesson.keys.map((k) => {
			if (k === 'Ctrl' && isMac()) {
				return 'Cmd';
			}
			return formatKey(k);
		});
	}

	// Show animation when matched
	const animationClass = $derived(matched ? 'animate-pulse bg-green-100 dark:bg-green-900' : '');
</script>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

<div class="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
	<div>
		<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Keys to Press:</h3>
		<div class="flex gap-1 flex-wrap">
			{#each getExpectedKeysDisplay() as key (key)}
				<kbd
					class="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono"
				>
					{key}
				</kbd>
			{/each}
		</div>
	</div>

	<div class={`p-3 rounded transition-colors ${animationClass}`}>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			{lesson.instruction}
		</p>
	</div>

	{#if getPressedKeysDisplay().length > 0}
		<div>
			<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Keys you pressed:</p>
			<div class="flex gap-1 flex-wrap">
				{#each getPressedKeysDisplay() as key (key)}
					<kbd
						class="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-xs font-mono"
					>
						{key}
					</kbd>
				{/each}
			</div>
		</div>
	{/if}

	{#if matched}
		<div class="text-sm text-green-600 dark:text-green-400 font-semibold">
			✓ Correct! Moving to next lesson...
		</div>
	{/if}
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	:global(.animate-pulse) {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
