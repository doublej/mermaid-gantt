<script lang="ts">
	interface Props {
		fromX: number;
		fromY: number;
		toX: number;
		toY: number;
	}

	let { fromX, fromY, toX, toY }: Props = $props();

	// Calculate path with right-angle turns
	const path = $derived.by(() => {
		const midX = fromX + (toX - fromX) / 2;

		// If tasks are close, use simpler path
		if (toX - fromX < 20) {
			return `M ${fromX} ${fromY} L ${toX - 4} ${toY}`;
		}

		// Path with horizontal-vertical-horizontal segments
		return `M ${fromX} ${fromY}
		        H ${midX}
		        V ${toY}
		        H ${toX - 4}`;
	});
</script>

<g class="gantt-dependency">
	<!-- Path line -->
	<path
		d={path}
		fill="none"
		class="dependency-line"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>

	<!-- Arrow head -->
	<polygon
		points="{toX},{toY} {toX - 6},{toY - 4} {toX - 6},{toY + 4}"
		class="dependency-arrow"
	/>
</g>

<style>
	.dependency-line {
		stroke: var(--color-text-tertiary, #9ca3af);
	}
	.dependency-arrow {
		fill: var(--color-text-tertiary, #9ca3af);
	}
</style>
