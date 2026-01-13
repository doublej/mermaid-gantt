<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		code: string;
		typingSpeed?: number;
		startDelay?: number;
	}

	let { code, typingSpeed = 25, startDelay = 800 }: Props = $props();

	let displayedCode = $state('');
	let isComplete = $state(false);
	let cursorVisible = $state(true);
	let hasStarted = $state(false);

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			displayedCode = code;
			isComplete = true;
			hasStarted = true;
			return;
		}

		let typeInterval: ReturnType<typeof setInterval> | null = null;

		// Cursor blink
		const cursorInterval = setInterval(() => {
			cursorVisible = !cursorVisible;
		}, 530);

		// Start typing after delay
		const timeout = setTimeout(() => {
			hasStarted = true;
			let index = 0;

			typeInterval = setInterval(() => {
				if (index < code.length) {
					displayedCode = code.slice(0, index + 1);
					index++;
				} else {
					isComplete = true;
					if (typeInterval) clearInterval(typeInterval);
				}
			}, typingSpeed);
		}, startDelay);

		return () => {
			clearInterval(cursorInterval);
			clearTimeout(timeout);
			if (typeInterval) clearInterval(typeInterval);
		};
	});
</script>

<pre class="typewriter"><code
	>{displayedCode}<span
		class="cursor"
		class:visible={cursorVisible && hasStarted}
		class:hidden={isComplete}>|</span
	></code></pre>

<style>
	.typewriter {
		font-family: var(--font-family-code);
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		white-space: pre;
		margin: 0;
		overflow-x: auto;
	}

	.cursor {
		color: var(--color-accent);
		opacity: 0;
		font-weight: 400;
	}

	.cursor.visible {
		opacity: 1;
	}

	.cursor.hidden {
		display: none;
	}
</style>
