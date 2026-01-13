<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { parseMermaidGantt, validateGanttData } from '$lib/utils/mermaid-parser';
	import { exportToMermaid, exportToJson, importFromJson } from '$lib/utils/mermaid-exporter';
	import { exportToCSV, downloadCSV } from '$lib/utils/csv-exporter';
	import { exportToPDF } from '$lib/utils/pdf-exporter';
	import { exportToPNG } from '$lib/utils/png-exporter';
	import { downloadBlob } from '$lib/utils/download';
	import CSVImporter from './CSVImporter.svelte';
	import type { GanttData } from '$lib/types';

	interface Props {
		ganttElement?: HTMLElement | null;
	}

	const { ganttElement = null }: Props = $props();

	const gantt = getGanttContext();
	const keyboard = getKeyboardContext();

	// Import state
	let importText = $state('');
	let importFormat = $state<'mermaid' | 'json' | 'csv'>('mermaid');
	let importError = $state<string | null>(null);
	let showCSVImporter = $state(false);

	// Export state
	let exportFormat = $state<'mermaid' | 'json' | 'csv'>('mermaid');
	let copied = $state(false);
	let exporting = $state<'pdf' | 'png' | null>(null);

	const exportText = $derived(() => {
		if (exportFormat === 'mermaid') return exportToMermaid(gantt.data);
		if (exportFormat === 'json') return exportToJson(gantt.data);
		if (exportFormat === 'csv') return exportToCSV(gantt.data, { includeBOM: false });
		return '';
	});

	function close() {
		importText = '';
		importError = null;
		showCSVImporter = false;
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
			if (showCSVImporter) {
				showCSVImporter = false;
			} else {
				close();
			}
		}
	}

	function handleImport() {
		importError = null;

		try {
			let data;
			if (importFormat === 'mermaid') {
				data = parseMermaidGantt(importText);
			} else if (importFormat === 'json') {
				data = importFromJson(importText);
			} else {
				// CSV handled by separate component
				return;
			}

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

	function handleCSVImport(data: GanttData) {
		gantt.importData(data);
		close();
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(exportText());
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = exportText();
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	function handleDownload() {
		if (exportFormat === 'csv') {
			downloadCSV(gantt.data);
			return;
		}

		const blob = new Blob([exportText()], { type: 'text/plain' });
		downloadBlob(blob, `gantt-chart.${exportFormat === 'mermaid' ? 'mmd' : 'json'}`);
	}

	async function handlePDFExport() {
		if (!ganttElement) {
			importError = 'Gantt chart element not available';
			return;
		}

		exporting = 'pdf';
		try {
			await exportToPDF(ganttElement, {
				orientation: 'landscape',
				filename: `${gantt.data.config.title || 'gantt-chart'}.pdf`
			});
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Failed to export PDF';
		} finally {
			exporting = null;
		}
	}

	async function handlePNGExport() {
		if (!ganttElement) {
			importError = 'Gantt chart element not available';
			return;
		}

		exporting = 'png';
		try {
			await exportToPNG(ganttElement, {
				scale: 2,
				filename: `${gantt.data.config.title || 'gantt-chart'}.png`
			});
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Failed to export PNG';
		} finally {
			exporting = null;
		}
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			importText = e.target?.result as string;
			if (file.name.endsWith('.json')) {
				importFormat = 'json';
			} else if (file.name.endsWith('.csv')) {
				importFormat = 'csv';
				showCSVImporter = true;
			} else {
				importFormat = 'mermaid';
			}
		};
		reader.readAsText(file);
		// Reset input to allow re-uploading the same file
		input.value = '';
	}

	function openCSVImporter() {
		showCSVImporter = true;
	}

	function openSmartImport() {
		close();
		keyboard.openSmartImport();
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
		{#if showCSVImporter}
			<div class="io-modal">
				<CSVImporter onClose={() => (showCSVImporter = false)} onImport={handleCSVImport} />
			</div>
		{:else}
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
							<!-- Smart Import banner -->
							<div class="smart-import-banner">
								<div class="banner-content">
									<svg class="banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
									<div class="banner-text">
										<strong>Have unstructured data?</strong>
										<span>Try Smart Import to convert task lists, project descriptions, or meeting notes</span>
									</div>
								</div>
								<button onclick={openSmartImport} class="btn-secondary text-sm">
									Smart Import
								</button>
							</div>

							<!-- Format selector -->
							<div class="flex gap-4 flex-wrap">
								<label class="radio-label">
									<input type="radio" bind:group={importFormat} value="mermaid" class="radio-input" />
									<span>Mermaid</span>
								</label>
								<label class="radio-label">
									<input type="radio" bind:group={importFormat} value="json" class="radio-input" />
									<span>JSON</span>
								</label>
								<label class="radio-label">
									<input type="radio" bind:group={importFormat} value="csv" class="radio-input" />
									<span>CSV</span>
								</label>
							</div>

							{#if importFormat === 'csv'}
								<div class="csv-prompt">
									<p class="text-sm text-secondary mb-3">
										CSV import requires column mapping to match your file's structure.
									</p>
									<button onclick={openCSVImporter} class="btn-primary">
										Open CSV Importer
									</button>
								</div>
							{:else}
								<!-- File upload -->
								<div class="flex items-center gap-4">
									<label class="btn-secondary cursor-pointer">
										<input
											type="file"
											accept=".mmd,.json,.csv,.txt"
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
							{/if}

							{#if importError}
								<div class="error-box">{importError}</div>
							{/if}
						</div>
					{:else}
						<!-- Export mode -->
						<div class="space-y-4">
							<!-- Text format selector -->
							<div class="format-section">
								<h4 class="format-label">Text Format</h4>
								<div class="flex gap-4 flex-wrap">
									<label class="radio-label">
										<input type="radio" bind:group={exportFormat} value="mermaid" class="radio-input" />
										<span>Mermaid</span>
									</label>
									<label class="radio-label">
										<input type="radio" bind:group={exportFormat} value="json" class="radio-input" />
										<span>JSON</span>
									</label>
									<label class="radio-label">
										<input type="radio" bind:group={exportFormat} value="csv" class="radio-input" />
										<span>CSV</span>
									</label>
								</div>
							</div>

							<!-- Preview -->
							<pre class="io-preview">{exportText()}</pre>

							<!-- Image export section -->
							<div class="format-section">
								<h4 class="format-label">Image Export</h4>
								<div class="export-buttons">
									<button
										onclick={handlePDFExport}
										class="export-btn"
										disabled={!ganttElement || exporting !== null}
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
										</svg>
										<span>{exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
									</button>
									<button
										onclick={handlePNGExport}
										class="export-btn"
										disabled={!ganttElement || exporting !== null}
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<span>{exporting === 'png' ? 'Exporting...' : 'Export PNG'}</span>
									</button>
									<a href="/mermaid-preview" class="export-btn" target="_blank" rel="noopener">
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
										<span>Mermaid Preview</span>
									</a>
								</div>
								{#if !ganttElement}
									<p class="text-xs text-secondary mt-2">
										Image export requires the Gantt chart to be visible.
									</p>
								{/if}
							</div>

							{#if importError}
								<div class="error-box">{importError}</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Footer -->
				<div class="io-footer">
					{#if keyboard.importExportMode === 'import'}
						<button onclick={close} class="btn-secondary">Cancel</button>
						{#if importFormat !== 'csv'}
							<button
								onclick={handleImport}
								disabled={!importText.trim()}
								class="btn-primary"
							>
								Import
							</button>
						{/if}
					{:else}
						<button onclick={handleCopy} class="btn-secondary">
							{copied ? 'Copied!' : 'Copy to clipboard'}
						</button>
						<button onclick={handleDownload} class="btn-primary">Download</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.io-modal {
		width: 100%;
		max-width: 42rem;
		max-height: 90vh;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.io-tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
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
		height: 12rem;
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
		height: 10rem;
		padding: 0.75rem;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		color: var(--color-text);
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.format-section {
		border-top: 1px solid var(--color-border);
		padding-top: 1rem;
	}

	.format-label {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-secondary);
		margin-bottom: 0.75rem;
	}

	.export-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.export-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: var(--color-text);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		transition: all 0.15s ease;
		text-decoration: none;
	}

	.export-btn:hover:not(:disabled) {
		background-color: var(--color-surface-elevated);
		border-color: var(--color-border-emphasis);
	}

	.export-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.csv-prompt {
		padding: 1.5rem;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		text-align: center;
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
		flex-shrink: 0;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.smart-import-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, var(--color-accent-subtle) 0%, var(--color-surface-elevated) 100%);
		border: 1px solid var(--color-accent-light);
		border-radius: 0.5rem;
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.banner-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		color: var(--color-accent);
	}

	.banner-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.banner-text strong {
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.banner-text span {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
</style>
