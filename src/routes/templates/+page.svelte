<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Template } from '$lib/stores/template-store.svelte';
	import type { Task } from '$lib/types';
	import { getTemplateContext } from '$lib/stores/template-store.svelte';
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { getPersistenceContext } from '$lib/stores/persistence-store.svelte';

	let templates: Template[] = [];
	let showSaveForm = $state(false);
	let templateName = $state('');
	let templateDescription = $state('');
	let deleteConfirmId: string | null = $state(null);
	let isClient = $state(false);

	let templateStore: any;
	let ganttStore: any;
	let persistenceStore: any;

	onMount(() => {
		isClient = true;
		if (browser) {
			templateStore = getTemplateContext();
			ganttStore = getGanttContext();
			persistenceStore = getPersistenceContext();
			templates = templateStore.getTemplates();
		}
	});

	function handleSaveTemplate(): void {
		if (!templateName.trim()) return;

		// Serialize current gantt data (tasks with Date objects to ISO strings)
		const serialized = {
			config: ganttStore.data.config,
			sections: ganttStore.data.sections,
			tasks: ganttStore.data.tasks.map((t: Task) => ({
				id: t.id,
				title: t.title,
				sectionId: t.sectionId,
				startDate: t.startDate.toISOString(),
				endDate: t.endDate.toISOString(),
				status: t.status,
				dependencies: t.dependencies,
				parentId: t.parentId ?? null,
				isMilestone: t.isMilestone ?? false,
				color: t.color ?? null,
				tags: t.tags ?? [],
				estimatedHours: t.estimatedHours ?? null,
				actualHours: t.actualHours ?? null,
				estimatedCost: t.estimatedCost ?? null,
				actualCost: t.actualCost ?? null,
				notes: t.notes ?? null
			})),
			tags: ganttStore.data.tags ?? []
		};

		templateStore.saveAsTemplate(templateName, serialized, templateDescription);

		templates = templateStore.getTemplates();
		templateName = '';
		templateDescription = '';
		showSaveForm = false;
	}

	async function handleUseTemplate(template: Template): Promise<void> {
		// Create new project with template data
		const newProjectId = persistenceStore.createProject('Untitled Project');
		persistenceStore.switchProject(newProjectId);

		// Deserialize template data (ISO strings to Date objects)
		const deserialized = {
			config: template.data.config,
			sections: template.data.sections,
			tasks: template.data.tasks.map((t: any) => ({
				id: t.id,
				title: t.title,
				sectionId: t.sectionId,
				startDate: new Date(t.startDate),
				endDate: new Date(t.endDate),
				status: t.status,
				dependencies: t.dependencies ?? [],
				parentId: t.parentId ?? null,
				isMilestone: t.isMilestone ?? false,
				color: t.color ?? null,
				tags: t.tags ?? [],
				estimatedHours: t.estimatedHours ?? null,
				actualHours: t.actualHours ?? null,
				estimatedCost: t.estimatedCost ?? null,
				actualCost: t.actualCost ?? null,
				notes: t.notes ?? null
			})),
			tags: template.data.tags ?? []
		};

		ganttStore.importData(deserialized);

		// Navigate to editor
		await goto('/editor');
	}

	function handleDeleteTemplate(id: string): void {
		deleteConfirmId = null;
		templateStore.deleteTemplate(id);
		templates = templateStore.getTemplates();
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function countTasks(template: Template): number {
		return template.data.tasks.length;
	}
</script>

{#if isClient}
	<div class="min-h-screen bg-white dark:bg-gray-900">
		<div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<a href="/editor" class="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block">
				← Back to Editor
			</a>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Templates</h1>
			<p class="text-gray-600 dark:text-gray-400">
				Start with a pre-built template or save your current project as a template.
			</p>
		</div>

		<!-- Save Current as Template -->
		<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
			{#if !showSaveForm}
				<button
					onclick={() => (showSaveForm = true)}
					class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
				>
					Save Current Project as Template
				</button>
			{:else}
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Template Name
						</label>
						<input
							type="text"
							bind:value={templateName}
							placeholder="e.g., My Custom Workflow"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
							bg-white dark:bg-gray-800 text-gray-900 dark:text-white
							focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Description (optional)
						</label>
						<textarea
							bind:value={templateDescription}
							placeholder="Describe what this template is for..."
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
							bg-white dark:bg-gray-800 text-gray-900 dark:text-white
							focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						></textarea>
					</div>
					<div class="flex gap-2">
						<button
							onclick={handleSaveTemplate}
							disabled={!templateName.trim()}
							class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Save Template
						</button>
						<button
							onclick={() => {
								showSaveForm = false;
								templateName = '';
								templateDescription = '';
							}}
							class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Templates Grid -->
		<div class="space-y-8">
			<!-- Built-in Templates -->
			<div>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Built-in Templates</h2>
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each templateStore.getBuiltInTemplates() as template (template.id)}
						<div
							class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800
							hover:shadow-lg dark:hover:shadow-xl transition-shadow"
						>
							<h3 class="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
							{#if template.description}
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
							{/if}
							<div class="text-xs text-gray-500 dark:text-gray-500 mb-4">
								{countTasks(template)} tasks
							</div>
							<button
								onclick={() => handleUseTemplate(template)}
								class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700
								transition-colors"
							>
								Use Template
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- User Templates -->
			{#if templateStore.getUserTemplates().length > 0}
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Templates</h2>
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each templateStore.getUserTemplates() as template (template.id)}
							<div
								class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800
								hover:shadow-lg dark:hover:shadow-xl transition-shadow"
							>
								<h3 class="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
								{#if template.description}
									<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
								{/if}
								<div class="text-xs text-gray-500 dark:text-gray-500 mb-4">
									{countTasks(template)} tasks • Created {formatDate(template.createdAt)}
								</div>
								<div class="flex gap-2">
									<button
										onclick={() => handleUseTemplate(template)}
										class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700
										transition-colors"
									>
										Use
									</button>
									<button
										onclick={() => (deleteConfirmId = template.id)}
										class="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700
										transition-colors"
									>
										Delete
									</button>
								</div>

								<!-- Delete Confirmation -->
								{#if deleteConfirmId === template.id}
									<div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
										<p class="text-sm text-red-800 dark:text-red-200 mb-2">
											Are you sure you want to delete this template?
										</p>
										<div class="flex gap-2">
											<button
												onclick={() => handleDeleteTemplate(template.id)}
												class="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
											>
												Confirm Delete
											</button>
											<button
												onclick={() => (deleteConfirmId = null)}
												class="flex-1 px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white text-xs rounded hover:bg-gray-400"
											>
												Cancel
											</button>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		</div>
	</div>
{/if}
