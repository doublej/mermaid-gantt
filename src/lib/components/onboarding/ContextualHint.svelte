<script lang="ts">
	import { getOnboardingContext } from '$lib/stores/onboarding-store.svelte';
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getKeyWidthClass } from '$lib/stores/keyboard-store.svelte';

	const onboarding = getOnboardingContext();
	const gantt = getGanttContext();

	// Determine which hint to show based on context
	const hint = $derived.by(() => {
		if (!onboarding.showHints || onboarding.showTutorial) {
			return null;
		}

		// No tasks - suggest creating one
		if (gantt.data.tasks.length === 0) {
			return {
				text: 'Press',
				keys: ['Ctrl', 'N'],
				suffix: 'to create a task'
			};
		}

		// Task focused but not selected
		if (gantt.view.focusedTaskId && !gantt.view.selectedTaskId) {
			return {
				text: 'Press',
				keys: ['Enter'],
				suffix: 'to edit'
			};
		}

		// Task selected
		if (gantt.view.selectedTaskId) {
			return {
				text: 'Press',
				keys: ['Delete'],
				suffix: 'to delete or',
				keys2: ['Ctrl', 'D'],
				suffix2: 'to duplicate'
			};
		}

		return null;
	});
</script>

{#if hint}
	<div class="hint-bar" role="status" aria-live="polite">
		<span class="hint-text">{hint.text}</span>
		{#each hint.keys as key, i}
			{#if i > 0}
				<span class="hint-separator">+</span>
			{/if}
			<kbd class="hint-key {getKeyWidthClass(key)}">{key}</kbd>
		{/each}
		<span class="hint-text">{hint.suffix}</span>

		{#if hint.keys2}
			{#each hint.keys2 as key, i}
				{#if i > 0}
					<span class="hint-separator">+</span>
				{/if}
				<kbd class="hint-key {getKeyWidthClass(key)}">{key}</kbd>
			{/each}
			<span class="hint-text">{hint.suffix2}</span>
		{/if}

		<button
			onclick={() => onboarding.toggleHints()}
			class="hint-close"
			aria-label="Hide hints"
		>
			<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}

<style>
	.hint-bar {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
	}

	.hint-text {
		color: var(--color-text-tertiary);
	}

	.hint-separator {
		color: var(--color-text-tertiary);
	}

	.hint-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		font-size: 0.625rem;
		font-weight: 500;
		font-family: var(--font-family-mono);
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
	}

	/* Key width modifiers */
	.hint-key:global(.kbd-wide) { min-width: 1.75rem; }
	.hint-key:global(.kbd-medium) { min-width: 1.5rem; }
	.hint-key:global(.kbd-narrow) { min-width: 1.25rem; }
	.hint-key:global(.kbd-space) { min-width: 2.5rem; }

	.hint-close {
		margin-left: 0.25rem;
		padding: 0.125rem;
		color: var(--color-text-tertiary);
		border-radius: 0.125rem;
		transition: color 0.15s ease;
	}

	.hint-close:hover {
		color: var(--color-text-secondary);
	}
</style>
