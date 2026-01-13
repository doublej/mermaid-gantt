<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 32, class: className = '' }: Props = $props();
</script>

<!--
	Logo V1: Gantt Flow

	Design Method:
	- 24×24 grid system (scalable to any size)
	- Golden ratio (φ = 1.618) proportions for bar lengths
	- Bars: 15u, 9.3u, 5.7u (each ÷ φ)
	- Consistent 4u vertical rhythm
	- 2u bar height for optical balance at small sizes
	- Connection node at origin point (left anchor)
	- Subtle connector lines showing dependency flow
	- Rounded caps (1u radius) for friendly, modern feel

	Concept: Stacked Gantt bars emanating from a single anchor point,
	with connector lines suggesting task dependencies and flow.
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	class={className}
	aria-label="Gantt logo"
>
	<!-- Bar 1: Primary task - 15 units (golden ratio base) -->
	<rect x="5" y="6" width="15" height="4" rx="1" fill="currentColor" />

	<!-- Bar 2: Secondary task - 9.27 units (15 ÷ φ) -->
	<rect x="7" y="10" width="13" height="4" rx="1" fill="currentColor" opacity="0.55" />

	<!-- Bar 3: Tertiary task - 5.73 units (9.27 ÷ φ) -->
	<rect x="5" y="14" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />

	<!-- Anchor node - origin point suggesting start/dependency source -->
	<circle cx="5" cy="12" r="2" fill="currentColor" />
</svg>
