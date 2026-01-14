<script lang="ts">
	import { getGanttContext } from '$lib/stores/gantt-store.svelte';
	import { parseCSV } from '$lib/utils/csv-parser';
	import { parseDate } from '$lib/utils/date-utils';
	import { generateId } from '$lib/utils/id';
	import type { Task, GanttData } from '$lib/types';

	interface Props {
		onClose: () => void;
		onImport: (data: GanttData) => void;
		initialContent?: string | null;
	}

	const { onClose, onImport, initialContent = null }: Props = $props();
	const gantt = getGanttContext();

	// State
	let csvContent = $state('');

	// Initialize with content from file drop
	$effect(() => {
		if (initialContent && !csvContent) {
			csvContent = initialContent;
			parseCSVContent();
		}
	});
	let parseResult = $state<{ headers: string[]; rows: string[][]; errors: string[] } | null>(null);
	let dateFormat = $state('YYYY-MM-DD');
	let importErrors = $state<string[]>([]);

	// Column mappings
	let titleColumn = $state<number>(-1);
	let startDateColumn = $state<number>(-1);
	let endDateColumn = $state<number>(-1);
	let sectionColumn = $state<number>(-1);
	let statusColumn = $state<number>(-1);
	let notesColumn = $state<number>(-1);

	const dateFormats = [
		{ value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-01-15)' },
		{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/15/2024)' },
		{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/01/2024)' },
		{ value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (2024/01/15)' }
	];

	const previewRows = $derived(parseResult?.rows.slice(0, 5) ?? []);
	const canImport = $derived(
		parseResult && titleColumn >= 0 && startDateColumn >= 0 && importErrors.length === 0
	);

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			csvContent = e.target?.result as string;
			parseCSVContent();
		};
		reader.readAsText(file);
	}

	function parseCSVContent() {
		if (!csvContent.trim()) {
			parseResult = null;
			return;
		}

		parseResult = parseCSV(csvContent);
		importErrors = parseResult.errors;

		// Auto-detect columns
		if (parseResult.headers.length > 0) {
			autoDetectColumns(parseResult.headers);
		}
	}

	function autoDetectColumns(headers: string[]) {
		const lowerHeaders = headers.map((h) => h.toLowerCase());

		// Title
		titleColumn = lowerHeaders.findIndex((h) =>
			['title', 'name', 'task', 'task name', 'description'].includes(h)
		);

		// Start date
		startDateColumn = lowerHeaders.findIndex((h) =>
			['start', 'start date', 'startdate', 'begin', 'from'].includes(h)
		);

		// End date
		endDateColumn = lowerHeaders.findIndex((h) =>
			['end', 'end date', 'enddate', 'finish', 'to', 'due', 'due date'].includes(h)
		);

		// Section
		sectionColumn = lowerHeaders.findIndex((h) =>
			['section', 'category', 'group', 'phase'].includes(h)
		);

		// Status
		statusColumn = lowerHeaders.findIndex((h) =>
			['status', 'state', 'progress'].includes(h)
		);

		// Notes
		notesColumn = lowerHeaders.findIndex((h) =>
			['notes', 'note', 'comments', 'description'].includes(h)
		);
	}

	function handleImport() {
		if (!parseResult || titleColumn < 0 || startDateColumn < 0) return;

		const errors: string[] = [];
		const sectionMap = new Map<string, string>();
		const sections: { id: string; name: string; order: number }[] = [];
		const tasks: Task[] = [];

		for (let i = 0; i < parseResult.rows.length; i++) {
			const row = parseResult.rows[i];
			const rowNum = i + 2; // 1-indexed, +1 for header

			// Parse title
			const title = row[titleColumn]?.trim();
			if (!title) {
				errors.push(`Row ${rowNum}: Missing title`);
				continue;
			}

			// Parse dates
			const startStr = row[startDateColumn]?.trim();
			const startDate = startStr ? parseDate(startStr, dateFormat) : null;
			if (!startDate) {
				errors.push(`Row ${rowNum}: Invalid start date "${startStr}"`);
				continue;
			}

			let endDate: Date;
			if (endDateColumn >= 0 && row[endDateColumn]?.trim()) {
				const parsed = parseDate(row[endDateColumn].trim(), dateFormat);
				endDate = parsed ?? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
			} else {
				// Default to 7 days
				endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
			}

			// Handle section
			let sectionId: string | null = null;
			if (sectionColumn >= 0 && row[sectionColumn]?.trim()) {
				const sectionName = row[sectionColumn].trim();
				if (!sectionMap.has(sectionName)) {
					const id = generateId();
					sectionMap.set(sectionName, id);
					sections.push({ id, name: sectionName, order: sections.length });
				}
				sectionId = sectionMap.get(sectionName) ?? null;
			}

			// Parse status
			let status: Task['status'] = 'active';
			if (statusColumn >= 0 && row[statusColumn]?.trim()) {
				const statusStr = row[statusColumn].trim().toLowerCase();
				if (['done', 'complete', 'completed', 'finished'].includes(statusStr)) {
					status = 'done';
				} else if (['critical', 'crit', 'urgent'].includes(statusStr)) {
					status = 'crit';
				} else if (['milestone'].includes(statusStr)) {
					status = 'milestone';
				}
			}

			// Parse notes
			const notes = notesColumn >= 0 ? row[notesColumn]?.trim() || null : null;

			tasks.push({
				id: generateId(),
				title,
				sectionId: sectionId ?? (sections[0]?.id ?? null),
				startDate,
				endDate,
				status,
				dependencies: [],
				parentId: null,
				isMilestone: status === 'milestone',
				color: null,
				tags: [],
				estimatedHours: null,
				actualHours: null,
				estimatedCost: null,
				actualCost: null,
				notes
			});
		}

		if (errors.length > 0) {
			importErrors = errors;
			return;
		}

		// Ensure at least one section exists
		if (sections.length === 0) {
			sections.push({ id: generateId(), name: 'Tasks', order: 0 });
			tasks.forEach((t) => {
				t.sectionId = sections[0].id;
			});
		}

		const data: GanttData = {
			config: { ...gantt.data.config },
			sections,
			tasks,
			tags: []
		};

		onImport(data);
	}
</script>

<div class="csv-importer">
	<div class="csv-header">
		<h3 class="text-lg font-semibold">Import CSV</h3>
		<button onclick={onClose} class="btn-ghost" aria-label="Close">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<div class="csv-content">
		<!-- File upload or paste -->
		<div class="csv-section">
			<div class="flex items-center gap-4 mb-3">
				<label class="btn-secondary cursor-pointer">
					<input type="file" accept=".csv" onchange={handleFileUpload} class="hidden" />
					Upload CSV
				</label>
				<span class="text-sm text-secondary">or paste below</span>
			</div>

			<textarea
				bind:value={csvContent}
				oninput={parseCSVContent}
				placeholder="title,start,end,section&#10;Task 1,2024-01-01,2024-01-07,Phase 1&#10;Task 2,2024-01-08,2024-01-14,Phase 1"
				class="csv-textarea"
			></textarea>
		</div>

		{#if parseResult && parseResult.headers.length > 0}
			<!-- Column mapping -->
			<div class="csv-section">
				<h4 class="text-sm font-medium mb-3">Map Columns</h4>
				<div class="grid grid-cols-2 gap-3">
					<div class="mapping-field">
						<label for="csv-title-col">Title *</label>
						<select id="csv-title-col" bind:value={titleColumn} class="mapping-select">
							<option value={-1}>-- Select --</option>
							{#each parseResult.headers as header, i}
								<option value={i}>{header}</option>
							{/each}
						</select>
					</div>

					<div class="mapping-field">
						<label for="csv-start-col">Start Date *</label>
						<select id="csv-start-col" bind:value={startDateColumn} class="mapping-select">
							<option value={-1}>-- Select --</option>
							{#each parseResult.headers as header, i}
								<option value={i}>{header}</option>
							{/each}
						</select>
					</div>

					<div class="mapping-field">
						<label for="csv-end-col">End Date</label>
						<select id="csv-end-col" bind:value={endDateColumn} class="mapping-select">
							<option value={-1}>-- None --</option>
							{#each parseResult.headers as header, i}
								<option value={i}>{header}</option>
							{/each}
						</select>
					</div>

					<div class="mapping-field">
						<label for="csv-section-col">Section</label>
						<select id="csv-section-col" bind:value={sectionColumn} class="mapping-select">
							<option value={-1}>-- None --</option>
							{#each parseResult.headers as header, i}
								<option value={i}>{header}</option>
							{/each}
						</select>
					</div>

					<div class="mapping-field">
						<label for="csv-status-col">Status</label>
						<select id="csv-status-col" bind:value={statusColumn} class="mapping-select">
							<option value={-1}>-- None --</option>
							{#each parseResult.headers as header, i}
								<option value={i}>{header}</option>
							{/each}
						</select>
					</div>

					<div class="mapping-field">
						<label for="csv-notes-col">Notes</label>
						<select id="csv-notes-col" bind:value={notesColumn} class="mapping-select">
							<option value={-1}>-- None --</option>
							{#each parseResult.headers as header, i}
								<option value={i}>{header}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<!-- Date format -->
			<div class="csv-section">
				<h4 class="text-sm font-medium mb-2">Date Format</h4>
				<select bind:value={dateFormat} class="mapping-select w-full">
					{#each dateFormats as format}
						<option value={format.value}>{format.label}</option>
					{/each}
				</select>
			</div>

			<!-- Preview -->
			<div class="csv-section">
				<h4 class="text-sm font-medium mb-2">Preview (first 5 rows)</h4>
				<div class="preview-table-wrapper">
					<table class="preview-table">
						<thead>
							<tr>
								{#each parseResult.headers as header, i}
									<th
										class:mapped={i === titleColumn || i === startDateColumn || i === endDateColumn || i === sectionColumn || i === statusColumn || i === notesColumn}
									>
										{header}
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each previewRows as row}
								<tr>
									{#each row as cell, i}
										<td
											class:mapped={i === titleColumn || i === startDateColumn || i === endDateColumn || i === sectionColumn || i === statusColumn || i === notesColumn}
										>
											{cell}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Errors -->
		{#if importErrors.length > 0}
			<div class="error-box">
				<strong>Errors:</strong>
				<ul class="mt-1 list-disc list-inside">
					{#each importErrors.slice(0, 10) as error}
						<li>{error}</li>
					{/each}
					{#if importErrors.length > 10}
						<li>... and {importErrors.length - 10} more errors</li>
					{/if}
				</ul>
			</div>
		{/if}
	</div>

	<div class="csv-footer">
		<button onclick={onClose} class="btn-secondary">Cancel</button>
		<button onclick={handleImport} disabled={!canImport} class="btn-primary">
			Import {parseResult?.rows.length ?? 0} Tasks
		</button>
	</div>
</div>

<style>
	.csv-importer {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-height: 80vh;
	}

	.csv-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.csv-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.csv-section {
		margin-bottom: 1.5rem;
	}

	.csv-textarea {
		width: 100%;
		height: 8rem;
		padding: 0.75rem;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		color: var(--color-text);
		resize: none;
	}

	.csv-textarea:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.mapping-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mapping-field label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.mapping-select {
		padding: 0.5rem;
		font-size: 0.875rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		color: var(--color-text);
	}

	.mapping-select:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.preview-table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
	}

	.preview-table {
		width: 100%;
		font-size: 0.75rem;
		border-collapse: collapse;
	}

	.preview-table th,
	.preview-table td {
		padding: 0.5rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border);
		white-space: nowrap;
	}

	.preview-table th {
		background-color: var(--color-surface-elevated);
		font-weight: 500;
	}

	.preview-table th.mapped,
	.preview-table td.mapped {
		background-color: var(--color-accent-subtle);
	}

	.error-box {
		padding: 0.75rem;
		font-size: 0.875rem;
		color: var(--color-status-critical);
		background-color: color-mix(in srgb, var(--color-status-critical) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-status-critical) 30%, transparent);
		border-radius: 0.5rem;
	}

	.csv-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface-elevated);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
