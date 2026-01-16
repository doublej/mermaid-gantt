<script lang="ts">
	import { getOnboardingContext, quickTutorialSteps, extendedTutorialSteps } from '$lib/stores/onboarding-store.svelte';
	import { getKeyWidthClass, getKeyboardContext } from '$lib/stores/keyboard-store.svelte';
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import type { TutorialCleanup } from '$lib/types';

	const onboarding = getOnboardingContext();
	const keyboard = getKeyboardContext();
	const gantt = getGanttContext();

	const CLEANUP_DELAY_MS = 1500;
	let cleanupProgress = $state(0);
	let cleanupTimerId = $state<ReturnType<typeof setInterval> | null>(null);

	// Detect macOS
	const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

	// Set up cleanup callback
	onboarding.setCleanupCallback((cleanup: TutorialCleanup) => {
		if (cleanup === 'closeModals') {
			keyboard.closeAllModals();
		} else if (cleanup === 'closeEditor') {
			gantt.view.editingTaskId = null;
		}
	});

	// Watch for pending cleanup and start timer
	$effect(() => {
		if (onboarding.pendingCleanup) {
			cleanupProgress = 0;
			const startTime = Date.now();
			const interval = 16; // ~60fps

			cleanupTimerId = setInterval(() => {
				const elapsed = Date.now() - startTime;
				cleanupProgress = Math.min((elapsed / CLEANUP_DELAY_MS) * 100, 100);

				if (elapsed >= CLEANUP_DELAY_MS) {
					if (cleanupTimerId) clearInterval(cleanupTimerId);
					cleanupTimerId = null;
					onboarding.runCleanup();
					onboarding.advanceStep();
				}
			}, interval);
		}

		return () => {
			if (cleanupTimerId) {
				clearInterval(cleanupTimerId);
				cleanupTimerId = null;
			}
		};
	});

	let pressedKeys = $state<string[]>([]);
	let targetRect = $state<DOMRect | null>(null);
	let windowSize = $state({ width: 0, height: 0 });

	const KEY_MAP: Record<string, string> = {
		Control: 'Ctrl', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→'
	};
	const MODIFIERS = ['Ctrl', 'Shift', 'Alt', 'Cmd', 'Meta', '⌘'];
	const normalizeKey = (key: string) => KEY_MAP[key] ?? (key.length === 1 ? key.toUpperCase() : key);

	// Format key for display - show ⌘ on Mac instead of Ctrl
	function formatKeyForDisplay(key: string): string {
		if (key === 'Ctrl' && isMac) return '⌘';
		return key;
	}

	const isCombo = $derived(
		onboarding.currentStep?.keys.some((k) => MODIFIERS.includes(k)) ?? false
	);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const selector = onboarding.currentStep?.targetSelector;

		const updateLayout = () => {
			windowSize = { width: window.innerWidth, height: window.innerHeight };
			if (onboarding.showTutorial && selector) {
				targetRect = document.querySelector(selector)?.getBoundingClientRect() ?? null;
			} else {
				targetRect = null;
			}
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (!onboarding.showTutorial) return;
			if (e.key === 'Escape') { e.preventDefault(); onboarding.skipTutorial(); return; }
			const key = normalizeKey(e.key);
			if (!pressedKeys.includes(key)) pressedKeys = [...pressedKeys, key];
		};

		const onKeyUp = (e: KeyboardEvent) => {
			if (!onboarding.showTutorial) return;
			pressedKeys = pressedKeys.filter((k) => k !== normalizeKey(e.key));
		};

		updateLayout();
		window.addEventListener('resize', updateLayout);
		window.addEventListener('scroll', updateLayout);
		window.addEventListener('keydown', onKeyDown, true);
		window.addEventListener('keyup', onKeyUp, true);

		return () => {
			window.removeEventListener('resize', updateLayout);
			window.removeEventListener('scroll', updateLayout);
			window.removeEventListener('keydown', onKeyDown, true);
			window.removeEventListener('keyup', onKeyUp, true);
		};
	});

	const cardTop = $derived(
		targetRect ? Math.min(targetRect.bottom + 16, windowSize.height - 280) : windowSize.height / 2
	);
	const cardLeft = $derived(
		targetRect ? Math.min(targetRect.left, windowSize.width - 340) : windowSize.width / 2
	);
</script>

{#if onboarding.showTutorial}
	<!-- Overlay with cutout for target element -->
	<div
		class="fixed inset-0 z-50 pointer-events-none"
		role="dialog"
		aria-modal="true"
		aria-label="Tutorial"
	>
		<!-- Dark overlay - allow clicks through to target -->
		<svg class="absolute inset-0 w-full h-full">
			<defs>
				<mask id="spotlight-mask">
					<rect x="0" y="0" width="100%" height="100%" fill="white" />
					{#if targetRect}
						<rect
							x={targetRect.left - 8}
							y={targetRect.top - 8}
							width={targetRect.width + 16}
							height={targetRect.height + 16}
							rx="8"
							fill="black"
						/>
					{/if}
				</mask>
			</defs>
			<rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="rgba(0,0,0,0.6)"
				mask="url(#spotlight-mask)"
				class="pointer-events-auto"
			/>
		</svg>

		<!-- Tutorial card positioned to avoid target -->
		<div
			class="tutorial-card"
			style:top="{cardTop}px"
			style:left="{cardLeft}px"
			style:transform={targetRect ? 'none' : 'translate(-50%, -50%)'}
		>
			<!-- Progress bar -->
			<div class="progress-track">
				<div
					class="progress-bar"
					style:width="{onboarding.progress}%"
				></div>
			</div>

			{#if onboarding.pendingCleanup}
				<!-- Cleanup Timer -->
				<div class="p-6">
					<div class="text-xs font-medium text-green-500 mb-2">
						✓ Nice work!
					</div>
					<h2 class="text-lg font-bold text-primary mb-1">
						{onboarding.currentStep?.title}
					</h2>
					<p class="text-sm text-secondary mb-4">
						Resetting for next step...
					</p>
					<!-- Circular progress timer -->
					<div class="flex justify-center">
						<div class="cleanup-timer">
							<svg viewBox="0 0 36 36" class="w-16 h-16">
								<path
									class="timer-bg"
									d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								/>
								<path
									class="timer-progress"
									stroke-dasharray="{cleanupProgress}, 100"
									d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								/>
							</svg>
						</div>
					</div>
				</div>
			{:else if onboarding.showContinuePrompt}
				<!-- Continue Learning Prompt -->
				<div class="p-6">
					<div class="text-xs font-medium text-accent mb-2">
						Quick Tutorial Complete!
					</div>
					<h2 class="text-lg font-bold text-primary mb-1">
						Keep Learning?
					</h2>
					<p class="text-sm text-secondary mb-4">
						You've mastered the basics! Would you like to continue with {extendedTutorialSteps.length} more advanced shortcuts?
					</p>
					<div class="flex gap-2 justify-center">
						<button
							onclick={() => onboarding.finishQuickTutorial()}
							class="btn-secondary text-sm py-2 px-4"
						>
							Done for now
						</button>
						<button
							onclick={() => onboarding.continueWithExtended()}
							class="btn-primary text-sm py-2 px-4"
						>
							Continue learning
						</button>
					</div>
				</div>
			{:else if onboarding.currentStep}
				<div class="p-6">
					<!-- Step indicator -->
					<div class="text-xs font-medium text-accent mb-2">
						Step {onboarding.currentStepIndex + 1} of {onboarding.totalSteps}
						{#if onboarding.tutorialMode === 'extended' && onboarding.currentStepIndex >= quickTutorialSteps.length}
							<span class="text-tertiary ml-1">(Advanced)</span>
						{/if}
					</div>

					<!-- Title -->
					<h2 class="text-lg font-bold text-primary mb-1">
						{onboarding.currentStep.title}
					</h2>

					<!-- Description -->
					<p class="text-sm text-secondary mb-4">
						{onboarding.currentStep.description}
					</p>

					<!-- Keys with press highlighting -->
					<div class="keys-display">
						{#each onboarding.currentStep.keys as key, i}
							{@const displayKey = formatKeyForDisplay(key)}
							<div
								class="key-badge {getKeyWidthClass(displayKey)}"
								class:pressed={pressedKeys.includes(key) || pressedKeys.includes(displayKey)}
							>
								{displayKey}
							</div>
							{#if i < onboarding.currentStep.keys.length - 1}
								<span class="text-tertiary text-sm">{isCombo ? '+' : 'or'}</span>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Footer -->
				<div class="tutorial-footer">
					<button
						onclick={() => onboarding.skipTutorial()}
						class="text-xs text-tertiary hover:text-secondary"
					>
						Skip
					</button>

					<div class="flex gap-2">
						{#if onboarding.currentStepIndex > 0}
							<button
								onclick={() => onboarding.previousStep()}
								class="btn-secondary text-xs py-1"
							>
								Back
							</button>
						{/if}
						<button
							onclick={() => onboarding.nextStep()}
							class="btn-primary text-xs py-1"
						>
							{onboarding.isLastStep ? 'Finish' : 'Next'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.tutorial-card {
		position: absolute;
		pointer-events: auto;
		width: 20rem;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.progress-track {
		height: 0.25rem;
		background-color: var(--color-surface-elevated);
	}

	.progress-bar {
		height: 100%;
		background-color: var(--color-accent);
		transition: width 0.3s ease;
	}

	.keys-display {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem;
		background-color: var(--color-surface-elevated);
		border-radius: 0.5rem;
	}

	.key-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 2.5rem;
		height: 2.5rem;
		padding: 0 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		font-family: var(--font-family-mono);
		color: var(--color-text-secondary);
		/* MacBook-style keycap */
		background: linear-gradient(
			to bottom,
			var(--color-surface) 0%,
			color-mix(in srgb, var(--color-surface) 92%, black) 100%
		);
		border: 1px solid var(--color-border);
		border-bottom-width: 3px;
		border-radius: 0.5rem;
		box-shadow:
			0 1px 0 var(--color-border),
			0 3px 5px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		transition: all 0.075s ease;
	}

	/* Key width modifiers - larger MacBook proportions for tutorial */
	.key-badge:global(.kbd-wide) { min-width: 4rem; }
	.key-badge:global(.kbd-medium) { min-width: 3.25rem; }
	.key-badge:global(.kbd-narrow) { min-width: 2.5rem; }
	.key-badge:global(.kbd-space) { min-width: 6rem; }

	.key-badge.pressed {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent-hover);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
		transform: translateY(3px);
	}

	.tutorial-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		background-color: var(--color-surface-elevated);
		border-top: 1px solid var(--color-border);
	}

	/* Circular timer styles */
	.cleanup-timer {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.timer-bg {
		fill: none;
		stroke: var(--color-border);
		stroke-width: 3;
	}

	.timer-progress {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 3;
		stroke-linecap: round;
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
	}
</style>
