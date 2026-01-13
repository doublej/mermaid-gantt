<script lang="ts">
	import { onMount } from 'svelte';

	export type FileType = 'mermaid' | 'csv' | 'json' | 'unknown';

	interface Props {
		onFileDrop: (content: string, fileType: FileType, filename: string) => void;
	}

	const { onFileDrop }: Props = $props();

	let isDragging = $state(false);
	let dragCounter = $state(0);

	function detectFileType(filename: string, content: string): FileType {
		const ext = filename.toLowerCase().split('.').pop();

		if (ext === 'mmd' || ext === 'mermaid') return 'mermaid';
		if (ext === 'csv') return 'csv';
		if (ext === 'json') return 'json';

		// Content-based detection
		const trimmed = content.trim();
		if (trimmed.startsWith('gantt')) return 'mermaid';
		if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
			try {
				JSON.parse(trimmed);
				return 'json';
			} catch {
				// Not valid JSON
			}
		}
		// Check for CSV-like content
		const lines = trimmed.split('\n');
		if (lines.length > 1 && lines[0].includes(',')) return 'csv';

		return 'unknown';
	}

	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
		dragCounter++;
		if (event.dataTransfer?.types.includes('Files')) {
			isDragging = true;
		}
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dragCounter--;
		if (dragCounter === 0) {
			isDragging = false;
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		dragCounter = 0;

		const files = event.dataTransfer?.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		const reader = new FileReader();

		reader.onload = (e) => {
			const content = e.target?.result as string;
			const fileType = detectFileType(file.name, content);
			onFileDrop(content, fileType, file.name);
		};

		reader.readAsText(file);
	}

	onMount(() => {
		// Global drag/drop listeners
		document.addEventListener('dragenter', handleDragEnter);
		document.addEventListener('dragleave', handleDragLeave);
		document.addEventListener('dragover', handleDragOver);
		document.addEventListener('drop', handleDrop);

		return () => {
			document.removeEventListener('dragenter', handleDragEnter);
			document.removeEventListener('dragleave', handleDragLeave);
			document.removeEventListener('dragover', handleDragOver);
			document.removeEventListener('drop', handleDrop);
		};
	});
</script>

{#if isDragging}
	<div class="drop-overlay">
		<div class="drop-content">
			<svg class="drop-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/>
			</svg>
			<p class="drop-text">Drop file to import</p>
			<p class="drop-subtext">Supports .mmd, .csv, .json files</p>
		</div>
	</div>
{/if}

<style>
	.drop-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}

	.drop-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem;
		background-color: var(--color-surface);
		border: 3px dashed var(--color-accent);
		border-radius: 1rem;
	}

	.drop-icon {
		width: 4rem;
		height: 4rem;
		color: var(--color-accent);
	}

	.drop-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.drop-subtext {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
</style>
