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
		class="modal-backdrop flex items-center justify-center"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Keyboard shortcuts"
		tabindex="-1"
	>
		<div class="help-modal">
			<!-- Header -->
			<div class="help-header">
				<h2 class="text-lg font-semibold text-primary">Keyboard Shortcuts</h2>
				<button onclick={close} class="btn-ghost" aria-label="Close">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Shortcuts grid -->
			<div class="help-content">
				{#each Object.entries(keyboard.bindingsByCategory) as [category, bindings]}
					<div>
						<h3 class="text-sm font-semibold text-primary mb-3">
							{categoryLabels[category] ?? category}
						</h3>
						<div class="space-y-2">
							{#each bindings as binding}
								<div class="shortcut-row">
									<span class="text-sm text-secondary">{binding.description}</span>
									<kbd class="kbd">{keyboard.formatKey(binding)}</kbd>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<!-- Footer -->
			<div class="help-footer">
				<p class="text-sm text-secondary">
					Press <kbd class="kbd kbd-sm">Ctrl</kbd>+<kbd class="kbd kbd-sm">K</kbd> for command palette
				</p>
				<button onclick={close} class="btn-primary">
					Got it
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.help-modal {
		width: 100%;
		max-width: 42rem;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.help-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.help-content {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		padding: 1.5rem;
		max-height: 60vh;
		overflow-y: auto;
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.25rem 0;
	}

	.help-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}
</style>
