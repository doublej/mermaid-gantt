<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 32, class: className = '' }: Props = $props();
</script>

<!--
	Logo V3: Gantt Sea

	Design concept: Gantt bars emerging from or floating on
	a wave form - connecting to "Mermaid" sea theme.

	Construction:
	- Subtle wave baseline at bottom
	- Bars rise from the wave like data emerging from depth
	- Wave uses sine curve for organic feel
	- Bars maintain golden ratio proportions
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	class={className}
	aria-label="Gantt logo"
>
	<!-- Wave base (sea/mermaid reference) -->
	<path
		d="M2 18 Q6 15, 10 18 T18 18 T24 18"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		fill="none"
		opacity="0.25"
	/>

	<!-- Gantt bars rising from the wave -->
	<rect x="4" y="4" width="14" height="3.5" rx="1" fill="currentColor" />
	<rect x="6" y="9" width="12" height="3.5" rx="1" fill="currentColor" opacity="0.6" />
	<rect x="4" y="14" width="8" height="3.5" rx="1" fill="currentColor" opacity="0.4" />
</svg>
