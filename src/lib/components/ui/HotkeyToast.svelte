<script lang="ts">
	import { getHotkeyToastContext } from '$lib/stores/hotkey-toast-store.svelte';
	import { getKeyWidthClass } from '$lib/stores/keyboard-store.svelte';

	const toast = getHotkeyToastContext();

	// Platform detection for key display
	const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');

	function formatKey(key: string): string {
		if (key === 'Ctrl') return isMac ? '⌘' : 'Ctrl';
		if (key === 'Shift') return isMac ? '⇧' : 'Shift';
		if (key === 'Alt') return isMac ? '⌥' : 'Alt';
		return key;
	}
</script>

{#if toast.currentHint}
	<div class="hotkey-toast" role="status" aria-live="polite">
		<span class="toast-tip">Tip:</span>
		<span class="toast-keys">
			{#each toast.currentHint.keys as key, i}
				{#if i > 0}
					<span class="toast-separator">+</span>
				{/if}
				<kbd class="toast-key {getKeyWidthClass(formatKey(key))}">{formatKey(key)}</kbd>
			{/each}
		</span>
	</div>
{/if}

<style>
	.hotkey-toast {
		position: fixed;
		bottom: 4rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		font-size: 0.75rem;
		animation: slideIn 0.2s ease-out;
		z-index: 100;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(1rem);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.toast-tip {
		color: var(--color-text-tertiary);
	}

	.toast-keys {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.toast-separator {
		color: var(--color-text-tertiary);
		font-size: 0.625rem;
	}

	.toast-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		font-size: 0.625rem;
		font-weight: 500;
		font-family: var(--font-family-mono);
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
	}

	/* Key width modifiers */
	.toast-key:global(.kbd-wide) { min-width: 1.75rem; }
	.toast-key:global(.kbd-medium) { min-width: 1.5rem; }
	.toast-key:global(.kbd-narrow) { min-width: 1.25rem; }
	.toast-key:global(.kbd-space) { min-width: 2.5rem; }
</style>
