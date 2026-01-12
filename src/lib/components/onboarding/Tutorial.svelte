<script lang="ts">
	import { getOnboardingContext, tutorialSteps } from '$lib/stores/onboarding-store.svelte';

	const onboarding = getOnboardingContext();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onboarding.skipTutorial();
		}
	}
</script>

{#if onboarding.showTutorial}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Tutorial"
	>
		<div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
			<!-- Progress bar -->
			<div class="h-1 bg-gray-200">
				<div
					class="h-full bg-blue-500 transition-all duration-300"
					style:width="{onboarding.progress}%"
				></div>
			</div>

			<!-- Content -->
			{#if onboarding.currentStep}
				<div class="p-8">
					<!-- Step indicator -->
					<div class="flex items-center gap-2 mb-4">
						<span class="text-sm font-medium text-blue-600">
							Step {onboarding.currentStepIndex + 1} of {tutorialSteps.length}
						</span>
					</div>

					<!-- Title -->
					<h2 class="text-2xl font-bold text-gray-900 mb-2">
						{onboarding.currentStep.title}
					</h2>

					<!-- Description -->
					<p class="text-gray-600 mb-6">
						{onboarding.currentStep.description}
					</p>

					<!-- Key hints -->
					<div class="flex items-center gap-2 mb-8">
						<span class="text-sm text-gray-500">Press</span>
						{#each onboarding.currentStep.keys as key}
							<kbd class="kbd text-lg">{key}</kbd>
						{/each}
					</div>

					<!-- Animated keyboard visualization -->
					<div class="flex justify-center mb-8">
						<div class="relative">
							<div
								class="flex gap-1 p-4 bg-gray-100 rounded-xl animate-pulse"
							>
								{#each onboarding.currentStep.keys as key, i}
									<div
										class="flex items-center justify-center min-w-12 h-12 px-3 bg-white border-2 border-gray-300 rounded-lg text-lg font-medium text-gray-800 shadow-md"
										style:animation-delay="{i * 0.1}s"
									>
										{key}
									</div>
									{#if i < onboarding.currentStep.keys.length - 1}
										<span class="flex items-center text-gray-400 text-xl">+</span>
									{/if}
								{/each}
							</div>
							<!-- Pressing indicator -->
							<div
								class="absolute inset-0 flex items-center justify-center pointer-events-none"
							>
								<div class="w-full h-full rounded-xl border-2 border-blue-400 animate-ping opacity-50"></div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Footer -->
			<div class="flex items-center justify-between px-8 py-4 bg-gray-50 border-t border-gray-200">
				<button
					onclick={() => onboarding.skipTutorial()}
					class="text-sm text-gray-500 hover:text-gray-700"
				>
					Skip tutorial
				</button>

				<div class="flex gap-2">
					{#if onboarding.currentStepIndex > 0}
						<button
							onclick={() => onboarding.previousStep()}
							class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							Previous
						</button>
					{/if}
					<button
						onclick={() => onboarding.nextStep()}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
					>
						{onboarding.isLastStep ? 'Finish' : 'Next'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes press {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(4px);
		}
	}
</style>
