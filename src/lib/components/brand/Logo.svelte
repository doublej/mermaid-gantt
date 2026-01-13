<script lang="ts">
	interface Props {
		size?: number;
		showText?: boolean;
		class?: string;
	}

	let { size = 24, showText = false, class: className = '' }: Props = $props();
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
		<!-- Brand logo: 3 stacked bars + anchor node (golden ratio proportions) -->
		<!-- Bar 1: full width -->
		<rect x="5" y="6" width="15" height="4" rx="1" fill="currentColor" />
		<!-- Bar 2: offset, slightly narrower (55% opacity) -->
		<rect x="7" y="10" width="13" height="4" rx="1" fill="currentColor" opacity="0.55" />
		<!-- Bar 3: short bar (30% opacity) -->
		<rect x="5" y="14" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />
		<!-- Anchor node (blinking) -->
		<circle cx="5" cy="12" r="2" fill="currentColor" class="anchor" />
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

	.anchor {
		animation: blink 1.06s step-end infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	@media (prefers-reduced-motion: reduce) {
		.anchor {
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
