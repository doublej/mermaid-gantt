import { getContext, setContext } from 'svelte';
import type { TutorialStep } from '$lib/types';

const ONBOARDING_CONTEXT = Symbol('onboarding');
const STORAGE_KEY = 'gantt-onboarding-completed';

export const tutorialSteps: TutorialStep[] = [
	{
		id: 'create-task',
		title: 'Create a Task',
		description: 'Press Ctrl+N to create your first task',
		action: 'newTask',
		keys: ['Ctrl', 'N'],
		targetSelector: '[data-gantt-chart]'
	},
	{
		id: 'navigate',
		title: 'Navigate Tasks',
		description: 'Use Arrow Up/Down to move between tasks',
		action: 'focusNext',
		keys: ['↑', '↓'],
		targetSelector: '[data-task-focused]'
	},
	{
		id: 'edit-task',
		title: 'Edit a Task',
		description: 'Press Enter to edit, or F2 to rename inline',
		action: 'editTask',
		keys: ['Enter'],
		targetSelector: '[data-task-focused]'
	},
	{
		id: 'command-palette',
		title: 'Command Palette',
		description: 'Press Ctrl+K to open the command palette',
		action: 'openCommandPalette',
		keys: ['Ctrl', 'K'],
	},
	{
		id: 'help',
		title: 'Keyboard Shortcuts',
		description: 'Press F1 or ? anytime for all shortcuts',
		action: 'openHelp',
		keys: ['F1', '?'],
	}
];

export class OnboardingStore {
	hasCompletedTutorial = $state(false);
	showTutorial = $state(false);
	currentStepIndex = $state(0);
	showHints = $state(true);

	currentStep = $derived(tutorialSteps[this.currentStepIndex] ?? null);
	progress = $derived((this.currentStepIndex / tutorialSteps.length) * 100);
	isLastStep = $derived(this.currentStepIndex === tutorialSteps.length - 1);

	constructor() {
		// Check localStorage on init
		if (typeof window !== 'undefined') {
			this.hasCompletedTutorial = localStorage.getItem(STORAGE_KEY) === 'true';
		}
	}

	startTutorial(): void {
		this.showTutorial = true;
		this.currentStepIndex = 0;
	}

	nextStep(): void {
		if (this.currentStepIndex < tutorialSteps.length - 1) {
			this.currentStepIndex++;
		} else {
			this.completeTutorial();
		}
	}

	previousStep(): void {
		if (this.currentStepIndex > 0) {
			this.currentStepIndex--;
		}
	}

	skipTutorial(): void {
		this.completeTutorial();
	}

	completeTutorial(): void {
		this.showTutorial = false;
		this.hasCompletedTutorial = true;
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, 'true');
		}
	}

	resetTutorial(): void {
		this.hasCompletedTutorial = false;
		this.currentStepIndex = 0;
		if (typeof window !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	// Called when user performs an action
	onAction(action: string): void {
		if (!this.showTutorial) return;

		const currentStep = this.currentStep;
		if (currentStep && currentStep.action === action) {
			// Delay to let the action complete visually
			setTimeout(() => this.nextStep(), 300);
		}
	}

	toggleHints(): void {
		this.showHints = !this.showHints;
	}
}

// Context helpers
export function createOnboardingStore(): OnboardingStore {
	return new OnboardingStore();
}

export function setOnboardingContext(store: OnboardingStore): void {
	setContext(ONBOARDING_CONTEXT, store);
}

export function getOnboardingContext(): OnboardingStore {
	const store = getContext<OnboardingStore>(ONBOARDING_CONTEXT);
	if (!store) {
		throw new Error('OnboardingStore not found in context');
	}
	return store;
}
