<script lang="ts">
	interface Props {
		size?: number;
		showText?: boolean;
		class?: string;
	}

	let { size = 24, showText = false, class: className = '' }: Props = $props();

	// Scale stroke proportionally (2px at size 24)
	const strokeWidth = $derived(Math.max(1.5, size / 12));
</script>

<span class="logo {className}" class:with-text={showText}>
	<svg
		viewBox="0 0 24 24"
		width={size}
		height={size}
		fill="none"
		aria-hidden="true"
		class="logo-icon"
	>
		<!-- Horizontal bar (Gantt task) - 4:1 ratio -->
		<rect
			x="2"
			y="10"
			width="16"
			height="4"
			rx="2"
			fill="currentColor"
		/>
		<!-- Vertical caret (cursor) - positioned 10% from left -->
		<line
			x1="4"
			y1="6"
			x2="4"
			y2="18"
			stroke="currentColor"
			stroke-width={strokeWidth}
			stroke-linecap="round"
			class="caret"
		/>
	</svg>

	{#if showText}
		<span class="logo-text">Mermaid Gantt</span>
	{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--color-accent);
	}

	.logo-icon {
		flex-shrink: 0;
	}

	.caret {
		animation: blink 1.06s step-end infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	@media (prefers-reduced-motion: reduce) {
		.caret {
			animation: none;
		}
	}

	.logo-text {
		font-family: var(--font-family-display);
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: var(--letter-spacing-display);
		color: var(--color-text);
		text-transform: uppercase;
	}

	.with-text .logo-text {
		margin-top: 0.0625rem; /* Optical alignment */
	}
</style>
