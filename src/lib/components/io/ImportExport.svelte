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
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label={keyboard.importExportMode === 'import' ? 'Import' : 'Export'}
	>
		<div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
			<!-- Header with tabs -->
			<div class="flex border-b border-gray-200">
				<button
					onclick={() => (keyboard.importExportMode = 'import')}
					class="flex-1 px-6 py-4 text-sm font-medium transition-colors
						{keyboard.importExportMode === 'import'
						? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
						: 'text-gray-500 hover:text-gray-700'}"
				>
					Import
				</button>
				<button
					onclick={() => (keyboard.importExportMode = 'export')}
					class="flex-1 px-6 py-4 text-sm font-medium transition-colors
						{keyboard.importExportMode === 'export'
						? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
						: 'text-gray-500 hover:text-gray-700'}"
				>
					Export
				</button>
				<button
					onclick={close}
					class="px-4 py-4 text-gray-400 hover:text-gray-600"
					aria-label="Close"
				>
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
							<label class="flex items-center gap-2">
								<input
									type="radio"
									bind:group={importFormat}
									value="mermaid"
									class="text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-700">Mermaid</span>
							</label>
							<label class="flex items-center gap-2">
								<input
									type="radio"
									bind:group={importFormat}
									value="json"
									class="text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-700">JSON</span>
							</label>
						</div>

						<!-- File upload -->
						<div class="flex items-center gap-4">
							<label
								class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
							>
								<input
									type="file"
									accept=".mmd,.json,.txt"
									onchange={handleFileUpload}
									class="hidden"
								/>
								Upload file
							</label>
							<span class="text-sm text-gray-500">or paste below</span>
						</div>

						<!-- Text input -->
						<textarea
							bind:value={importText}
							placeholder={importFormat === 'mermaid'
								? 'gantt\n    title My Project\n    section Tasks\n    Task 1 :active, t1, 2024-01-01, 7d'
								: '{"config": {...}, "sections": [...], "tasks": [...]}'}
							class="w-full h-64 px-3 py-2 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						></textarea>

						{#if importError}
							<div class="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
								{importError}
							</div>
						{/if}
					</div>
				{:else}
					<!-- Export mode -->
					<div class="space-y-4">
						<!-- Format selector -->
						<div class="flex gap-4">
							<label class="flex items-center gap-2">
								<input
									type="radio"
									bind:group={exportFormat}
									value="mermaid"
									class="text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-700">Mermaid</span>
							</label>
							<label class="flex items-center gap-2">
								<input
									type="radio"
									bind:group={exportFormat}
									value="json"
									class="text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-700">JSON</span>
							</label>
						</div>

						<!-- Preview -->
						<pre
							class="w-full h-64 px-3 py-2 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg overflow-auto"
						>{exportText}</pre>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
				{#if keyboard.importExportMode === 'import'}
					<button
						onclick={close}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onclick={handleImport}
						disabled={!importText.trim()}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Import
					</button>
				{:else}
					<button
						onclick={handleCopy}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						{copied ? 'Copied!' : 'Copy to clipboard'}
					</button>
					<button
						onclick={handleDownload}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
					>
						Download
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
