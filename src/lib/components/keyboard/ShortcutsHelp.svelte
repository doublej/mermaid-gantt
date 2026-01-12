<script lang="ts">
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';

	const keyboard = getKeyboardContext();

	const categoryLabels: Record<string, string> = {
		navigation: 'Navigation',
		task: 'Task Actions',
		timeline: 'Timeline',
		global: 'Global'
	};

	function close() {
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
</script>

{#if keyboard.showHelp}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Keyboard shortcuts"
	>
		<div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
				<button
					onclick={close}
					class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Shortcuts grid -->
			<div class="grid grid-cols-2 gap-6 p-6 max-h-[60vh] overflow-y-auto">
				{#each Object.entries(keyboard.bindingsByCategory) as [category, bindings]}
					<div>
						<h3 class="text-sm font-semibold text-gray-900 mb-3">
							{categoryLabels[category] ?? category}
						</h3>
						<div class="space-y-2">
							{#each bindings as binding}
								<div class="flex items-center justify-between py-1">
									<span class="text-sm text-gray-600">{binding.description}</span>
									<kbd class="kbd">{keyboard.formatKey(binding)}</kbd>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
				<p class="text-sm text-gray-500">
					Press <kbd class="kbd kbd-sm">Ctrl</kbd>+<kbd class="kbd kbd-sm">K</kbd> for command
					palette
				</p>
				<button
					onclick={close}
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Got it
				</button>
			</div>
		</div>
	</div>
{/if}
