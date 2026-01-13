<script lang="ts">
	interface Props {
		value: string | null;
		onchange: (color: string | null) => void;
	}

	let { value, onchange }: Props = $props();

	const presets = [
		'#ef4444', '#f97316', '#f59e0b', '#eab308', // red, orange, amber, yellow
		'#84cc16', '#22c55e', '#10b981', '#14b8a6', // lime, green, emerald, teal
		'#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', // cyan, sky, blue, indigo
		'#8b5cf6', '#a855f7', '#d946ef', '#ec4899'  // violet, purple, fuchsia, pink
	];

	function selectColor(color: string) {
		onchange(color === value ? null : color);
	}

	function clearColor() {
		onchange(null);
	}
</script>

<div class="color-picker">
	<div class="color-grid">
		{#each presets as color}
			<button
				type="button"
				class="color-swatch"
				class:selected={value === color}
				style:background-color={color}
				onclick={() => selectColor(color)}
				title={color}
			>
				{#if value === color}
					<svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>
		{/each}
	</div>
	<button
		type="button"
		class="clear-btn"
		onclick={clearColor}
		disabled={value === null}
	>
		Clear color
	</button>
</div>

<style>
	.color-picker {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 0.375rem;
	}

	.color-swatch {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.25rem;
		border: 2px solid transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.1s, border-color 0.1s;
	}

	.color-swatch:hover {
		transform: scale(1.1);
	}

	.color-swatch.selected {
		border-color: var(--color-text);
		box-shadow: 0 0 0 2px var(--color-surface);
	}

	.check-icon {
		width: 1rem;
		height: 1rem;
		color: white;
		filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
	}

	.clear-btn {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.15s, color 0.15s;
	}

	.clear-btn:hover:not(:disabled) {
		background-color: var(--color-surface);
		color: var(--color-text);
	}

	.clear-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
