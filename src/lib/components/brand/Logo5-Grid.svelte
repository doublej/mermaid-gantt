<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 32, class: className = '' }: Props = $props();
</script>

<!--
	Logo 5: Timeline Grid
	Vertical grid lines with a highlighted task span.
	Represents the Gantt chart grid directly.
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	class={className}
	aria-label="Gantt logo"
>
	<!-- Grid lines -->
	<line x1="8" y1="4" x2="8" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.2" />
	<line x1="14" y1="4" x2="14" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.2" />
	<line x1="20" y1="4" x2="20" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.2" />
	<line x1="26" y1="4" x2="26" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.2" />

	<!-- Task bars overlaid -->
	<rect x="8" y="7" width="12" height="4" rx="1" fill="currentColor" />
	<rect x="14" y="14" width="12" height="4" rx="1" fill="currentColor" opacity="0.6" />
	<rect x="8" y="21" width="6" height="4" rx="1" fill="currentColor" opacity="0.35" />
</svg>
