<script lang="ts">
	import { getPersistenceContext } from '$lib/stores/persistence-store.svelte';

	const persistence = getPersistenceContext();

	let isOpen = $state(false);
	let newProjectName = $state('');
	let isCreating = $state(false);

	function toggleDropdown() {
		isOpen = !isOpen;
		if (!isOpen) {
			isCreating = false;
			newProjectName = '';
		}
	}

	function closeDropdown() {
		isOpen = false;
		isCreating = false;
		newProjectName = '';
	}

	function selectProject(id: string) {
		persistence.switchProject(id);
		closeDropdown();
	}

	function startCreating() {
		isCreating = true;
		newProjectName = '';
	}

	function createProject() {
		if (!newProjectName.trim()) return;
		const id = persistence.createProject(newProjectName.trim());
		persistence.switchProject(id);
		closeDropdown();
	}

	function deleteProject(e: Event, id: string) {
		e.stopPropagation();
		if (confirm('Delete this project? This cannot be undone.')) {
			persistence.deleteProject(id);
		}
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="relative">
	<button
		onclick={toggleDropdown}
		class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
		</svg>
		<span class="max-w-[150px] truncate">{persistence.currentProject?.name ?? 'No project'}</span>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<!-- Backdrop -->
		<button class="fixed inset-0 z-40" onclick={closeDropdown} aria-label="Close"></button>

		<!-- Dropdown -->
		<div class="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
			{#if isCreating}
				<div class="p-3 border-b border-gray-100">
					<input
						type="text"
						bind:value={newProjectName}
						placeholder="Project name..."
						class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						onkeydown={(e) => e.key === 'Enter' && createProject()}
					/>
					<div class="flex gap-2 mt-2">
						<button
							onclick={createProject}
							disabled={!newProjectName.trim()}
							class="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
						>
							Create
						</button>
						<button
							onclick={() => (isCreating = false)}
							class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
						>
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<button
					onclick={startCreating}
					class="w-full flex items-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 border-b border-gray-100"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					New Project
				</button>
			{/if}

			<div class="max-h-64 overflow-y-auto">
				{#each persistence.projects.sort((a, b) => b.updatedAt - a.updatedAt) as project}
					<div
						class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 group {project.id === persistence.currentProjectId ? 'bg-blue-50' : ''}"
					>
						<button
							onclick={() => selectProject(project.id)}
							class="flex-1 text-left min-w-0"
						>
							<div class="font-medium truncate {project.id === persistence.currentProjectId ? 'text-blue-600' : 'text-gray-900'}">
								{project.name}
							</div>
							<div class="text-xs text-gray-400">
								{formatDate(project.updatedAt)}
							</div>
						</button>
						{#if project.id !== persistence.currentProjectId}
							<button
								onclick={(e) => deleteProject(e, project.id)}
								class="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
								title="Delete project"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						{/if}
					</div>
				{/each}

				{#if persistence.projects.length === 0}
					<div class="px-4 py-6 text-sm text-gray-400 text-center">
						No projects yet
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
