<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 32, class: className = '' }: Props = $props();
</script>

<!--
	Logo 1: Stacked Bars
	Three offset horizontal bars suggesting a Gantt timeline.
	Clean, geometric, instantly recognizable.
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	class={className}
	aria-label="Gantt logo"
>
	<rect x="4" y="6" width="18" height="5" rx="1.5" fill="currentColor" />
	<rect x="8" y="13.5" width="20" height="5" rx="1.5" fill="currentColor" opacity="0.6" />
	<rect x="6" y="21" width="14" height="5" rx="1.5" fill="currentColor" opacity="0.35" />
</svg>
