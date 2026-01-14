<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { exportToMermaid } from '$lib/utils/mermaid-exporter';
	import { Copy, Check, ExternalLink } from '@lucide/svelte';

	const gantt = getGanttContext();
	const keyboard = getKeyboardContext();

	let copied = $state(false);

	const mermaidCode = $derived(exportToMermaid(gantt.data));

	function close() {
		keyboard.closeAllModals();
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(mermaidCode);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = mermaidCode;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	function openInMermaidLive() {
		const encoded = btoa(mermaidCode);
		const url = `https://mermaid.live/edit#base64:${encoded}`;
		window.open(url, '_blank', 'noopener,noreferrer');
	}
</script>

{#if keyboard.showMermaidPreview}
	<button class="modal-backdrop" onclick={close} aria-label="Close"></button>

	<div class="preview-panel">
		<div class="panel-header">
			<h2 class="text-lg font-semibold text-primary">Mermaid Preview</h2>
			<button onclick={close} class="btn-ghost" aria-label="Close">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="panel-content">
			<pre class="code-preview">{mermaidCode}</pre>
		</div>

		<div class="panel-footer">
			<button onclick={copyToClipboard} class="copy-btn">
				{#if copied}
					<Check size={16} />
					Copied!
				{:else}
					<Copy size={16} />
					Copy
				{/if}
			</button>
			<button onclick={openInMermaidLive} class="external-btn">
				<ExternalLink size={16} />
				Open in Mermaid Live
			</button>
		</div>
	</div>
{/if}

<style>
	.preview-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 24rem;
		background-color: var(--color-surface);
		box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
		z-index: 50;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.code-preview {
		width: 100%;
		padding: 0.75rem;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		line-height: 1.5;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		color: var(--color-text);
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.panel-footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.copy-btn,
	.external-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		border-radius: 0.375rem;
		transition: all 0.15s ease;
	}

	.copy-btn {
		color: var(--color-accent);
		background-color: var(--color-accent-subtle);
	}

	.copy-btn:hover {
		background-color: var(--color-accent-light);
	}

	.external-btn {
		color: var(--color-text-secondary);
		background-color: transparent;
	}

	.external-btn:hover {
		color: var(--color-text);
		background-color: var(--color-surface-elevated);
	}
</style>
