import type { GanttData } from '$lib/types';
import { formatDate } from './date-utils';
import { escapeCSVValue } from './csv-parser';

export interface CSVExportOptions {
	dateFormat?: string;
	includeHeaders?: boolean;
	includeBOM?: boolean;
}

/**
 * Export GanttData to CSV format
 */
export function exportToCSV(data: GanttData, options: CSVExportOptions = {}): string {
	const { dateFormat = 'YYYY-MM-DD', includeHeaders = true, includeBOM = true } = options;

	// Build section lookup
	const sectionMap = new Map(data.sections.map((s) => [s.id, s.name]));
	const tagMap = new Map(data.tags.map((t) => [t.id, t.name]));

	const headers = [
		'Title',
		'Section',
		'Start Date',
		'End Date',
		'Status',
		'Dependencies',
		'Is Milestone',
		'Color',
		'Tags',
		'Estimated Hours',
		'Actual Hours',
		'Estimated Cost',
		'Actual Cost',
		'Notes'
	];

	const rows: string[][] = [];

	for (const task of data.tasks) {
		const row = [
			task.title,
			task.sectionId ? (sectionMap.get(task.sectionId) ?? '') : '',
			formatDate(task.startDate, dateFormat),
			formatDate(task.endDate, dateFormat),
			task.status ?? '',
			task.dependencies.join(';'),
			task.isMilestone ? 'Yes' : 'No',
			task.color ?? '',
			task.tags.map((id) => tagMap.get(id) ?? id).join(';'),
			task.estimatedHours?.toString() ?? '',
			task.actualHours?.toString() ?? '',
			task.estimatedCost?.toString() ?? '',
			task.actualCost?.toString() ?? '',
			task.notes ?? ''
		];
		rows.push(row);
	}

	const lines: string[] = [];

	if (includeHeaders) {
		lines.push(headers.map(escapeCSVValue).join(','));
	}

	for (const row of rows) {
		lines.push(row.map(escapeCSVValue).join(','));
	}

	const csv = lines.join('\n');

	// Add UTF-8 BOM for Excel compatibility
	if (includeBOM) {
		return '\uFEFF' + csv;
	}

	return csv;
}

/**
 * Download CSV content as a file
 */
export function downloadCSV(data: GanttData, filename = 'gantt-chart.csv'): void {
	const csv = exportToCSV(data);
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
