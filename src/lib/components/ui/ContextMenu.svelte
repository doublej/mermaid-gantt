<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { MenuItem } from '$lib/types/menu';

	interface Props {
		items: MenuItem[];
		x: number;
		y: number;
		onClose: () => void;
	}

	let { items, x, y, onClose }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let selectedIndex = $state(0);
	let expandedSubmenu = $state<number | null>(null);

	onMount(() => {
		tick().then(() => {
			if (container) {
				// Adjust position if menu goes off-screen
				const rect = container.getBoundingClientRect();
				const padding = 8;

				if (rect.right > window.innerWidth) {
					x = Math.max(padding, window.innerWidth - rect.width - padding);
				}
				if (rect.bottom > window.innerHeight) {
					y = Math.max(padding, window.innerHeight - rect.height - padding);
				}
			}
		});

		// Add keyboard and click listeners
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('click', handleClickOutside);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('click', handleClickOutside);
		};
	});

	function handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				onClose();
				break;
			case 'ArrowDown':
				event.preventDefault();
				selectNext();
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectPrevious();
				break;
			case 'ArrowRight':
				event.preventDefault();
				if (getSelectableItems()[selectedIndex]?.submenu) {
					expandedSubmenu = selectedIndex;
				}
				break;
			case 'ArrowLeft':
				event.preventDefault();
				expandedSubmenu = null;
				break;
			case 'Enter':
				event.preventDefault();
				executeSelected();
				break;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (container && !container.contains(target)) {
			onClose();
		}
	}

	function getSelectableItems(): MenuItem[] {
		return items.filter((item) => !item.divider && !item.disabled);
	}

	function selectNext() {
		const selectableItems = getSelectableItems();
		const currentSelectableIndex = selectableItems.findIndex((item) => item === items[selectedIndex]);
		if (currentSelectableIndex < selectableItems.length - 1) {
			selectedIndex = items.indexOf(selectableItems[currentSelectableIndex + 1]);
		}
	}

	function selectPrevious() {
		const selectableItems = getSelectableItems();
		const currentSelectableIndex = selectableItems.findIndex((item) => item === items[selectedIndex]);
		if (currentSelectableIndex > 0) {
			selectedIndex = items.indexOf(selectableItems[currentSelectableIndex - 1]);
		}
	}

	function executeSelected() {
		const item = items[selectedIndex];
		if (item && !item.divider && !item.disabled) {
			item.action();
			onClose();
		}
	}

	function handleItemClick(item: MenuItem, event: MouseEvent) {
		event.stopPropagation();
		if (!item.disabled && !item.divider) {
			item.action();
			onClose();
		}
	}

	function handleItemMouseEnter(index: number, item: MenuItem) {
		selectedIndex = index;
		if (item.submenu) {
			expandedSubmenu = index;
		} else {
			expandedSubmenu = null;
		}
	}
</script>

<div bind:this={container} class="context-menu" style:left="{x}px" style:top="{y}px">
	{#each items as item, i}
		{#if item.divider}
			<div class="menu-divider"></div>
		{:else}
			<button
				class="menu-item"
				class:selected={selectedIndex === i}
				class:disabled={item.disabled}
				onclick={(e) => handleItemClick(item, e)}
				onmouseenter={() => handleItemMouseEnter(i, item)}
				disabled={item.disabled}
			>
				{#if item.icon}
					<span class="menu-icon">{item.icon}</span>
				{/if}
				<span class="menu-label">{item.label}</span>
				{#if item.submenu}
					<span class="menu-arrow">→</span>
				{/if}
			</button>

			{#if item.submenu && expandedSubmenu === i}
				<div class="submenu" transition:fade={{ duration: 100 }}>
					{#each item.submenu as subitem, si}
						{#if subitem.divider}
							<div class="menu-divider"></div>
						{:else}
							<button
								class="menu-item"
								class:disabled={subitem.disabled}
								onclick={(e) => handleItemClick(subitem, e)}
								disabled={subitem.disabled}
							>
								{#if subitem.icon}
									<span class="menu-icon">{subitem.icon}</span>
								{/if}
								<span class="menu-label">{subitem.label}</span>
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	{/each}
</div>

<style>
	.context-menu {
		position: fixed;
		z-index: 1000;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 0.25rem;
		min-width: 200px;
		font-size: 0.875rem;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: none;
		color: var(--color-text);
		cursor: pointer;
		transition: background-color 0.15s;
		text-align: left;
	}

	.menu-item:hover:not(.disabled) {
		background-color: var(--color-surface-elevated);
	}

	.menu-item.selected:not(.disabled) {
		background-color: var(--color-accent-subtle);
		color: var(--color-accent);
	}

	.menu-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.menu-icon {
		width: 1rem;
		height: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
	}

	.menu-label {
		flex: 1;
		white-space: nowrap;
	}

	.menu-arrow {
		margin-left: auto;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.menu-divider {
		height: 1px;
		background-color: var(--color-border);
		margin: 0.25rem 0;
	}

	.submenu {
		position: absolute;
		left: 100%;
		top: 0;
		margin-left: 0.25rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 0.25rem;
		min-width: 160px;
	}
</style>
