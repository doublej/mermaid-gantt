<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
		rotate?: boolean;
	}

	let { size = 32, class: className = '', rotate = false }: Props = $props();
</script>

<!--
	Logo V2: Gantt M

	Design concept: Three bars arranged so that when rotated 90° CCW,
	they form the letter "M" for Mermaid.

	Normal view: Gantt chart bars (horizontal, staggered)
	Rotated view: Letter M (the peaks of bars become the M valleys)

	Construction:
	- Two outer bars anchored at edges
	- Center bar shorter, creating the M valley
	- Symmetrical for clean M letterform
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	class={className}
	style="transition: transform 0.3s ease; {rotate ? 'transform: rotate(-90deg)' : ''}"
	aria-label="Gantt logo"
>
	<!-- Left bar (becomes left stroke of M) -->
	<rect x="4" y="5" width="16" height="3.5" rx="1" fill="currentColor" />

	<!-- Center bar - shorter (creates M valley) -->
	<rect x="4" y="10.25" width="10" height="3.5" rx="1" fill="currentColor" opacity="0.6" />

	<!-- Right bar (becomes right stroke of M) -->
	<rect x="4" y="15.5" width="16" height="3.5" rx="1" fill="currentColor" />
</svg>
