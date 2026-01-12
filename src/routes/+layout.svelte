<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Gantt Chart Editor</title>
	<meta name="description" content="Keyboard-first Gantt chart editor with Mermaid syntax support" />
</svelte:head>

{@render children()}
