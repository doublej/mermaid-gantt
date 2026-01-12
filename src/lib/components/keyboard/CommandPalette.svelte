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
		// Dispatch to keyboard handler
		const event = new KeyboardEvent('keydown', {
			key: action,
			bubbles: true
		});

		// Close palette first
		close();

		// Execute via a custom approach
		const actionMap: Record<string, () => void> = {
			focusPrev: () => gantt.focusPreviousTask(),
			focusNext: () => gantt.focusNextTask(),
			focusFirst: () => gantt.focusFirstTask(),
			focusLast: () => gantt.focusLastTask(),
			newTask: () => gantt.addTask(),
			editTask: () => {
				if (gantt.view.focusedTaskId) {
					gantt.view.selectedTaskId = gantt.view.focusedTaskId;
					gantt.view.editingTaskId = gantt.view.focusedTaskId;
				}
			},
			deleteTask: () => {
				if (gantt.view.focusedTaskId) {
					gantt.deleteTask(gantt.view.focusedTaskId);
				}
			},
			copyTask: () => {
				if (gantt.view.focusedTaskId) {
					gantt.copyTask(gantt.view.focusedTaskId);
				}
			},
			pasteTask: () => gantt.pasteTask(),
			duplicateTask: () => {
				if (gantt.view.focusedTaskId) {
					gantt.duplicateTask(gantt.view.focusedTaskId);
				}
			},
			zoomIn: () => gantt.zoomIn(),
			zoomOut: () => gantt.zoomOut(),
			resetZoom: () => gantt.resetZoom(),
			openHelp: () => keyboard.openHelp(),
			openExport: () => keyboard.openExport(),
			openImport: () => keyboard.openImport(),
			undo: () => gantt.undo(),
			redo: () => gantt.redo()
		};

		const handler = actionMap[action];
		if (handler) handler();
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
		class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-label="Command palette"
	>
		<div
			class="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
			onkeydown={handleKeyDown}
		>
			<!-- Search input -->
			<div class="flex items-center px-4 border-b border-gray-200">
				<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					class="flex-1 px-3 py-4 text-base outline-none"
				/>
				<kbd class="kbd kbd-sm">Esc</kbd>
			</div>

			<!-- Command list -->
			<div class="max-h-80 overflow-y-auto">
				{#each Object.entries(groupedCommands) as [category, cmds]}
					<div class="px-2 pt-2">
						<div class="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
							{category}
						</div>
						{#each cmds as cmd, i}
							{@const globalIndex = filteredCommands.indexOf(cmd)}
							<button
								class="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg transition-colors
									{globalIndex === selectedIndex
									? 'bg-blue-50 text-blue-900'
									: 'text-gray-700 hover:bg-gray-50'}"
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
					<div class="px-4 py-8 text-center text-gray-500">
						No commands found for "{searchQuery}"
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
