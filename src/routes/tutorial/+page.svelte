<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import KeyDetector from '$lib/components/onboarding/KeyDetector.svelte';
	import {
		KEYBOARD_LESSONS,
		getLessonsByCategory,
		getCategories
	} from '$lib/data/keyboard-lessons';
	import type { KeyboardLesson } from '$lib/data/keyboard-lessons';

	let currentLessonIndex = $state(0);
	let activeCategory = $state<KeyboardLesson['category']>('navigation');
	let completedLessons = $state<Set<string>>(new Set());
	let lessonsPerCategory: Record<KeyboardLesson['category'], KeyboardLesson[]> = $state({
		navigation: [],
		task: [],
		timeline: [],
		global: []
	});

	onMount(() => {
		// Load completed lessons from localStorage
		const saved = localStorage.getItem('gantt:tutorial:completed');
		if (saved) {
			try {
				completedLessons = new Set(JSON.parse(saved));
			} catch {
				completedLessons = new Set();
			}
		}

		// Group lessons by category
		const categories = getCategories();
		for (const cat of categories) {
			lessonsPerCategory[cat] = getLessonsByCategory(cat);
		}

		// Set active category to first with lessons
		activeCategory = categories[0] as KeyboardLesson['category'];
	});

	function getCurrentCategoryLessons(): KeyboardLesson[] {
		return lessonsPerCategory[activeCategory] || [];
	}

	function getCurrentLesson(): KeyboardLesson | null {
		const lessons = getCurrentCategoryLessons();
		return lessons[currentLessonIndex] || null;
	}

	function handleLessonComplete(): void {
		const lesson = getCurrentLesson();
		if (!lesson) return;

		completedLessons.add(lesson.id);
		completedLessons = new Set(completedLessons); // trigger reactivity

		// Save to localStorage
		localStorage.setItem('gantt:tutorial:completed', JSON.stringify(Array.from(completedLessons)));

		// Move to next lesson
		const categoryLessons = getCurrentCategoryLessons();
		if (currentLessonIndex < categoryLessons.length - 1) {
			currentLessonIndex++;
		} else {
			// Find next category with lessons
			const categories = getCategories();
			const currentIndex = categories.indexOf(activeCategory);
			if (currentIndex < categories.length - 1) {
				activeCategory = categories[currentIndex + 1] as KeyboardLesson['category'];
				currentLessonIndex = 0;
			} else {
				// All done!
				showCompletionMessage();
			}
		}
	}

	function handleSkipLesson(): void {
		const categoryLessons = getCurrentCategoryLessons();
		if (currentLessonIndex < categoryLessons.length - 1) {
			currentLessonIndex++;
		} else {
			const categories = getCategories();
			const currentIndex = categories.indexOf(activeCategory);
			if (currentIndex < categories.length - 1) {
				activeCategory = categories[currentIndex + 1] as KeyboardLesson['category'];
				currentLessonIndex = 0;
			}
		}
	}

	function showCompletionMessage(): void {
		// Keep showing last lesson with completion message
		const totalLessons = KEYBOARD_LESSONS.length;
		const completed = completedLessons.size;
		alert(`Great job! You've completed ${completed}/${totalLessons} lessons. Visit /editor to start using your new skills!`);
	}

	function getProgressPercentage(): number {
		const totalLessons = KEYBOARD_LESSONS.length;
		return totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;
	}

	function switchCategory(cat: KeyboardLesson['category']): void {
		activeCategory = cat;
		currentLessonIndex = 0;
	}

	function getCategoryLessonsCompleted(cat: KeyboardLesson['category']): number {
		const lessons = lessonsPerCategory[cat] || [];
		return lessons.filter((l) => completedLessons.has(l.id)).length;
	}

	const progress = $derived(getProgressPercentage());
	const lesson = $derived(getCurrentLesson());
	const categoryLessons = $derived(getCurrentCategoryLessons());
</script>

{#if browser}
	<div class="min-h-screen bg-white dark:bg-gray-900">
		<div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<a href="/editor" class="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block">
				← Back to Editor
			</a>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Keyboard Tutorial</h1>
			<p class="text-gray-600 dark:text-gray-400">
				Learn keyboard shortcuts to master the editor. Press the keys to advance.
			</p>
		</div>

		<!-- Progress Bar -->
		<div class="mb-8">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
				<span class="text-sm text-gray-600 dark:text-gray-400">{completedLessons.size}/{KEYBOARD_LESSONS.length}</span>
			</div>
			<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
				<div
					class="bg-blue-600 h-2 rounded-full transition-all duration-300"
					style="width: {progress}%"
				></div>
			</div>
			<p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{progress}% complete</p>
		</div>

		<!-- Category Tabs -->
		<div class="flex gap-2 mb-8 flex-wrap">
			{#each getCategories() as cat}
				<button
					onclick={() => switchCategory(cat)}
					class="px-4 py-2 rounded-lg font-medium transition-all
					{activeCategory === cat
						? 'bg-blue-600 text-white'
						: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'}"
				>
					{cat.charAt(0).toUpperCase() + cat.slice(1)}
					<span class="text-sm ml-1">
						({getCategoryLessonsCompleted(cat)}/{(lessonsPerCategory[cat] || []).length})
					</span>
				</button>
			{/each}
		</div>

		<!-- Current Lesson -->
		{#if lesson}
			<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-8">
				<div class="mb-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						{lesson.description}
					</h2>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400">
							{currentLessonIndex + 1} of {categoryLessons.length} in {activeCategory}
						</span>
						{#if completedLessons.has(lesson.id)}
							<span class="text-sm text-green-600 dark:text-green-400 font-semibold">✓ Completed</span>
						{/if}
					</div>
				</div>

				<!-- Key Detector -->
				<div class="mb-8">
					<KeyDetector
						{lesson}
						onMatch={handleLessonComplete}
					/>
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					<button
						onclick={handleSkipLesson}
						class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
						bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
					>
						Skip Lesson
					</button>
					<button
						onclick={() => goto('/editor')}
						class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
						bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
					>
						Exit Tutorial
					</button>
				</div>
			</div>

			<!-- Tips -->
			<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">Tips:</h3>
				<ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1">
					<li>• Press the exact keys shown above to advance</li>
					<li>• On Mac, Ctrl is mapped to Cmd (⌘)</li>
					<li>• You can skip lessons you already know</li>
					<li>• Your progress is automatically saved</li>
				</ul>
			</div>
		{:else}
			<div class="text-center py-12">
				<p class="text-gray-600 dark:text-gray-400 mb-4">All lessons completed!</p>
				<a href="/editor" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
					Go to Editor
				</a>
			</div>
		{/if}
		</div>
	</div>
{/if}
