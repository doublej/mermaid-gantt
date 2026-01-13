import type { GanttData, Task, TaskStatus } from '$lib/types';
import { formatDate, diffDays } from './date-utils';

function formatStatus(status: TaskStatus, isMilestone: boolean): string {
	return isMilestone ? 'milestone' : (status ?? '');
}

function formatTask(task: Task, taskAliases: Map<string, string>, dateFormat: string): string {
	const parts: string[] = [];

	// Add status if present (milestone flag takes precedence)
	const status = formatStatus(task.status, task.isMilestone ?? false);
	if (status) {
		parts.push(status);
	}

	// Add alias
	const alias = taskAliases.get(task.id);
	if (alias) {
		parts.push(alias);
	}

	// Add start date or dependency
	if (task.dependencies.length > 0) {
		const depAlias = taskAliases.get(task.dependencies[0]);
		if (depAlias) {
			parts.push(`after ${depAlias}`);
		} else {
			parts.push(formatDate(task.startDate, dateFormat));
		}
	} else {
		parts.push(formatDate(task.startDate, dateFormat));
	}

	// Add duration
	const duration = diffDays(task.startDate, task.endDate) + 1;
	parts.push(`${duration}d`);

	return `${task.title} :${parts.join(', ')}`;
}

export function exportToMermaid(data: GanttData): string {
	const lines: string[] = ['gantt'];

	// Config
	if (data.config.title) {
		lines.push(`    title ${data.config.title}`);
	}
	lines.push(`    dateFormat ${data.config.dateFormat}`);

	if (data.config.axisFormat && data.config.axisFormat !== '%Y-%m-%d') {
		lines.push(`    axisFormat ${data.config.axisFormat}`);
	}

	if (data.config.excludes.length > 0) {
		lines.push(`    excludes ${data.config.excludes.join(', ')}`);
	}

	// Generate aliases for tasks
	const taskAliases = new Map<string, string>();
	let aliasCounter = 1;

	for (const task of data.tasks) {
		const prefix = task.title
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '')
			.slice(0, 3);
		taskAliases.set(task.id, `${prefix}${aliasCounter++}`);
	}

	// Group tasks by section
	const tasksBySection = new Map<string | null, Task[]>();

	for (const task of data.tasks) {
		const sectionId = task.sectionId;
		if (!tasksBySection.has(sectionId)) {
			tasksBySection.set(sectionId, []);
		}
		tasksBySection.get(sectionId)!.push(task);
	}

	// Output sections and tasks
	for (const section of data.sections) {
		lines.push(`    section ${section.name}`);

		const sectionTasks = tasksBySection.get(section.id) ?? [];
		for (const task of sectionTasks) {
			lines.push(`    ${formatTask(task, taskAliases, data.config.dateFormat)}`);
		}
	}

	// Output tasks without section
	const noSectionTasks = tasksBySection.get(null) ?? [];
	if (noSectionTasks.length > 0 && data.sections.length > 0) {
		lines.push('    section Uncategorized');
	}
	for (const task of noSectionTasks) {
		lines.push(`    ${formatTask(task, taskAliases, data.config.dateFormat)}`);
	}

	return lines.join('\n');
}

// JSON serialization (full fidelity)
export function exportToJson(data: GanttData): string {
	const serializable = {
		...data,
		tasks: data.tasks.map((t) => ({
			...t,
			startDate: t.startDate.toISOString(),
			endDate: t.endDate.toISOString()
		}))
	};
	return JSON.stringify(serializable, null, 2);
}

export function importFromJson(json: string): GanttData {
	const parsed = JSON.parse(json);
	return {
		...parsed,
		tasks: parsed.tasks.map((t: { startDate: string; endDate: string }) => ({
			...t,
			startDate: new Date(t.startDate),
			endDate: new Date(t.endDate)
		}))
	};
}
