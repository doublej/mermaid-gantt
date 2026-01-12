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
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Just now';
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
	<button class="fixed inset-0 bg-black/50 z-50" onclick={close} aria-label="Close"></button>

	<!-- Modal -->
	<div class="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
			<h2 class="text-lg font-semibold text-gray-900">Version History</h2>
			<button
				onclick={close}
				class="p-1 text-gray-400 hover:text-gray-600 rounded"
				aria-label="Close"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Create snapshot -->
		<div class="px-4 py-3 border-b border-gray-100">
			{#if isCreating}
				<input
					type="text"
					bind:value={snapshotName}
					placeholder="Snapshot name (optional)..."
					class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					onkeydown={(e) => e.key === 'Enter' && createSnapshot()}
				/>
				<div class="flex gap-2 mt-2">
					<button
						onclick={createSnapshot}
						class="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
					>
						Save Snapshot
					</button>
					<button
						onclick={() => (isCreating = false)}
						class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
					>
						Cancel
					</button>
				</div>
			{:else}
				<button
					onclick={() => (isCreating = true)}
					class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Create Snapshot
				</button>
			{/if}
		</div>

		<!-- Versions list -->
		<div class="flex-1 overflow-y-auto">
			{#each sortedVersions as version}
				<div class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 group">
					<div class="flex items-start justify-between">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								{#if version.name}
									<span class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
									<span class="font-medium text-gray-900 truncate">{version.name}</span>
								{:else}
									<span class="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></span>
									<span class="text-gray-500">Auto-save</span>
								{/if}
							</div>
							<div class="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
								<span>{formatDate(version.timestamp)}</span>
								<span class="text-gray-300">·</span>
								<span>{formatRelativeTime(version.timestamp)}</span>
							</div>
							<div class="mt-1 text-xs text-gray-400">
								{version.data.tasks.length} task{version.data.tasks.length !== 1 ? 's' : ''}
							</div>
						</div>
						<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100">
							<button
								onclick={() => restoreVersion(version.id)}
								class="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded"
								title="Restore this version"
							>
								Restore
							</button>
							<button
								onclick={() => deleteVersion(version.id)}
								class="p-1 text-gray-400 hover:text-red-500 rounded"
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
				<div class="px-4 py-12 text-center">
					<svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="mt-2 text-sm text-gray-500">No versions yet</p>
					<p class="mt-1 text-xs text-gray-400">Auto-saves happen every hour</p>
				</div>
			{/if}
		</div>

		<!-- Footer info -->
		<div class="px-4 py-3 border-t border-gray-200 bg-gray-50">
			<div class="flex items-center gap-4 text-xs text-gray-400">
				<div class="flex items-center gap-1">
					<span class="w-2 h-2 bg-blue-500 rounded-full"></span>
					Manual
				</div>
				<div class="flex items-center gap-1">
					<span class="w-2 h-2 bg-gray-300 rounded-full"></span>
					Auto-save (hourly)
				</div>
			</div>
		</div>
	</div>
{/if}
