<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { extractPreview, type PreviewResult } from '$lib/utils/schedule-detector';
	import { buildImportPrompt, extractMermaidFromResponse } from '$lib/utils/llm-import-prompt';
	import { parseMermaidGantt, validateGanttData } from '$lib/utils/mermaid-parser';

	const gantt = getGanttContext();
	const keyboard = getKeyboardContext();

	// State
	let rawInput = $state('');
	let previewResult = $state<PreviewResult | null>(null);
	let importError = $state<string | null>(null);
	let copied = $state(false);
	let showPromptPreview = $state(false);

	// Initialize with pre-filled text if provided
	$effect(() => {
		if (keyboard.showSmartImport && keyboard.smartImportInitialText) {
			rawInput = keyboard.smartImportInitialText;
			keyboard.smartImportInitialText = null;
		}
	});

	// Update preview when input changes
	$effect(() => {
		if (rawInput.trim()) {
			previewResult = extractPreview(rawInput);
			importError = null;
		} else {
			previewResult = null;
		}
	});

	const llmPrompt = $derived(rawInput.trim() ? buildImportPrompt(rawInput) : '');

	function close() {
		rawInput = '';
		previewResult = null;
		importError = null;
		copied = false;
		showPromptPreview = false;
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
			if (showPromptPreview) {
				showPromptPreview = false;
			} else {
				close();
			}
		}
	}

	async function handleCopyPrompt() {
		try {
			await navigator.clipboard.writeText(llmPrompt);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Fallback
			const textarea = document.createElement('textarea');
			textarea.value = llmPrompt;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	function handleDirectImport() {
		importError = null;

		try {
			// Try to extract mermaid from response (in case user pasted LLM output)
			let mermaidText = extractMermaidFromResponse(rawInput);
			if (!mermaidText) {
				// Maybe it's raw mermaid
				mermaidText = rawInput.trim();
			}

			const data = parseMermaidGantt(mermaidText);
			const errors = validateGanttData(data);

			if (errors.length > 0) {
				importError = errors.join('\n');
				return;
			}

			gantt.importData(data);
			close();
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Failed to parse Mermaid syntax';
		}
	}

	function getConfidenceColor(confidence: 'high' | 'medium' | 'low'): string {
		switch (confidence) {
			case 'high':
				return 'var(--color-status-done)';
			case 'medium':
				return 'var(--color-status-active)';
			case 'low':
				return 'var(--color-status-critical)';
		}
	}
</script>

{#if keyboard.showSmartImport}
	<div
		class="modal-backdrop flex items-center justify-center"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Smart Import"
		tabindex="-1"
	>
		<div class="smart-import-modal">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-content">
					<h2 class="modal-title">Smart Import</h2>
					<p class="modal-subtitle">Paste schedules, task lists, or project descriptions</p>
				</div>
				<button onclick={close} class="btn-ghost" aria-label="Close">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="modal-content">
				{#if showPromptPreview}
					<!-- Prompt Preview -->
					<div class="prompt-preview">
						<div class="prompt-header">
							<h3 class="prompt-title">LLM Prompt</h3>
							<p class="prompt-hint">Copy this prompt and paste it into ChatGPT, Claude, or your preferred AI</p>
						</div>
						<pre class="prompt-text">{llmPrompt}</pre>
					</div>
				{:else}
					<!-- Input Area -->
					<div class="input-section">
						<label for="smart-import-input" class="input-label">
							Paste your schedule, task list, or project description:
						</label>
						<textarea
							id="smart-import-input"
							bind:value={rawInput}
							placeholder="Examples:
- Meeting notes with dates and phases
- Bullet-point task lists
- Project descriptions with timelines
- Spreadsheet data (tab-separated)
- Or paste LLM-generated Mermaid output to import directly"
							class="input-textarea"
						></textarea>
					</div>

					<!-- Preview -->
					{#if previewResult}
						<div class="preview-section">
							<div class="preview-header">
								<span class="preview-label">Analysis</span>
								<span
									class="confidence-badge"
									style="background-color: {getConfidenceColor(previewResult.confidence)}"
								>
									{previewResult.confidence} confidence
								</span>
							</div>

							<div class="preview-stats">
								{#if previewResult.isMermaid}
									<div class="stat">
										<span class="stat-icon">OK</span>
										<span>Valid Mermaid syntax detected</span>
									</div>
								{:else}
									<div class="stat">
										<span class="stat-value">{previewResult.taskCount}</span>
										<span>task{previewResult.taskCount !== 1 ? 's' : ''} detected</span>
									</div>
								{/if}

								{#if previewResult.sections.length > 0}
									<div class="stat">
										<span class="stat-value">{previewResult.sections.length}</span>
										<span>section{previewResult.sections.length !== 1 ? 's' : ''}: {previewResult.sections.slice(0, 3).join(', ')}{previewResult.sections.length > 3 ? '...' : ''}</span>
									</div>
								{/if}

								{#if previewResult.dateRange}
									<div class="stat">
										<svg class="stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<span>{previewResult.dateRange.start} to {previewResult.dateRange.end}</span>
									</div>
								{/if}
							</div>

							{#if previewResult.warnings.length > 0}
								<div class="preview-warnings">
									{#each previewResult.warnings as warning}
										<div class="warning">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
											</svg>
											<span>{warning}</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					{#if importError}
						<div class="error-box">{importError}</div>
					{/if}
				{/if}
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				{#if showPromptPreview}
					<button onclick={() => (showPromptPreview = false)} class="btn-secondary">
						Back
					</button>
					<button onclick={handleCopyPrompt} class="btn-primary">
						{copied ? 'Copied!' : 'Copy Prompt'}
					</button>
				{:else}
					<button onclick={close} class="btn-secondary">Cancel</button>

					<div class="action-buttons">
						{#if previewResult?.isMermaid}
							<button
								onclick={handleDirectImport}
								disabled={!rawInput.trim()}
								class="btn-primary"
							>
								Import Directly
							</button>
						{:else}
							<button
								onclick={() => (showPromptPreview = true)}
								disabled={!rawInput.trim()}
								class="btn-secondary"
							>
								Copy Prompt for AI
							</button>
							<button
								onclick={handleDirectImport}
								disabled={!rawInput.trim() || !previewResult?.isMermaid}
								class="btn-primary"
								title={previewResult?.isMermaid ? 'Import as Mermaid' : 'First convert using AI, then paste the result here'}
							>
								Import Mermaid
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.smart-import-modal {
		width: 100%;
		max-width: 48rem;
		max-height: 90vh;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.modal-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.modal-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.input-textarea {
		width: 100%;
		height: 14rem;
		padding: 0.75rem;
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		color: var(--color-text);
		resize: none;
	}

	.input-textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-light);
	}

	.input-textarea::placeholder {
		color: var(--color-text-tertiary);
	}

	.preview-section {
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.preview-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-secondary);
	}

	.confidence-badge {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
	}

	.preview-stats {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.stat-value {
		font-weight: 600;
		color: var(--color-accent);
	}

	.stat-icon {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-status-done);
	}

	.stat-icon-svg {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.preview-warnings {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.warning {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-status-active);
	}

	.prompt-preview {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.prompt-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.prompt-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.prompt-hint {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.prompt-text {
		width: 100%;
		max-height: 24rem;
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

	.error-box {
		padding: 0.75rem;
		font-size: 0.875rem;
		color: var(--color-status-critical);
		background-color: color-mix(in srgb, var(--color-status-critical) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-status-critical) 30%, transparent);
		border-radius: 0.5rem;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary:disabled,
	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
