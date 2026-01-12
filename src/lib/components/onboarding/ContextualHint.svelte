<script lang="ts">
	import { getOnboardingContext } from '$lib/stores/onboarding-store.svelte';
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';

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
	<div
		class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full shadow-lg text-sm"
		role="status"
		aria-live="polite"
	>
		<span class="text-gray-300">{hint.text}</span>
		{#each hint.keys as key, i}
			{#if i > 0}
				<span class="text-gray-400">+</span>
			{/if}
			<kbd class="kbd kbd-sm bg-gray-700 border-gray-600 text-white">{key}</kbd>
		{/each}
		<span class="text-gray-300">{hint.suffix}</span>

		{#if hint.keys2}
			{#each hint.keys2 as key, i}
				{#if i > 0}
					<span class="text-gray-400">+</span>
				{/if}
				<kbd class="kbd kbd-sm bg-gray-700 border-gray-600 text-white">{key}</kbd>
			{/each}
			<span class="text-gray-300">{hint.suffix2}</span>
		{/if}

		<button
			onclick={() => onboarding.toggleHints()}
			class="ml-2 p-1 hover:bg-gray-700 rounded"
			aria-label="Hide hints"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}
