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
		class="btn-secondary py-1.5"
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
		<div class="dropdown-menu">
			{#if isCreating}
				<div class="p-3 border-b border-default">
					<input
						type="text"
						bind:value={newProjectName}
						placeholder="Project name..."
						class="w-full px-3 py-2 text-sm border border-default rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
						onkeydown={(e) => e.key === 'Enter' && createProject()}
					/>
					<div class="flex gap-2 mt-2">
						<button
							onclick={createProject}
							disabled={!newProjectName.trim()}
							class="btn-primary flex-1 py-1.5 disabled:opacity-50"
						>
							Create
						</button>
						<button
							onclick={() => (isCreating = false)}
							class="btn-secondary py-1.5"
						>
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<button
					onclick={startCreating}
					class="w-full flex items-center gap-2 px-4 py-3 text-sm text-accent hover:bg-[var(--color-accent-subtle)] border-b border-default"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					New Project
				</button>
			{/if}

			<div class="max-h-64 overflow-y-auto">
				{#each [...persistence.projects].sort((a, b) => b.updatedAt - a.updatedAt) as project}
					<div
						class="project-item"
						class:active={project.id === persistence.currentProjectId}
					>
						<button
							onclick={() => selectProject(project.id)}
							class="flex-1 text-left min-w-0"
						>
							<div class="font-medium truncate" class:text-accent={project.id === persistence.currentProjectId}>
								{project.name}
							</div>
							<div class="text-xs text-tertiary">
								{formatDate(project.updatedAt)}
							</div>
						</button>
						{#if project.id !== persistence.currentProjectId}
							<button
								onclick={(e) => deleteProject(e, project.id)}
								class="delete-btn"
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
					<div class="px-4 py-6 text-sm text-tertiary text-center">
						No projects yet
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.dropdown-menu {
		position: absolute;
		left: 0;
		top: 100%;
		margin-top: 0.25rem;
		width: 18rem;
		background-color: var(--color-surface);
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--color-border);
		z-index: 50;
		overflow: hidden;
	}

	.project-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		color: var(--color-text);
		transition: background-color 0.15s ease;
	}

	.project-item:hover {
		background-color: var(--color-surface-elevated);
	}

	.project-item.active {
		background-color: var(--color-accent-subtle);
	}

	.delete-btn {
		padding: 0.25rem;
		color: var(--color-text-tertiary);
		opacity: 0;
		transition: opacity 0.15s ease, color 0.15s ease;
	}

	.project-item:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		color: var(--color-status-critical);
	}
</style>
