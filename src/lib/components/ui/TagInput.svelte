<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import type { Tag } from '$lib/types';

	interface Props {
		value: string[]; // tag IDs
		onchange: (tagIds: string[]) => void;
	}

	let { value, onchange }: Props = $props();

	const gantt = getGanttContext();

	let inputValue = $state('');
	let isOpen = $state(false);
	let inputEl: HTMLInputElement;

	// Get selected tag objects
	const selectedTags = $derived(
		value.map(id => gantt.data.tags.find(t => t.id === id)).filter(Boolean) as Tag[]
	);

	// Filter available tags based on input
	const filteredTags = $derived(
		gantt.data.tags.filter(tag =>
			!value.includes(tag.id) &&
			tag.name.toLowerCase().includes(inputValue.toLowerCase())
		)
	);

	// Check if we can create a new tag
	const canCreateNew = $derived(
		inputValue.trim() &&
		!gantt.data.tags.some(t => t.name.toLowerCase() === inputValue.trim().toLowerCase())
	);

	function addTag(tagId: string) {
		onchange([...value, tagId]);
		inputValue = '';
		inputEl?.focus();
	}

	function removeTag(tagId: string) {
		onchange(value.filter(id => id !== tagId));
	}

	function createAndAddTag() {
		if (!canCreateNew) return;
		const newTag = gantt.addTag(inputValue.trim());
		addTag(newTag.id);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && inputValue.trim()) {
			event.preventDefault();
			if (filteredTags.length > 0) {
				addTag(filteredTags[0].id);
			} else if (canCreateNew) {
				createAndAddTag();
			}
		} else if (event.key === 'Backspace' && !inputValue && value.length > 0) {
			removeTag(value[value.length - 1]);
		} else if (event.key === 'Escape') {
			isOpen = false;
			inputEl?.blur();
		}
	}

	function handleFocus() {
		isOpen = true;
	}

	function handleBlur() {
		// Delay to allow click on dropdown
		setTimeout(() => { isOpen = false; }, 150);
	}
</script>

<div class="tag-input-wrapper">
	<div class="tag-input" class:focused={isOpen}>
		<!-- Selected tags as chips -->
		{#each selectedTags as tag (tag.id)}
			<span
				class="tag-chip"
				style:background-color={tag.color ?? 'var(--color-accent-light)'}
				style:color={tag.color ? '#fff' : 'var(--color-text)'}
			>
				{tag.name}
				<button
					type="button"
					class="tag-remove"
					onclick={() => removeTag(tag.id)}
					aria-label="Remove {tag.name}"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</span>
		{/each}

		<!-- Input field -->
		<input
			bind:this={inputEl}
			bind:value={inputValue}
			type="text"
			class="tag-text-input"
			placeholder={value.length === 0 ? 'Add tags...' : ''}
			onfocus={handleFocus}
			onblur={handleBlur}
			onkeydown={handleKeyDown}
		/>
	</div>

	<!-- Dropdown -->
	{#if isOpen && (filteredTags.length > 0 || canCreateNew)}
		<div class="tag-dropdown">
			{#each filteredTags as tag (tag.id)}
				<button
					type="button"
					class="tag-option"
					onmousedown={() => addTag(tag.id)}
				>
					{#if tag.color}
						<span class="tag-dot" style:background-color={tag.color}></span>
					{/if}
					{tag.name}
				</button>
			{/each}

			{#if canCreateNew}
				<button
					type="button"
					class="tag-option create-new"
					onmousedown={createAndAddTag}
				>
					<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Create "{inputValue.trim()}"
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.tag-input-wrapper {
		position: relative;
	}

	.tag-input {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		padding: 0.375rem 0.5rem;
		min-height: 2.5rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.tag-input.focused {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-light);
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.125rem 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 0.25rem;
	}

	.tag-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 0.875rem;
		height: 0.875rem;
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.1s;
	}

	.tag-remove:hover {
		opacity: 1;
	}

	.tag-remove svg {
		width: 0.75rem;
		height: 0.75rem;
	}

	.tag-text-input {
		flex: 1;
		min-width: 60px;
		padding: 0.125rem 0;
		background: transparent;
		border: none;
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.tag-text-input:focus {
		outline: none;
	}

	.tag-text-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.tag-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 0.25rem;
		max-height: 200px;
		overflow-y: auto;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.tag-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		text-align: left;
		color: var(--color-text);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color 0.1s;
	}

	.tag-option:hover {
		background-color: var(--color-surface-elevated);
	}

	.tag-option.create-new {
		color: var(--color-accent);
		border-top: 1px solid var(--color-border);
	}

	.tag-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
	}
</style>
