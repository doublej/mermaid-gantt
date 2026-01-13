<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { parseMermaidGantt, validateGanttData } from '$lib/utils/mermaid-parser';
	import { exportToMermaid, exportToJson, importFromJson } from '$lib/utils/mermaid-exporter';

	const gantt = getGanttContext();
	const keyboard = getKeyboardContext();

	let importText = $state('');
	let importFormat = $state<'mermaid' | 'json'>('mermaid');
	let importError = $state<string | null>(null);
	let exportFormat = $state<'mermaid' | 'json'>('mermaid');
	let copied = $state(false);

	const exportText = $derived(
		exportFormat === 'mermaid' ? exportToMermaid(gantt.data) : exportToJson(gantt.data)
	);

	function close() {
		importText = '';
		importError = null;
		keyboard.closeAllModals();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	function handleImport() {
		importError = null;

		try {
			let data;
			if (importFormat === 'mermaid') {
				data = parseMermaidGantt(importText);
			} else {
				data = importFromJson(importText);
			}

			// Validate
			const errors = validateGanttData(data);
			if (errors.length > 0) {
				importError = errors.join('\n');
				return;
			}

			gantt.importData(data);
			close();
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Failed to parse input';
		}
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(exportText);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Fallback for older browsers
			const textarea = document.createElement('textarea');
			textarea.value = exportText;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	function handleDownload() {
		const blob = new Blob([exportText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `gantt-chart.${exportFormat === 'mermaid' ? 'mmd' : 'json'}`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			importText = e.target?.result as string;
			// Auto-detect format
			if (file.name.endsWith('.json')) {
				importFormat = 'json';
			} else {
				importFormat = 'mermaid';
			}
		};
		reader.readAsText(file);
	}
</script>

{#if keyboard.showImportExport}
	<div
		class="modal-backdrop flex items-center justify-center"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label={keyboard.importExportMode === 'import' ? 'Import' : 'Export'}
		tabindex="-1"
	>
		<div class="io-modal">
			<!-- Header with tabs -->
			<div class="io-tabs">
				<button
					onclick={() => (keyboard.importExportMode = 'import')}
					class="io-tab"
					class:active={keyboard.importExportMode === 'import'}
				>
					Import
				</button>
				<button
					onclick={() => (keyboard.importExportMode = 'export')}
					class="io-tab"
					class:active={keyboard.importExportMode === 'export'}
				>
					Export
				</button>
				<button onclick={close} class="btn-ghost ml-auto" aria-label="Close">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				{#if keyboard.importExportMode === 'import'}
					<!-- Import mode -->
					<div class="space-y-4">
						<!-- Format selector -->
						<div class="flex gap-4">
							<label class="radio-label">
								<input
									type="radio"
									bind:group={importFormat}
									value="mermaid"
									class="radio-input"
								/>
								<span>Mermaid</span>
							</label>
							<label class="radio-label">
								<input
									type="radio"
									bind:group={importFormat}
									value="json"
									class="radio-input"
								/>
								<span>JSON</span>
							</label>
						</div>

						<!-- File upload -->
						<div class="flex items-center gap-4">
							<label class="btn-secondary cursor-pointer">
								<input
									type="file"
									accept=".mmd,.json,.txt"
									onchange={handleFileUpload}
									class="hidden"
								/>
								Upload file
							</label>
							<span class="text-sm text-secondary">or paste below</span>
						</div>

						<!-- Text input -->
						<textarea
							bind:value={importText}
							placeholder={importFormat === 'mermaid'
								? 'gantt\n    title My Project\n    section Tasks\n    Task 1 :active, t1, 2024-01-01, 7d'
								: '{"config": {...}, "sections": [...], "tasks": [...]}'}
							class="io-textarea"
						></textarea>

						{#if importError}
							<div class="error-box">
								{importError}
							</div>
						{/if}
					</div>
				{:else}
					<!-- Export mode -->
					<div class="space-y-4">
						<!-- Format selector -->
						<div class="flex gap-4">
							<label class="radio-label">
								<input
									type="radio"
									bind:group={exportFormat}
									value="mermaid"
									class="radio-input"
								/>
								<span>Mermaid</span>
							</label>
							<label class="radio-label">
								<input
									type="radio"
									bind:group={exportFormat}
									value="json"
									class="radio-input"
								/>
								<span>JSON</span>
							</label>
						</div>

						<!-- Preview -->
						<pre class="io-preview">{exportText}</pre>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="io-footer">
				{#if keyboard.importExportMode === 'import'}
					<button onclick={close} class="btn-secondary">
						Cancel
					</button>
					<button
						onclick={handleImport}
						disabled={!importText.trim()}
						class="btn-primary"
					>
						Import
					</button>
				{:else}
					<button onclick={handleCopy} class="btn-secondary">
						{copied ? 'Copied!' : 'Copy to clipboard'}
					</button>
					<button onclick={handleDownload} class="btn-primary">
						Download
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.io-modal {
		width: 100%;
		max-width: 42rem;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.io-tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border);
	}

	.io-tab {
		flex: 1;
		padding: 1rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		transition: all 0.15s ease;
	}

	.io-tab:hover {
		color: var(--color-text);
	}

	.io-tab.active {
		color: var(--color-accent);
		border-bottom: 2px solid var(--color-accent);
		background-color: var(--color-accent-subtle);
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text);
		cursor: pointer;
	}

	.radio-input {
		accent-color: var(--color-accent);
	}

	.io-textarea {
		width: 100%;
		height: 16rem;
		padding: 0.75rem;
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		color: var(--color-text);
		resize: none;
	}

	.io-textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-light);
	}

	.io-textarea::placeholder {
		color: var(--color-text-tertiary);
	}

	.io-preview {
		width: 100%;
		height: 16rem;
		padding: 0.75rem;
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		color: var(--color-text);
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.error-box {
		padding: 0.75rem;
		font-size: 0.875rem;
		color: var(--color-status-critical);
		background-color: color-mix(in srgb, var(--color-status-critical) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-status-critical) 30%, transparent);
		border-radius: 0.5rem;
	}

	.io-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}
</style>
