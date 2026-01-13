<script lang="ts">
	import { getPersistenceContext } from '$lib/stores/persistence-store.svelte';
	import type { ProjectMeta } from '$lib/types';

	const persistence = getPersistenceContext();

	let selectedProjectId = $state<string | null>(null);
	let isCreating = $state(false);
	let isRenaming = $state(false);
	let newProjectName = $state('');
	let searchQuery = $state('');
	let createInput: HTMLInputElement;
	let renameInput: HTMLInputElement;

	// Auto-select current project when opening
	$effect(() => {
		if (persistence.isFileBrowserOpen && !selectedProjectId) {
			selectedProjectId = persistence.currentProjectId;
		}
	});

	// Focus input when creating
	$effect(() => {
		if (isCreating && createInput) {
			setTimeout(() => createInput.focus(), 50);
		}
	});

	// Focus input when renaming
	$effect(() => {
		if (isRenaming && renameInput) {
			setTimeout(() => {
				renameInput.focus();
				renameInput.select();
			}, 50);
		}
	});

	const filteredProjects = $derived(
		persistence.projects
			.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => b.updatedAt - a.updatedAt)
	);

	const selectedProject = $derived(
		persistence.projects.find((p) => p.id === selectedProjectId) ?? null
	);

	const selectedVersions = $derived(
		selectedProjectId ? getProjectVersions(selectedProjectId) : []
	);

	function getProjectVersions(projectId: string) {
		const data = localStorage.getItem(`gantt:project:${projectId}`);
		if (!data) return [];
		try {
			const parsed = JSON.parse(data);
			return parsed.versions ?? [];
		} catch {
			return [];
		}
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDateTime(timestamp: number): string {
		return new Date(timestamp).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatRelativeTime(timestamp: number): string {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return formatDate(timestamp);
	}

	function close() {
		persistence.closeFileBrowser();
		selectedProjectId = null;
		isCreating = false;
		isRenaming = false;
		newProjectName = '';
		searchQuery = '';
	}

	function selectProject(project: ProjectMeta) {
		selectedProjectId = project.id;
		isCreating = false;
		isRenaming = false;
	}

	function openProject() {
		if (selectedProjectId) {
			persistence.switchProject(selectedProjectId);
			close();
		}
	}

	function startCreating() {
		isCreating = true;
		isRenaming = false;
		newProjectName = '';
	}

	function createProject() {
		if (!newProjectName.trim()) return;
		const id = persistence.createProject(newProjectName.trim());
		selectedProjectId = id;
		isCreating = false;
		newProjectName = '';
	}

	function startRenaming() {
		if (!selectedProject) return;
		isRenaming = true;
		isCreating = false;
		newProjectName = selectedProject.name;
	}

	function renameProject() {
		if (!selectedProjectId || !newProjectName.trim()) return;
		persistence.renameProject(selectedProjectId, newProjectName.trim());
		isRenaming = false;
		newProjectName = '';
	}

	function deleteProject() {
		if (!selectedProjectId) return;
		if (confirm('Delete this project? This cannot be undone.')) {
			const idToDelete = selectedProjectId;
			selectedProjectId = null;
			persistence.deleteProject(idToDelete);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (isCreating || isRenaming) {
				isCreating = false;
				isRenaming = false;
				newProjectName = '';
			} else {
				close();
			}
			event.preventDefault();
		} else if (event.key === 'Enter' && !isCreating && !isRenaming) {
			openProject();
			event.preventDefault();
		} else if (event.key === 'n' && (event.metaKey || event.ctrlKey)) {
			startCreating();
			event.preventDefault();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

{#if persistence.isFileBrowserOpen}
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-label="Project browser"
		tabindex="-1"
	>
		<div class="file-browser">
			<!-- Header -->
			<div class="browser-header">
				<h2 class="text-lg font-semibold text-primary">Projects</h2>
				<button onclick={close} class="btn-ghost" aria-label="Close">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Toolbar -->
			<div class="browser-toolbar">
				<button onclick={startCreating} class="btn-primary text-sm py-1.5">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					New
				</button>
				<div class="flex-1"></div>
				<div class="search-box">
					<svg class="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search projects..."
						class="search-input"
					/>
				</div>
			</div>

			<!-- Content -->
			<div class="browser-content">
				<!-- Project list -->
				<div class="project-list">
					{#if isCreating}
						<div class="create-form">
							<input
								bind:this={createInput}
								bind:value={newProjectName}
								type="text"
								placeholder="Project name..."
								class="create-input"
								onkeydown={(e) => e.key === 'Enter' && createProject()}
							/>
							<div class="create-actions">
								<button onclick={createProject} disabled={!newProjectName.trim()} class="btn-primary text-xs py-1">
									Create
								</button>
								<button onclick={() => (isCreating = false)} class="btn-secondary text-xs py-1">
									Cancel
								</button>
							</div>
						</div>
					{/if}

					{#each filteredProjects as project (project.id)}
						<button
							onclick={() => selectProject(project)}
							ondblclick={openProject}
							class="project-item"
							class:selected={project.id === selectedProjectId}
							class:current={project.id === persistence.currentProjectId}
						>
							<div class="project-icon">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
								</svg>
							</div>
							<div class="project-info">
								<div class="project-name">{project.name}</div>
								<div class="project-meta">{formatRelativeTime(project.updatedAt)}</div>
							</div>
							{#if project.id === persistence.currentProjectId}
								<span class="current-badge">Current</span>
							{/if}
						</button>
					{:else}
						{#if !isCreating}
							<div class="empty-state">
								{#if searchQuery}
									<p>No projects match "{searchQuery}"</p>
								{:else}
									<p>No projects yet</p>
									<button onclick={startCreating} class="btn-secondary text-sm mt-2">
										Create your first project
									</button>
								{/if}
							</div>
						{/if}
					{/each}
				</div>

				<!-- Project details -->
				<div class="project-details">
					{#if selectedProject}
						<div class="details-header">
							{#if isRenaming}
								<div class="rename-form">
									<input
										bind:this={renameInput}
										bind:value={newProjectName}
										type="text"
										class="rename-input"
										onkeydown={(e) => e.key === 'Enter' && renameProject()}
									/>
									<div class="rename-actions">
										<button onclick={renameProject} disabled={!newProjectName.trim()} class="btn-primary text-xs py-1">
											Save
										</button>
										<button onclick={() => (isRenaming = false)} class="btn-secondary text-xs py-1">
											Cancel
										</button>
									</div>
								</div>
							{:else}
								<h3 class="details-title">{selectedProject.name}</h3>
								<button onclick={startRenaming} class="btn-ghost text-xs" title="Rename project">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
								</button>
							{/if}
						</div>

						<div class="details-stats">
							<div class="stat">
								<span class="stat-label">Created</span>
								<span class="stat-value">{formatDate(selectedProject.createdAt)}</span>
							</div>
							<div class="stat">
								<span class="stat-label">Modified</span>
								<span class="stat-value">{formatDateTime(selectedProject.updatedAt)}</span>
							</div>
							<div class="stat">
								<span class="stat-label">Versions</span>
								<span class="stat-value">{selectedVersions.length}</span>
							</div>
						</div>

						<!-- Version timeline -->
						{#if selectedVersions.length > 0}
							<div class="version-section">
								<h4 class="version-title">Version History</h4>
								<div class="version-list">
									{#each selectedVersions.slice(0, 5) as version (version.id)}
										<div class="version-item">
											<div class="version-dot" class:named={version.name !== null}></div>
											<div class="version-info">
												<div class="version-name">
													{version.name ?? 'Auto-save'}
												</div>
												<div class="version-time">
													{formatDateTime(version.timestamp)}
												</div>
											</div>
										</div>
									{/each}
									{#if selectedVersions.length > 5}
										<div class="version-more">
											+{selectedVersions.length - 5} more versions
										</div>
									{/if}
								</div>
							</div>
						{/if}

						<!-- Actions -->
						<div class="details-actions">
							<button onclick={openProject} class="btn-primary flex-1">
								{#if selectedProjectId === persistence.currentProjectId}
									Already Open
								{:else}
									Open Project
								{/if}
							</button>
							<button
								onclick={deleteProject}
								class="btn-ghost text-[var(--color-status-critical)]"
								title="Delete project"
								disabled={persistence.projects.length <= 1}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					{:else}
						<div class="empty-details">
							<svg class="w-12 h-12 text-tertiary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
							</svg>
							<p class="text-secondary">Select a project to view details</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div class="browser-footer">
				<div class="flex items-center gap-2 text-xs text-tertiary">
					<kbd class="kbd kbd-xs">Enter</kbd>
					<span>Open</span>
					<span class="mx-1">|</span>
					<kbd class="kbd kbd-xs">Ctrl</kbd>+<kbd class="kbd kbd-xs">N</kbd>
					<span>New</span>
					<span class="mx-1">|</span>
					<kbd class="kbd kbd-xs">Esc</kbd>
					<span>Close</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.file-browser {
		width: 100%;
		max-width: 56rem;
		height: 80vh;
		max-height: 600px;
		background-color: var(--color-surface);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.browser-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.browser-toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		width: 200px;
	}

	.search-input {
		background: transparent;
		border: none;
		outline: none;
		font-size: 0.875rem;
		color: var(--color-text);
		width: 100%;
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.browser-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		flex: 1;
		min-height: 0;
	}

	.project-list {
		border-right: 1px solid var(--color-border);
		overflow-y: auto;
		padding: 0.5rem;
	}

	.create-form,
	.rename-form {
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		background-color: var(--color-surface-elevated);
		border-radius: 0.5rem;
		border: 1px solid var(--color-border);
	}

	.create-input,
	.rename-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.create-input:focus,
	.rename-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-light);
	}

	.create-actions,
	.rename-actions {
		display: flex;
		gap: 0.5rem;
	}

	.project-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem;
		border-radius: 0.5rem;
		text-align: left;
		transition: background-color 0.15s ease;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.project-item:hover {
		background-color: var(--color-surface-elevated);
	}

	.project-item.selected {
		background-color: var(--color-accent-subtle);
		border-color: var(--color-accent);
	}

	.project-icon {
		flex-shrink: 0;
		color: var(--color-text-tertiary);
	}

	.project-item.selected .project-icon {
		color: var(--color-accent);
	}

	.project-info {
		flex: 1;
		min-width: 0;
	}

	.project-name {
		font-weight: 500;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.project-item.selected .project-name {
		color: var(--color-accent);
	}

	.project-meta {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.current-badge {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.375rem;
		background-color: var(--color-accent-subtle);
		color: var(--color-accent);
		border-radius: 0.25rem;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.project-details {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		overflow-y: auto;
	}

	.details-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.details-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.details-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.version-section {
		flex: 1;
		min-height: 0;
		margin-bottom: 1.5rem;
	}

	.version-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
	}

	.version-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.version-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.version-dot {
		flex-shrink: 0;
		width: 0.5rem;
		height: 0.5rem;
		margin-top: 0.375rem;
		border-radius: 50%;
		background-color: var(--color-text-tertiary);
	}

	.version-dot.named {
		background-color: var(--color-accent);
	}

	.version-info {
		flex: 1;
	}

	.version-name {
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.version-time {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.version-more {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		padding-left: 1.25rem;
	}

	.details-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;
	}

	.empty-details {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
	}

	.browser-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.kbd-xs {
		font-size: 0.625rem;
		padding: 0.125rem 0.25rem;
	}
</style>
