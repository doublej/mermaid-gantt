<script lang="ts">
	import '../app.css';
	import { createThemeStore, setThemeContext } from '$lib/stores/theme-store.svelte';

	let { children } = $props();

	// Create and provide theme store at root level
	const theme = createThemeStore();
	setThemeContext(theme);
</script>

<svelte:head>
	<title>Mermaid Gantt</title>
	<meta name="description" content="Keyboard-first Gantt chart editor with Mermaid syntax support" />
</svelte:head>

{@render children()}
