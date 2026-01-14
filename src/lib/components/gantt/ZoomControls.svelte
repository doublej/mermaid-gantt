<script lang="ts">
	import { getGanttContext, ZOOM_LEVELS } from '$lib/stores/gantt-store.svelte';
	import { ZoomIn, ZoomOut } from '@lucide/svelte';

	interface Props {
		compact?: boolean;
	}

	let { compact = false }: Props = $props();

	const gantt = getGanttContext();
</script>

<div class="zoom-controls" class:compact>
	<button
		onclick={() => gantt.zoomIn()}
		disabled={gantt.view.zoomLevel === 0}
		class="zoom-btn"
		title="Zoom in"
	>
		<ZoomIn size={compact ? 14 : 16} />
	</button>
	<div class="zoom-levels">
		{#each ZOOM_LEVELS as level, i}
			<button
				class="zoom-level"
				class:active={gantt.view.zoomLevel === i}
				onclick={() => gantt.view.zoomLevel = i}
			>
				{level.name}
			</button>
		{/each}
	</div>
	<button
		onclick={() => gantt.zoomOut()}
		disabled={gantt.view.zoomLevel === ZOOM_LEVELS.length - 1}
		class="zoom-btn"
		title="Zoom out"
	>
		<ZoomOut size={compact ? 14 : 16} />
	</button>
</div>

<style>
	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.zoom-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5px;
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.zoom-btn:hover:not(:disabled) {
		background: var(--color-surface-elevated);
		color: var(--color-text);
	}

	.zoom-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.zoom-levels {
		display: flex;
		gap: 1px;
		background: var(--color-surface-elevated);
		padding: 2px;
		border-radius: 5px;
	}

	.zoom-level {
		padding: 3px 8px;
		font-size: 11px;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: transparent;
		border: none;
		border-radius: 3px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.zoom-level:hover {
		color: var(--color-text);
	}

	.zoom-level.active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	/* Compact variant for footer */
	.compact .zoom-btn {
		padding: 4px;
	}

	.compact .zoom-level {
		padding: 2px 6px;
		font-size: 10px;
	}
</style>
