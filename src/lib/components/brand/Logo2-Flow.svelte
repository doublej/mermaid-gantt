<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 32, class: className = '' }: Props = $props();
</script>

<!--
	Logo 2: Connected Flow
	Nodes connected by lines - suggesting task dependencies.
	Nods to both flowcharts and Gantt relationships.
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	class={className}
	aria-label="Gantt logo"
>
	<!-- Connection lines -->
	<path
		d="M8 8 H16 V16 H24"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		opacity="0.4"
	/>
	<path
		d="M8 16 H12"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		opacity="0.4"
	/>
	<path
		d="M8 24 H20"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		opacity="0.4"
	/>

	<!-- Nodes -->
	<circle cx="8" cy="8" r="3" fill="currentColor" />
	<circle cx="8" cy="16" r="3" fill="currentColor" opacity="0.7" />
	<circle cx="8" cy="24" r="3" fill="currentColor" opacity="0.5" />
	<rect x="21" y="13" width="6" height="6" rx="1.5" fill="currentColor" />
</svg>
