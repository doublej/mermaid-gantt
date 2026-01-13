<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 32, class: className = '' }: Props = $props();
</script>

<!--
	Logo 4: Code Bracket
	Angular bracket framing bars - nods to Mermaid's code/syntax nature.
	Developer-friendly, technical aesthetic.
-->
<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	class={className}
	aria-label="Gantt logo"
>
	<!-- Left bracket -->
	<path
		d="M6 6 L3 16 L6 26"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		fill="none"
		opacity="0.5"
	/>

	<!-- Bars -->
	<rect x="10" y="9" width="12" height="3.5" rx="1" fill="currentColor" />
	<rect x="10" y="14.25" width="16" height="3.5" rx="1" fill="currentColor" opacity="0.65" />
	<rect x="10" y="19.5" width="9" height="3.5" rx="1" fill="currentColor" opacity="0.4" />

	<!-- Right bracket -->
	<path
		d="M29 6 L32 16 L29 26"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		fill="none"
		opacity="0.5"
	/>
</svg>
