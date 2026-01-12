<script lang="ts">
	import { getPersistenceContext } from '$lib/stores/persistence-store.svelte';

	const persistence = getPersistenceContext();
</script>

<div class="flex items-center gap-1.5 text-sm">
	{#if persistence.saveStatus === 'saved'}
		<span class="w-2 h-2 bg-green-500 rounded-full"></span>
		<span class="text-gray-500">Saved</span>
	{:else if persistence.saveStatus === 'saving'}
		<svg class="w-3 h-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
		</svg>
		<span class="text-gray-500">Saving...</span>
	{:else}
		<span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
		<span class="text-gray-500">Unsaved</span>
	{/if}
</div>
