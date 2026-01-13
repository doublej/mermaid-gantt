<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getClipboardWatcherContext } from '$lib/stores/clipboard-watcher.svelte';
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { ClipboardList } from '@lucide/svelte';

	const watcher = getClipboardWatcherContext();
	const keyboard = getKeyboardContext();

	function handleImport() {
		keyboard.openSmartImport(watcher.getDetectedText());
		watcher.dismiss();
	}

	function handleDismiss() {
		watcher.dismiss();
	}
</script>

{#if watcher.showNotification && watcher.detectedSchedule}
	<div class="clipboard-toast" transition:fly={{ y: 50, duration: 200 }}>
		<div class="toast-content">
			<div class="toast-icon">
				<ClipboardList size={20} />
			</div>
			<div class="toast-text">
				<strong>Schedule detected in clipboard</strong>
				<span class="preview">
					{#if watcher.detectedSchedule.preview.isMermaid}
						Valid Mermaid syntax - ready to import
					{:else}
						{watcher.detectedSchedule.preview.taskCount} task{watcher.detectedSchedule.preview.taskCount !== 1 ? 's' : ''} detected
						{#if watcher.detectedSchedule.preview.sections.length > 0}
							in {watcher.detectedSchedule.preview.sections.length} section{watcher.detectedSchedule.preview.sections.length !== 1 ? 's' : ''}
						{/if}
					{/if}
				</span>
			</div>
		</div>
		<div class="toast-actions">
			<button class="toast-btn primary" onclick={handleImport}>
				{watcher.detectedSchedule.preview.isMermaid ? 'Import' : 'Smart Import'}
			</button>
			<button class="toast-btn" onclick={handleDismiss}>
				Dismiss
			</button>
		</div>
	</div>
{/if}

<style>
	.clipboard-toast {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		padding: 1rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		max-width: 360px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.toast-content {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.toast-icon {
		flex-shrink: 0;
		color: var(--color-accent);
	}

	.toast-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.toast-text strong {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.toast-text .preview {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.toast-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.toast-btn {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 0.375rem;
		transition: all 0.15s ease;
		background: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	.toast-btn:hover {
		background: var(--color-surface);
		color: var(--color-text);
		border-color: var(--color-border-emphasis);
	}

	.toast-btn.primary {
		background: var(--color-accent);
		color: white;
		border-color: transparent;
	}

	.toast-btn.primary:hover {
		background: var(--color-accent-emphasis);
	}
</style>
