<script lang="ts">
	import type { Attachment } from 'svelte/attachments';

	interface Props {
		value: string;
		editing: boolean;
		oncommit: (v: string) => void;
		oncancel: () => void;
		className?: string;
	}

	let { value, editing, oncommit, oncancel, className = '' }: Props = $props();

	// A fresh input mounts per edit, so an attachment focuses+selects cleanly.
	const autofocusSelect: Attachment<HTMLInputElement> = (node) => {
		node.focus();
		node.select();
	};

	// Distinguishes Escape (revert) from Enter/blur (commit) inside onblur.
	let cancelled = false;

	function handleKeydown(event: KeyboardEvent) {
		const input = event.currentTarget as HTMLInputElement;
		if (event.key === 'Enter') {
			event.preventDefault();
			input.blur();
		} else if (event.key === 'Escape') {
			cancelled = true;
			event.stopPropagation(); // prevent global Escape handler double-acting
			input.blur();
		}
	}

	function handleBlur(event: FocusEvent) {
		const input = event.currentTarget as HTMLInputElement;
		if (cancelled) {
			cancelled = false;
			oncancel();
		} else {
			oncommit(input.value);
		}
	}

	function stop(event: Event) {
		event.stopPropagation();
	}
</script>

{#if editing}
	<input
		class="sidebar-edit-input"
		{value}
		{@attach autofocusSelect}
		onkeydown={handleKeydown}
		onblur={handleBlur}
		onclick={stop}
		onmousedown={stop}
		ondblclick={stop}
	/>
{:else}
	<span class="sidebar-label {className}">{value}</span>
{/if}

<style>
	.sidebar-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sidebar-edit-input {
		flex: 1;
		min-width: 0;
		height: calc(100% - 0.5rem);
		padding: 0 0.375rem;
		font-size: inherit;
		font-family: inherit;
		color: var(--color-text);
		background: var(--color-surface);
		border: 1.5px solid var(--color-accent);
		border-radius: 4px;
		outline: none;
		box-sizing: border-box;
	}
</style>
