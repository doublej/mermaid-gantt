// WebMCP tools: lets in-browser AI agents read and edit the open chart.
// API shape follows the W3C WebML CG draft (2026-09-17): document.modelContext.registerTool,
// unregistration via AbortSignal, execute's return value is JSON-serialized for the agent.
// Tool input comes from an agent, so everything is validated here before touching the store.
import type { GanttStore } from '$lib/stores/gantt-store.svelte';
import type { Task, TaskStatus } from '$lib/types';
import { formatDate, parseDate } from './date-utils';
import { exportToMermaid } from './mermaid-exporter';
import { parseMermaidGantt, validateGanttData } from './mermaid-parser';

type Input = Record<string, unknown>;

interface ModelContextTool {
	name: string;
	description: string;
	inputSchema: object;
	annotations?: { readOnlyHint?: boolean };
	execute: (input: Input) => unknown;
}

interface ModelContext {
	registerTool(tool: ModelContextTool, options: { signal: AbortSignal }): Promise<void>;
}

const ISO = 'YYYY-MM-DD';
const STATUSES = ['active', 'done', 'crit', 'milestone', 'none'];
const MAX_NAME = 200;
const MAX_MERMAID = 200_000;

const DATE = { type: 'string', format: 'date', description: 'YYYY-MM-DD' };
const TASK_FIELDS = {
	title: { type: 'string', maxLength: MAX_NAME, description: 'Task name. No ":" or line breaks.' },
	startDate: { ...DATE, description: 'First day of the task, YYYY-MM-DD.' },
	endDate: { ...DATE, description: 'Last day of the task (inclusive), YYYY-MM-DD. Ignored for milestones.' },
	status: {
		type: 'string',
		enum: STATUSES,
		description: 'active, done, crit (critical path), milestone (single-day marker) or none.'
	},
	sectionId: { type: 'string', description: 'Id of the section to place the task in (from get_chart).' },
	dependencies: {
		type: 'array',
		items: { type: 'string' },
		description:
			'Ids of tasks this one comes after. Drawn as arrows; dates are not shifted automatically, so set startDate after the dependency ends.'
	}
};

function serializeTask(t: Task) {
	return {
		id: t.id,
		title: t.title,
		sectionId: t.sectionId,
		startDate: formatDate(t.startDate, ISO),
		endDate: formatDate(t.endDate, ISO),
		status: t.isMilestone ? 'milestone' : (t.status ?? 'none'),
		dependencies: t.dependencies
	};
}

function describeChart(gantt: GanttStore) {
	return {
		title: gantt.data.config.title,
		mermaid: exportToMermaid(gantt.data),
		sections: gantt.data.sections.map(({ id, name }) => ({ id, name })),
		tasks: gantt.data.tasks.map(serializeTask)
	};
}

function isValidName(value: unknown, forbidden: RegExp): value is string {
	return typeof value === 'string' && value.trim() !== '' && value.length <= MAX_NAME && !forbidden.test(value);
}

// Returns the validated task fields, or an error message the agent can act on.
function readTaskFields(gantt: GanttStore, input: Input): Partial<Task> | string {
	const fields: Partial<Task> = {};
	const { title, startDate, endDate, status, sectionId, dependencies } = input;

	if (title !== undefined) {
		if (!isValidName(title, /[:\r\n]/)) return `title must be 1-${MAX_NAME} characters without ":" or line breaks`;
		fields.title = title.trim();
	}
	for (const [key, value] of [['startDate', startDate], ['endDate', endDate]] as const) {
		if (value === undefined) continue;
		const date = typeof value === 'string' ? parseDate(value, ISO) : null;
		// Round-trip rejects malformed input and overflow dates like 2026-02-30.
		if (!date || formatDate(date, ISO) !== value) return `${key} must be a real date in YYYY-MM-DD format`;
		fields[key] = date;
	}
	if (status !== undefined) {
		if (typeof status !== 'string' || !STATUSES.includes(status)) return `status must be one of: ${STATUSES.join(', ')}`;
		fields.status = status === 'none' ? null : (status as TaskStatus);
		fields.isMilestone = status === 'milestone';
	}
	if (sectionId !== undefined) {
		if (!gantt.data.sections.some((s) => s.id === sectionId)) return `Unknown sectionId. Call get_chart for valid ids.`;
		fields.sectionId = sectionId as string;
	}
	if (dependencies !== undefined) {
		const ids = new Set(gantt.data.tasks.map((t) => t.id));
		if (!Array.isArray(dependencies) || !dependencies.every((d) => ids.has(d))) {
			return 'dependencies must be an array of existing task ids. Call get_chart for valid ids.';
		}
		fields.dependencies = [...new Set(dependencies as string[])];
	}
	return fields;
}

function buildTools(gantt: GanttStore): ModelContextTool[] {
	return [
		{
			name: 'get_chart',
			description:
				'Read the Gantt chart open in the editor: title, Mermaid gantt source, and sections and tasks as JSON with their ids. Call this first; the editing tools need these ids. Dates are YYYY-MM-DD and endDate is inclusive.',
			inputSchema: { type: 'object', properties: {} },
			annotations: { readOnlyHint: true },
			execute: () => describeChart(gantt)
		},
		{
			name: 'import_mermaid',
			description:
				'Replace the whole chart with Mermaid gantt syntax. Best for building a chart from scratch or a large rewrite; use the task tools for small edits. The user can undo it. Example:\ngantt\n    title Launch\n    dateFormat YYYY-MM-DD\n    section Build\n    Design :done, d1, 2026-10-01, 5d\n    Develop :active, d2, after d1, 10d\n    Release :milestone, m1, 2026-10-20, 0d',
			inputSchema: {
				type: 'object',
				properties: { mermaid: { type: 'string', maxLength: MAX_MERMAID, description: 'Mermaid gantt source.' } },
				required: ['mermaid']
			},
			execute: ({ mermaid }) => {
				if (typeof mermaid !== 'string' || mermaid.length > MAX_MERMAID) {
					return { error: `mermaid must be a string of at most ${MAX_MERMAID} characters` };
				}
				const data = parseMermaidGantt(mermaid);
				if (data.tasks.length === 0) {
					return { error: 'No tasks found. Expected task lines like "Design :done, d1, 2026-10-01, 5d".' };
				}
				const errors = validateGanttData(data);
				if (errors.length > 0) return { error: errors.join('; ') };
				gantt.importData(data);
				return describeChart(gantt);
			}
		},
		{
			name: 'add_task',
			description:
				'Add one task to the chart. Returns the new task with its id. Without sectionId the task goes into the first section.',
			inputSchema: { type: 'object', properties: TASK_FIELDS, required: ['title', 'startDate'] },
			execute: (input) => {
				if (input.title === undefined || input.startDate === undefined) return { error: 'title and startDate are required' };
				const fields = readTaskFields(gantt, input);
				if (typeof fields === 'string') return { error: fields };
				const startDate = fields.startDate!;
				const endDate = fields.isMilestone ? startDate : (fields.endDate ?? startDate);
				if (endDate < startDate) return { error: 'endDate must not be before startDate' };
				return serializeTask(gantt.addTask({ ...fields, endDate }));
			}
		},
		{
			name: 'update_task',
			description:
				'Change one task. Pass its id and only the fields to change; dependencies replaces the whole list. Returns the updated task.',
			inputSchema: {
				type: 'object',
				properties: { id: { type: 'string', description: 'Task id from get_chart.' }, ...TASK_FIELDS },
				required: ['id']
			},
			execute: ({ id, ...rest }) => {
				const task = gantt.data.tasks.find((t) => t.id === id);
				if (!task) return { error: 'Unknown task id. Call get_chart for valid ids.' };
				const fields = readTaskFields(gantt, rest);
				if (typeof fields === 'string') return { error: fields };
				if (Object.keys(fields).length === 0) return { error: 'Pass at least one field to change.' };
				const updated = { ...task, ...fields };
				if (updated.isMilestone) updated.endDate = updated.startDate;
				const errors = validateGanttData({
					...gantt.data,
					tasks: gantt.data.tasks.map((t) => (t.id === task.id ? updated : t))
				});
				if (errors.length > 0) return { error: errors.join('; ') };
				gantt.updateTask(task.id, { ...fields, endDate: updated.endDate });
				return serializeTask(updated);
			}
		},
		{
			name: 'delete_task',
			description:
				'Delete one task by id. Links from other tasks to it are removed and its subtasks move up a level. The user can undo it.',
			inputSchema: {
				type: 'object',
				properties: { id: { type: 'string', description: 'Task id from get_chart.' } },
				required: ['id']
			},
			execute: ({ id }) => {
				if (!gantt.data.tasks.some((t) => t.id === id)) return { error: 'Unknown task id. Call get_chart for valid ids.' };
				gantt.deleteTask(id as string);
				return { deleted: id };
			}
		},
		{
			name: 'add_section',
			description: 'Add a section (a named group of tasks) at the bottom of the chart. Returns its id for use in add_task.',
			inputSchema: {
				type: 'object',
				properties: { name: { type: 'string', maxLength: MAX_NAME, description: 'Section name. No line breaks.' } },
				required: ['name']
			},
			execute: ({ name }) => {
				if (!isValidName(name, /[\r\n]/)) return { error: `name must be 1-${MAX_NAME} characters without line breaks` };
				const { id } = gantt.addSection(name.trim());
				return { id, name: name.trim() };
			}
		}
	];
}

/** Registers the editor's WebMCP tools when the browser supports it. Returns the cleanup. */
export function registerWebMcpTools(gantt: GanttStore): () => void {
	const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
	if (!modelContext) return () => {};

	const controller = new AbortController();
	for (const tool of buildTools(gantt)) {
		modelContext.registerTool(tool, { signal: controller.signal });
	}
	return () => controller.abort();
}
