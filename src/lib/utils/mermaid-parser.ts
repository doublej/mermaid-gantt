import type { GanttData, GanttConfig, Task, Section, TaskStatus } from '$lib/types';
import { addDays, parseDate, parseDuration, startOfDay } from './date-utils';

function generateId(): string {
	return Math.random().toString(36).slice(2, 9);
}

function defaultConfig(): GanttConfig {
	return {
		title: '',
		dateFormat: 'YYYY-MM-DD',
		axisFormat: '%Y-%m-%d',
		excludes: []
	};
}

interface ParseContext {
	config: GanttConfig;
	currentSection: Section | null;
	sections: Section[];
	tasks: Task[];
	tasksByAlias: Map<string, Task>;
}

function parseStatus(statusStr: string): TaskStatus {
	const normalized = statusStr.toLowerCase().trim();
	if (normalized === 'active') return 'active';
	if (normalized === 'done') return 'done';
	if (normalized === 'crit') return 'crit';
	if (normalized === 'milestone') return 'milestone';
	return null;
}

function parseTaskLine(line: string, ctx: ParseContext): void {
	// Task format: title :status?, alias?, date/after, duration/endDate
	// Examples:
	// Research :done, p1, 2024-01-01, 7d
	// Requirements :active, p2, after p1, 5d
	// Sprint 1 :s1, 2024-01-15, 14d
	// Milestone :milestone, m1, 2024-02-01, 0d

	const colonIdx = line.indexOf(':');
	if (colonIdx === -1) return;

	const title = line.slice(0, colonIdx).trim();
	const rest = line.slice(colonIdx + 1).trim();

	if (!title || !rest) return;

	const parts = rest.split(',').map((p) => p.trim());
	if (parts.length < 2) return;

	let status: TaskStatus = null;
	let alias: string | null = null;
	let startSpec: string;
	let durationSpec: string;

	// Parse parts - status and alias are optional
	let partIdx = 0;

	// Check if first part is a status
	const possibleStatus = parseStatus(parts[0]);
	if (possibleStatus !== null) {
		status = possibleStatus;
		partIdx++;
	}

	// Check if next part is an alias (doesn't start with 'after' and isn't a date)
	if (partIdx < parts.length) {
		const part = parts[partIdx];
		if (!part.startsWith('after') && !isDateLike(part, ctx.config.dateFormat)) {
			alias = part;
			partIdx++;
		}
	}

	// Remaining parts should be start and duration
	if (partIdx + 2 > parts.length) return;

	startSpec = parts[partIdx];
	durationSpec = parts[partIdx + 1];

	// Calculate dates
	let startDate: Date;
	let endDate: Date;

	if (startSpec.startsWith('after ')) {
		const depAlias = startSpec.slice(6).trim();
		const depTask = ctx.tasksByAlias.get(depAlias);
		if (depTask) {
			startDate = addDays(depTask.endDate, 1);
		} else {
			startDate = startOfDay(new Date());
		}
	} else {
		const parsed = parseDate(startSpec, ctx.config.dateFormat);
		startDate = parsed ?? startOfDay(new Date());
	}

	// Parse duration or end date
	if (isDateLike(durationSpec, ctx.config.dateFormat)) {
		const parsed = parseDate(durationSpec, ctx.config.dateFormat);
		endDate = parsed ?? addDays(startDate, 1);
	} else {
		const days = parseDuration(durationSpec);
		endDate = addDays(startDate, days - 1);
	}

	const task: Task = {
		id: generateId(),
		title,
		sectionId: ctx.currentSection?.id ?? null,
		startDate,
		endDate,
		status,
		dependencies: startSpec.startsWith('after ') ? findDependencies(startSpec, ctx) : [],
		// New fields with defaults
		parentId: null,
		isMilestone: status === 'milestone',
		color: null,
		tags: [],
		estimatedHours: null,
		actualHours: null,
		estimatedCost: null,
		actualCost: null,
		notes: null
	};

	ctx.tasks.push(task);
	if (alias) {
		ctx.tasksByAlias.set(alias, task);
	}
}

function isDateLike(str: string, format: string): boolean {
	// Simple heuristic: if it has the same length and contains digits and separators
	if (str.length !== format.length) return false;
	return /^\d{4}-\d{2}-\d{2}$/.test(str) || /^\d{2}\/\d{2}\/\d{4}$/.test(str);
}

function findDependencies(startSpec: string, ctx: ParseContext): string[] {
	const depAlias = startSpec.slice(6).trim();
	const depTask = ctx.tasksByAlias.get(depAlias);
	return depTask ? [depTask.id] : [];
}

export function parseMermaidGantt(input: string): GanttData {
	const lines = input.trim().split('\n');
	const ctx: ParseContext = {
		config: defaultConfig(),
		currentSection: null,
		sections: [],
		tasks: [],
		tasksByAlias: new Map()
	};

	let sectionOrder = 0;

	for (const rawLine of lines) {
		const line = rawLine.trim();

		// Skip empty lines and comments
		if (!line || line.startsWith('%%')) continue;

		// Skip gantt declaration
		if (line === 'gantt') continue;

		// Parse directives
		if (line.startsWith('title ')) {
			ctx.config.title = line.slice(6).trim();
			continue;
		}

		if (line.startsWith('dateFormat ')) {
			ctx.config.dateFormat = line.slice(11).trim();
			continue;
		}

		if (line.startsWith('axisFormat ')) {
			ctx.config.axisFormat = line.slice(11).trim();
			continue;
		}

		if (line.startsWith('excludes ')) {
			ctx.config.excludes = line
				.slice(9)
				.split(',')
				.map((s) => s.trim());
			continue;
		}

		// Parse section
		if (line.startsWith('section ')) {
			const section: Section = {
				id: generateId(),
				name: line.slice(8).trim(),
				order: sectionOrder++
			};
			ctx.sections.push(section);
			ctx.currentSection = section;
			continue;
		}

		// Parse task
		if (line.includes(':')) {
			parseTaskLine(line, ctx);
		}
	}

	return {
		config: ctx.config,
		sections: ctx.sections,
		tasks: ctx.tasks,
		tags: []
	};
}

// Validate parsed data
export function validateGanttData(data: GanttData): string[] {
	const errors: string[] = [];

	// Check for circular dependencies
	const visited = new Set<string>();
	const inStack = new Set<string>();

	function hasCycle(taskId: string): boolean {
		if (inStack.has(taskId)) return true;
		if (visited.has(taskId)) return false;

		visited.add(taskId);
		inStack.add(taskId);

		const task = data.tasks.find((t) => t.id === taskId);
		if (task) {
			for (const depId of task.dependencies) {
				if (hasCycle(depId)) return true;
			}
		}

		inStack.delete(taskId);
		return false;
	}

	for (const task of data.tasks) {
		if (hasCycle(task.id)) {
			errors.push(`Circular dependency detected involving task: ${task.title}`);
			break;
		}
	}

	// Check for invalid date ranges
	for (const task of data.tasks) {
		if (task.endDate < task.startDate) {
			errors.push(`Task "${task.title}" has end date before start date`);
		}
	}

	return errors;
}
