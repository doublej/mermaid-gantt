<script lang="ts">
	import { getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { getSettingsContext } from '$lib/stores/settings-store.svelte';

	const keyboard = getKeyboardContext();
	const settings = getSettingsContext();

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

{#if keyboard.showSettings}
	<div
		class="modal-backdrop flex items-center justify-center"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Settings"
		tabindex="-1"
	>
		<div class="settings-modal">
			<!-- Header -->
			<div class="settings-header">
				<h2 class="text-lg font-semibold text-primary">Settings</h2>
				<button onclick={close} class="btn-ghost" aria-label="Close">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="settings-content">
				<div class="setting-row">
					<div class="setting-info">
						<span class="setting-label">Automatically sort tasks by start date</span>
						<span class="setting-description">When enabled, tasks within each section are automatically sorted by their start date</span>
					</div>
					<button
						class="toggle-switch"
						class:active={settings.sortTasksByStartDate}
						onclick={() => settings.toggleSortTasksByStartDate()}
						role="switch"
						aria-checked={settings.sortTasksByStartDate}
						aria-label="Toggle sort tasks by start date"
					>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

			<!-- Footer -->
			<div class="settings-footer">
				<button onclick={close} class="btn-primary">
					Done
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.settings-modal {
		width: 100%;
		max-width: 28rem;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.settings-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.settings-content {
		padding: 1.5rem;
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.setting-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.setting-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.setting-description {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.toggle-switch {
		position: relative;
		width: 44px;
		height: 24px;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		cursor: pointer;
		transition: background-color 0.2s, border-color 0.2s;
		flex-shrink: 0;
	}

	.toggle-switch.active {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.toggle-knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.2s;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.toggle-switch.active .toggle-knob {
		transform: translateX(20px);
	}

	.settings-footer {
		display: flex;
		justify-content: flex-end;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}
</style>
