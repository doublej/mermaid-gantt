<script lang="ts">
	import { getPersistenceContext } from '$lib/stores/persistence-store.svelte';

	const persistence = getPersistenceContext();
</script>

<div class="flex items-center gap-1.5 text-sm">
	{#if persistence.saveStatus === 'saved'}
		<span class="w-2 h-2 rounded-full" style="background-color: var(--color-status-done)"></span>
		<span class="text-secondary">Saved</span>
	{:else if persistence.saveStatus === 'saving'}
		<svg class="w-3 h-3 animate-spin text-tertiary" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
		</svg>
		<span class="text-secondary">Saving...</span>
	{:else}
		<span class="w-2 h-2 rounded-full" style="background-color: var(--color-today)"></span>
		<span class="text-secondary">Unsaved</span>
	{/if}
</div>
