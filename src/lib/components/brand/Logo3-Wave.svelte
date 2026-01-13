<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 32, class: className = '' }: Props = $props();
</script>

<!--
	Logo 3: Wave Bars
	Gantt bars with a subtle wave form - nodding to "mermaid" origins.
	Organic yet structured.
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	class={className}
	aria-label="Gantt logo"
>
	<path
		d="M4 9 Q8 6, 12 9 T20 9"
		stroke="currentColor"
		stroke-width="4"
		stroke-linecap="round"
		fill="none"
	/>
	<path
		d="M8 16 Q12 13, 16 16 T24 16"
		stroke="currentColor"
		stroke-width="4"
		stroke-linecap="round"
		fill="none"
		opacity="0.6"
	/>
	<path
		d="M6 23 Q10 20, 14 23 T22 23"
		stroke="currentColor"
		stroke-width="4"
		stroke-linecap="round"
		fill="none"
		opacity="0.35"
	/>
</svg>
