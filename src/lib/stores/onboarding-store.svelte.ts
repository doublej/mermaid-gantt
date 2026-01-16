import { getContext, setContext } from 'svelte';
import type { TutorialStep, TutorialMode, TutorialCleanup } from '$lib/types';

const ONBOARDING_CONTEXT = Symbol('onboarding');
const STORAGE_KEY = 'gantt-onboarding-completed';

// Quick tutorial: 5 essential steps
export const quickTutorialSteps: TutorialStep[] = [
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
		description: 'Press Enter to edit the selected task',
		action: 'editTask',
		keys: ['Enter'],
		targetSelector: '[data-task-focused]',
		cleanup: 'closeEditor'
	},
	{
		id: 'command-palette',
		title: 'Command Palette',
		description: 'Press Ctrl+K to open the command palette',
		action: 'openCommandPalette',
		keys: ['Ctrl', 'K'],
		cleanup: 'closeModals'
	},
	{
		id: 'help',
		title: 'Keyboard Shortcuts',
		description: 'Press F1 or ? anytime for all shortcuts',
		action: 'openHelp',
		keys: ['F1', '?'],
		cleanup: 'closeModals'
	}
];

// Extended tutorial: additional shortcuts (curated from keyboard-lessons.ts)
export const extendedTutorialSteps: TutorialStep[] = [
	// Navigation
	{
		id: 'focus-first',
		title: 'Jump to First Task',
		description: 'Press Home to jump to the first task',
		action: 'focusFirst',
		keys: ['Home']
	},
	{
		id: 'focus-last',
		title: 'Jump to Last Task',
		description: 'Press End to jump to the last task',
		action: 'focusLast',
		keys: ['End']
	},
	// Task operations
	{
		id: 'copy-task',
		title: 'Copy Task',
		description: 'Press Ctrl+C to copy the selected task',
		action: 'copyTask',
		keys: ['Ctrl', 'C']
	},
	{
		id: 'paste-task',
		title: 'Paste Task',
		description: 'Press Ctrl+V to paste a copied task',
		action: 'pasteTask',
		keys: ['Ctrl', 'V']
	},
	{
		id: 'duplicate-task',
		title: 'Duplicate Task',
		description: 'Press Ctrl+D to duplicate the selected task',
		action: 'duplicateTask',
		keys: ['Ctrl', 'D']
	},
	// Timeline
	{
		id: 'zoom-in',
		title: 'Zoom In',
		description: 'Press Ctrl++ to zoom in on the timeline',
		action: 'zoomIn',
		keys: ['Ctrl', '+']
	},
	{
		id: 'zoom-out',
		title: 'Zoom Out',
		description: 'Press Ctrl+- to zoom out on the timeline',
		action: 'zoomOut',
		keys: ['Ctrl', '-']
	},
	{
		id: 'move-task',
		title: 'Move Task',
		description: 'Press Ctrl+Arrow to move entire task by 1 day',
		action: 'moveTaskRight',
		keys: ['Ctrl', '→']
	},
	// Global
	{
		id: 'undo',
		title: 'Undo',
		description: 'Press Ctrl+Z to undo your last action',
		action: 'undo',
		keys: ['Ctrl', 'Z']
	},
	{
		id: 'redo',
		title: 'Redo',
		description: 'Press Ctrl+Shift+Z to redo your last action',
		action: 'redo',
		keys: ['Ctrl', 'Shift', 'Z']
	}
];

// Combined for backward compatibility
export const tutorialSteps: TutorialStep[] = quickTutorialSteps;

export class OnboardingStore {
	hasCompletedTutorial = $state(false);
	showTutorial = $state(false);
	currentStepIndex = $state(0);
	showHints = $state(true);
	tutorialMode = $state<TutorialMode>('quick');
	showContinuePrompt = $state(false);
	pendingCleanup = $state<TutorialCleanup | null>(null);

	// Cleanup callback - set by Tutorial.svelte which has access to keyboard/gantt contexts
	private cleanupCallback: ((cleanup: TutorialCleanup) => void) | null = null;

	// Get current steps based on tutorial mode
	activeSteps = $derived(
		this.tutorialMode === 'extended'
			? [...quickTutorialSteps, ...extendedTutorialSteps]
			: quickTutorialSteps
	);

	currentStep = $derived(this.activeSteps[this.currentStepIndex] ?? null);
	totalSteps = $derived(this.activeSteps.length);
	progress = $derived((this.currentStepIndex / this.totalSteps) * 100);
	isLastQuickStep = $derived(
		this.tutorialMode === 'quick' && this.currentStepIndex === quickTutorialSteps.length - 1
	);
	isLastStep = $derived(this.currentStepIndex === this.totalSteps - 1);

	constructor() {
		// Check localStorage on init
		if (typeof window !== 'undefined') {
			this.hasCompletedTutorial = localStorage.getItem(STORAGE_KEY) === 'true';
		}
	}

	setCleanupCallback(callback: (cleanup: TutorialCleanup) => void): void {
		this.cleanupCallback = callback;
	}

	runCleanup(): void {
		if (this.pendingCleanup && this.cleanupCallback) {
			this.cleanupCallback(this.pendingCleanup);
		}
		this.pendingCleanup = null;
	}

	startTutorial(): void {
		this.showTutorial = true;
		this.currentStepIndex = 0;
		this.tutorialMode = 'quick';
		this.showContinuePrompt = false;
		this.pendingCleanup = null;
	}

	// Called when action is performed - sets pending cleanup if needed
	requestNextStep(): void {
		const step = this.currentStep;
		if (step?.cleanup) {
			this.pendingCleanup = step.cleanup;
		} else {
			this.advanceStep();
		}
	}

	// Actually advance to next step (called after cleanup timer)
	advanceStep(): void {
		this.pendingCleanup = null;

		// Check if we just finished the quick tutorial
		if (this.isLastQuickStep && this.tutorialMode === 'quick') {
			this.showContinuePrompt = true;
			return;
		}

		if (this.currentStepIndex < this.totalSteps - 1) {
			this.currentStepIndex++;
		} else {
			this.completeTutorial();
		}
	}

	nextStep(): void {
		this.advanceStep();
	}

	previousStep(): void {
		if (this.currentStepIndex > 0) {
			this.currentStepIndex--;
		}
	}

	continueWithExtended(): void {
		this.showContinuePrompt = false;
		this.tutorialMode = 'extended';
		this.currentStepIndex++; // Move to first extended step
	}

	finishQuickTutorial(): void {
		this.showContinuePrompt = false;
		this.completeTutorial();
	}

	skipTutorial(): void {
		this.runCleanup();
		this.completeTutorial();
	}

	completeTutorial(): void {
		this.showTutorial = false;
		this.showContinuePrompt = false;
		this.hasCompletedTutorial = true;
		this.tutorialMode = 'complete';
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, 'true');
		}
	}

	resetTutorial(): void {
		this.hasCompletedTutorial = false;
		this.currentStepIndex = 0;
		this.tutorialMode = 'quick';
		this.showContinuePrompt = false;
		if (typeof window !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	// Called when user performs an action
	onAction(action: string): void {
		if (!this.showTutorial || this.showContinuePrompt || this.pendingCleanup) return;

		const currentStep = this.currentStep;
		if (currentStep && currentStep.action === action) {
			// Delay to let the action complete visually, then request next step
			setTimeout(() => this.requestNextStep(), 300);
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
