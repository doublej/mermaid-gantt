<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let mermaidCode = $state(`gantt
    title Sample Project
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1 :active, t1, 2024-01-01, 7d
    Task 2 :t2, after t1, 5d
    section Phase 2
    Task 3 :t3, 2024-01-15, 10d`);

	let renderError = $state<string | null>(null);
	let previewElement = $state<HTMLElement | null>(null);
	let copied = $state(false);
	let mermaidInstance: typeof import('mermaid').default | null = null;

	async function renderMermaid() {
		if (!browser || !previewElement || !mermaidInstance) return;

		renderError = null;
		previewElement.innerHTML = '';

		try {
			const { svg } = await mermaidInstance.render('mermaid-preview', mermaidCode);
			previewElement.innerHTML = svg;
		} catch (err) {
			renderError = err instanceof Error ? err.message : 'Failed to render Mermaid diagram';
		}
	}

	async function loadFromStorage() {
		if (!browser) return;

		try {
			// Try to load from localStorage
			const projectsJson = localStorage.getItem('gantt-projects');
			if (!projectsJson) {
				renderError = 'No projects found in localStorage';
				return;
			}

			const projects = JSON.parse(projectsJson);
			const currentProjectId = localStorage.getItem('gantt-current-project');
			const projectKey = currentProjectId
				? `gantt-project-${currentProjectId}`
				: Object.keys(localStorage).find((k) => k.startsWith('gantt-project-'));

			if (!projectKey) {
				renderError = 'No project data found';
				return;
			}

			const projectJson = localStorage.getItem(projectKey.replace('gantt-project-', '') ? projectKey : projectKey);
			if (!projectJson) {
				renderError = 'Project data not found';
				return;
			}

			const project = JSON.parse(projectJson);

			// Convert to Mermaid format
			const lines: string[] = ['gantt'];
			const data = project.current;

			if (data.config?.title) {
				lines.push(`    title ${data.config.title}`);
			}
			lines.push(`    dateFormat ${data.config?.dateFormat ?? 'YYYY-MM-DD'}`);

			// Build task aliases
			const taskAliases = new Map<string, string>();
			let aliasCounter = 1;
			for (const task of data.tasks ?? []) {
				const prefix = task.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 3);
				taskAliases.set(task.id, `${prefix}${aliasCounter++}`);
			}

			// Group by section
			const sectionMap = new Map<string, typeof data.tasks>();
			for (const task of data.tasks ?? []) {
				const sectionId = task.sectionId ?? 'none';
				if (!sectionMap.has(sectionId)) sectionMap.set(sectionId, []);
				sectionMap.get(sectionId)!.push(task);
			}

			// Output sections
			for (const section of data.sections ?? []) {
				lines.push(`    section ${section.name}`);
				const tasks = sectionMap.get(section.id) ?? [];
				for (const task of tasks) {
					const parts: string[] = [];
					if (task.status) parts.push(task.status);
					if (task.isMilestone) parts.push('milestone');
					const alias = taskAliases.get(task.id);
					if (alias) parts.push(alias);

					const startDate = task.startDate.slice(0, 10);
					parts.push(startDate);

					const start = new Date(task.startDate);
					const end = new Date(task.endDate);
					const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
					parts.push(`${days}d`);

					lines.push(`    ${task.title} :${parts.join(', ')}`);
				}
			}

			mermaidCode = lines.join('\n');
			await renderMermaid();
		} catch (err) {
			renderError = err instanceof Error ? err.message : 'Failed to load from localStorage';
		}
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(mermaidCode);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Fallback
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

	onMount(async () => {
		// Dynamically import mermaid
		const mermaid = await import('mermaid');
		mermaidInstance = mermaid.default;

		mermaidInstance.initialize({
			startOnLoad: false,
			theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
			gantt: {
				titleTopMargin: 25,
				barHeight: 20,
				barGap: 4,
				topPadding: 50,
				leftPadding: 75,
				gridLineStartPadding: 35,
				fontSize: 11,
				sectionFontSize: 11
			}
		});

		await renderMermaid();
	});

	// Re-render when code changes
	$effect(() => {
		if (mermaidCode && mermaidInstance) {
			renderMermaid();
		}
	});
</script>

<svelte:head>
	<title>Mermaid Preview | Gantt Chart Editor</title>
</svelte:head>

<div class="preview-page">
	<header class="preview-header">
		<div class="header-left">
			<a href="/editor" class="back-link">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Editor
			</a>
			<h1 class="header-title">Mermaid Preview</h1>
		</div>
		<div class="header-actions">
			<button onclick={loadFromStorage} class="btn-secondary">
				Load from Project
			</button>
			<button onclick={handleCopy} class="btn-secondary">
				{copied ? 'Copied!' : 'Copy Code'}
			</button>
		</div>
	</header>

	<main class="preview-main">
		<div class="preview-editor">
			<label class="editor-label">Mermaid Code</label>
			<textarea
				bind:value={mermaidCode}
				class="editor-textarea"
				spellcheck="false"
			></textarea>
		</div>

		<div class="preview-output">
			<label class="output-label">Live Preview</label>
			<div class="output-container">
				{#if renderError}
					<div class="error-box">
						<strong>Render Error:</strong>
						<p>{renderError}</p>
					</div>
				{:else}
					<div bind:this={previewElement} class="mermaid-output"></div>
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	.preview-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: var(--color-bg);
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		transition: color 0.15s;
	}

	.back-link:hover {
		color: var(--color-accent);
	}

	.header-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.preview-main {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1px;
		background-color: var(--color-border);
		overflow: hidden;
	}

	.preview-editor,
	.preview-output {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg);
		overflow: hidden;
	}

	.editor-label,
	.output-label {
		padding: 0.75rem 1rem;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-secondary);
		background-color: var(--color-surface-elevated);
		border-bottom: 1px solid var(--color-border);
	}

	.editor-textarea {
		flex: 1;
		padding: 1rem;
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		line-height: 1.6;
		background-color: var(--color-surface);
		color: var(--color-text);
		border: none;
		resize: none;
	}

	.editor-textarea:focus {
		outline: none;
	}

	.output-container {
		flex: 1;
		padding: 1rem;
		overflow: auto;
		background-color: var(--color-surface);
	}

	.mermaid-output {
		display: flex;
		justify-content: center;
		padding: 1rem;
	}

	.mermaid-output :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.error-box {
		padding: 1rem;
		color: var(--color-status-critical);
		background-color: color-mix(in srgb, var(--color-status-critical) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-status-critical) 30%, transparent);
		border-radius: 0.5rem;
	}

	.error-box strong {
		display: block;
		margin-bottom: 0.5rem;
	}
</style>
