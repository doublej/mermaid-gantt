<script lang="ts">
	import { getPersistenceContext } from '$lib/stores/persistence-store.svelte';

	const persistence = getPersistenceContext();

	let snapshotName = $state('');
	let isCreating = $state(false);

	function close() {
		persistence.closeHistory();
		isCreating = false;
		snapshotName = '';
	}

	function createSnapshot() {
		persistence.createSnapshot(snapshotName.trim() || undefined);
		isCreating = false;
		snapshotName = '';
	}

	function restoreVersion(id: string) {
		if (confirm('Restore this version? Your current work will be saved as a snapshot first.')) {
			persistence.restoreVersion(id);
		}
	}

	function deleteVersion(id: string) {
		if (confirm('Delete this version?')) {
			persistence.deleteVersion(id);
		}
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatRelativeTime(timestamp: number): string {
		const diff = Date.now() - timestamp;
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (seconds < 10) return 'Just now';
		if (seconds < 60) return `${seconds}s ago`;
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	}

	const sortedVersions = $derived(
		[...persistence.currentVersions].sort((a, b) => b.timestamp - a.timestamp)
	);
</script>

{#if persistence.isHistoryOpen}
	<!-- Backdrop -->
	<button class="modal-backdrop" onclick={close} aria-label="Close"></button>

	<!-- Slide-over panel -->
	<div class="version-panel">
		<!-- Header -->
		<div class="panel-header">
			<h2 class="text-lg font-semibold text-primary">Version History</h2>
			<button onclick={close} class="btn-ghost" aria-label="Close">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Create snapshot -->
		<div class="snapshot-section">
			{#if isCreating}
				<input
					type="text"
					bind:value={snapshotName}
					placeholder="Snapshot name (optional)..."
					class="snapshot-input"
					onkeydown={(e) => e.key === 'Enter' && createSnapshot()}
				/>
				<div class="flex gap-2 mt-2">
					<button onclick={createSnapshot} class="btn-primary flex-1 py-1.5">
						Save Snapshot
					</button>
					<button onclick={() => (isCreating = false)} class="btn-secondary py-1.5">
						Cancel
					</button>
				</div>
			{:else}
				<button onclick={() => (isCreating = true)} class="create-snapshot-btn">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Create Snapshot
				</button>
			{/if}
		</div>

		<!-- Versions list -->
		<div class="versions-list">
			{#each sortedVersions as version}
				<div class="version-item group">
					<div class="flex items-start justify-between">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								{#if version.name}
									<span class="version-dot named"></span>
									<span class="font-medium text-primary truncate">{version.name}</span>
								{:else}
									<span class="version-dot"></span>
									<span class="text-secondary">Auto-save</span>
								{/if}
							</div>
							<div class="flex items-center gap-2 mt-0.5 text-xs text-tertiary">
								<span>{formatDate(version.timestamp)}</span>
								<span class="text-tertiary">·</span>
								<span>{formatRelativeTime(version.timestamp)}</span>
							</div>
							<div class="mt-1 text-xs text-tertiary">
								{version.data.tasks.length} task{version.data.tasks.length !== 1 ? 's' : ''}
							</div>
						</div>
						<div class="version-actions">
							<button
								onclick={() => restoreVersion(version.id)}
								class="restore-btn"
								title="Restore this version"
							>
								Restore
							</button>
							<button
								onclick={() => deleteVersion(version.id)}
								class="delete-btn"
								title="Delete this version"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/each}

			{#if sortedVersions.length === 0}
				<div class="empty-state">
					<svg class="w-12 h-12 mx-auto text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="mt-2 text-sm text-secondary">No versions yet</p>
					<p class="mt-1 text-xs text-tertiary">Auto-saves on every change (max 1/min)</p>
				</div>
			{/if}
		</div>

		<!-- Footer info -->
		<div class="panel-footer">
			<div class="flex items-center gap-4 text-xs text-tertiary">
				<div class="flex items-center gap-1">
					<span class="version-dot named"></span>
					Manual
				</div>
				<div class="flex items-center gap-1">
					<span class="version-dot"></span>
					Auto (max 1/min)
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.version-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 24rem;
		background-color: var(--color-surface);
		box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
		z-index: 50;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.snapshot-section {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.snapshot-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		background-color: var(--color-surface);
		color: var(--color-text);
	}

	.snapshot-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-light);
	}

	.create-snapshot-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-accent);
		background-color: var(--color-accent-subtle);
		border-radius: 0.5rem;
		transition: background-color 0.15s ease;
	}

	.create-snapshot-btn:hover {
		background-color: var(--color-accent-light);
	}

	.versions-list {
		flex: 1;
		overflow-y: auto;
	}

	.version-item {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
		transition: background-color 0.15s ease;
	}

	.version-item:hover {
		background-color: var(--color-surface-elevated);
	}

	.version-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.version-dot.named {
		background-color: var(--color-accent);
	}

	.version-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.version-item:hover .version-actions {
		opacity: 1;
	}

	.restore-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-accent);
		border-radius: 0.25rem;
		transition: background-color 0.15s ease;
	}

	.restore-btn:hover {
		background-color: var(--color-accent-subtle);
	}

	.delete-btn {
		padding: 0.25rem;
		color: var(--color-text-tertiary);
		border-radius: 0.25rem;
		transition: color 0.15s ease;
	}

	.delete-btn:hover {
		color: var(--color-status-critical);
	}

	.empty-state {
		padding: 3rem 1rem;
		text-align: center;
	}

	.panel-footer {
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}
</style>
