<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getKeyboardContext, getUniqueBindings } from '$lib/stores/keyboard-store.svelte';
	import { getOnboardingContext } from '$lib/stores/onboarding-store.svelte';
	import type { Command } from '$lib/types';

	const gantt = getGanttContext();
	const keyboard = getKeyboardContext();
	const onboarding = getOnboardingContext();

	let searchQuery = $state('');
	let selectedIndex = $state(0);
	let inputRef: HTMLInputElement;

	// Build command list from bindings
	const commands = $derived.by(() => {
		const bindings = getUniqueBindings();
		const cmds: Command[] = bindings.map((binding) => ({
			id: binding.action,
			title: binding.description,
			keys: [keyboard.formatKey(binding)],
			action: () => executeAction(binding.action),
			category: binding.category
		}));

		// Add extra commands
		cmds.push({
			id: 'resetTutorial',
			title: 'Restart Tutorial',
			action: () => {
				onboarding.resetTutorial();
				onboarding.startTutorial();
			},
			category: 'help'
		});

		cmds.push({
			id: 'toggleHints',
			title: onboarding.showHints ? 'Hide Keyboard Hints' : 'Show Keyboard Hints',
			action: () => onboarding.toggleHints(),
			category: 'help'
		});

		return cmds;
	});

	// Filtered commands based on search
	const filteredCommands = $derived.by(() => {
		if (!searchQuery.trim()) return commands;

		const query = searchQuery.toLowerCase();
		return commands.filter(
			(cmd) =>
				cmd.title.toLowerCase().includes(query) ||
				cmd.category.toLowerCase().includes(query)
		);
	});

	// Group by category
	const groupedCommands = $derived.by(() => {
		const groups: Record<string, Command[]> = {};
		for (const cmd of filteredCommands) {
			if (!groups[cmd.category]) {
				groups[cmd.category] = [];
			}
			groups[cmd.category].push(cmd);
		}
		return groups;
	});

	// Reset selected index when search changes
	$effect(() => {
		searchQuery;
		selectedIndex = 0;
	});

	// Focus input when opened
	$effect(() => {
		if (keyboard.showCommandPalette && inputRef) {
			inputRef.focus();
		}
	});

	function executeAction(action: string) {
		close();
		// Dispatch action via synthetic keyboard event to centralized handler
		const event = new CustomEvent('gantt:action', { detail: { action }, bubbles: true });
		document.dispatchEvent(event);
	}

	function handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				const cmd = filteredCommands[selectedIndex];
				if (cmd) {
					cmd.action();
				}
				break;
			case 'Escape':
				event.preventDefault();
				close();
				break;
		}
	}

	function close() {
		searchQuery = '';
		selectedIndex = 0;
		keyboard.closeAllModals();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

{#if keyboard.showCommandPalette}
	<div
		class="modal-backdrop flex items-start justify-center pt-[15vh]"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-label="Command palette"
	>
		<div
			class="w-full max-w-lg bg-surface rounded-xl shadow-2xl overflow-hidden border border-default"
			onkeydown={handleKeyDown}
		>
			<!-- Search input -->
			<div class="flex items-center px-4 border-b border-default">
				<svg class="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<input
					bind:this={inputRef}
					bind:value={searchQuery}
					type="text"
					placeholder="Type a command or search..."
					class="flex-1 px-3 py-4 text-base outline-none bg-transparent text-primary"
				/>
				<kbd class="kbd kbd-sm">Esc</kbd>
			</div>

			<!-- Command list -->
			<div class="max-h-80 overflow-y-auto">
				{#each Object.entries(groupedCommands) as [category, cmds]}
					<div class="px-2 pt-2">
						<div class="px-2 py-1 text-xs font-medium text-tertiary uppercase tracking-wide">
							{category}
						</div>
						{#each cmds as cmd, i}
							{@const globalIndex = filteredCommands.indexOf(cmd)}
							<button
								class="command-item"
								class:selected={globalIndex === selectedIndex}
								onclick={() => cmd.action()}
								onmouseenter={() => (selectedIndex = globalIndex)}
							>
								<span class="text-sm">{cmd.title}</span>
								{#if cmd.keys}
									<span class="flex gap-1">
										{#each cmd.keys as key}
											<kbd class="kbd kbd-sm">{key}</kbd>
										{/each}
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/each}

				{#if filteredCommands.length === 0}
					<div class="px-4 py-8 text-center text-tertiary">
						No commands found for "{searchQuery}"
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.command-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-radius: 0.5rem;
		color: var(--color-text);
		transition: background-color 0.15s ease;
	}

	.command-item:hover {
		background-color: var(--color-surface-elevated);
	}

	.command-item.selected {
		background-color: var(--color-accent-subtle);
		color: var(--color-accent);
	}
</style>
