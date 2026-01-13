import { getContext, setContext } from 'svelte';
import type {
	GanttData,
	GanttConfig,
	Task,
	Section,
	Tag,
	ViewState,
	HistoryEntry,
	ClipboardTask,
	TaskStatus
} from '$lib/types';
import { addDays, addMonths, startOfDay, getDateRange, diffDays } from '$lib/utils/date-utils';
import { generateId } from '$lib/utils/id';

const GANTT_CONTEXT = Symbol('gantt');

export const ZOOM_LEVELS = [
	{ name: 'Day', dayWidth: 60 },
	{ name: 'Week', dayWidth: 20 },
	{ name: '2 Week', dayWidth: 10 },
	{ name: 'Month', dayWidth: 4 },
	{ name: 'Quarter', dayWidth: 1.5 }
] as const;

function defaultConfig(): GanttConfig {
	return {
		title: 'My Project',
		dateFormat: 'YYYY-MM-DD',
		axisFormat: '%Y-%m-%d',
		excludes: []
	};
}

function defaultViewState(focusedTaskId: string | null = null): ViewState {
	return {
		zoomLevel: 0,
		dayWidth: ZOOM_LEVELS[0].dayWidth, // Start with Day zoom level
		scrollX: 0,
		scrollY: 0,
		selectedTaskId: null,
		focusedTaskId,
		editingTaskId: null,
		dateRangeStart: null,
		dateRangeEnd: null,
		selectedTaskIds: []
	};
}

function defaultData(): GanttData {
	const today = startOfDay(new Date());
	const sectionId = generateId();

	return {
		config: defaultConfig(),
		sections: [{ id: sectionId, name: 'Tasks', order: 0 }],
		tasks: [
			{
				id: generateId(),
				title: 'Sample Task',
				sectionId,
				startDate: today,
				endDate: addDays(today, 6),
				status: 'active',
				dependencies: [],
				parentId: null,
				isMilestone: false,
				color: null,
				tags: [],
				estimatedHours: null,
				actualHours: null,
				estimatedCost: null,
				actualCost: null,
				notes: null
			}
		],
		tags: []
	};
}

export class GanttStore {
	// Reactive state using Svelte 5 runes
	data = $state<GanttData>(defaultData());

	view = $state<ViewState>(defaultViewState());

	// Keep currentZoom for backward compatibility
	currentZoom = $derived({
		name: 'Custom',
		dayWidth: Math.max(1, Math.min(100, this.view.dayWidth))
	});

	// History for undo/redo
	private history: HistoryEntry[] = [];
	private historyIndex = $state(-1);
	private maxHistorySize = 50;

	// Clipboard
	clipboard = $state<ClipboardTask | null>(null);

	// Derived state
	selectedTask = $derived(this.data.tasks.find((t) => t.id === this.view.selectedTaskId) ?? null);

	focusedTask = $derived(this.data.tasks.find((t) => t.id === this.view.focusedTaskId) ?? null);

	tasksBySection = $derived(
		this.data.sections.map((s) => ({
			section: s,
			tasks: this.data.tasks
				.filter((t) => t.sectionId === s.id)
				.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
		}))
	);

	// Derive from tasksBySection to avoid duplicate filtering/sorting
	allTasksFlat = $derived(this.tasksBySection.flatMap((ts) => ts.tasks));

	canUndo = $derived(this.historyIndex > 0);
	canRedo = $derived(this.historyIndex < this.history.length - 1);

	constructor(initialData?: GanttData) {
		if (initialData) {
			this.data = initialData;
		}
		this.saveHistory('Initial state');
	}

	// History management
	private saveHistory(description: string): void {
		// Remove any redo states
		if (this.historyIndex < this.history.length - 1) {
			this.history = this.history.slice(0, this.historyIndex + 1);
		}

		// Deep clone data
		const entry: HistoryEntry = {
			data: JSON.parse(JSON.stringify(this.data)),
			description,
			timestamp: Date.now()
		};

		// Restore Date objects
		entry.data.tasks = entry.data.tasks.map((t) => ({
			...t,
			startDate: new Date(t.startDate),
			endDate: new Date(t.endDate)
		}));

		this.history.push(entry);

		// Trim history if needed
		if (this.history.length > this.maxHistorySize) {
			this.history.shift();
		}
		// Always point to the latest entry
		this.historyIndex = this.history.length - 1;
	}

	undo(): void {
		if (!this.canUndo) return;
		this.historyIndex--;
		this.restoreFromHistory();
	}

	redo(): void {
		if (!this.canRedo) return;
		this.historyIndex++;
		this.restoreFromHistory();
	}

	private restoreFromHistory(): void {
		const entry = this.history[this.historyIndex];
		if (!entry) return;

		this.data = {
			...entry.data,
			tasks: entry.data.tasks.map((t) => ({
				...t,
				startDate: new Date(t.startDate),
				endDate: new Date(t.endDate)
			}))
		};
	}

	// Task operations
	addTask(partial?: Partial<Task>): Task {
		const today = startOfDay(new Date());
		const sectionId = partial?.sectionId ?? this.data.sections[0]?.id ?? null;

		const task: Task = {
			id: generateId(),
			title: partial?.title ?? 'New Task',
			sectionId,
			startDate: partial?.startDate ?? today,
			endDate: partial?.endDate ?? addDays(today, 6),
			status: partial?.status ?? 'active',
			dependencies: partial?.dependencies ?? [],
			parentId: partial?.parentId ?? null,
			isMilestone: partial?.isMilestone ?? false,
			color: partial?.color ?? null,
			tags: partial?.tags ?? [],
			estimatedHours: partial?.estimatedHours ?? null,
			actualHours: partial?.actualHours ?? null,
			estimatedCost: partial?.estimatedCost ?? null,
			actualCost: partial?.actualCost ?? null,
			notes: partial?.notes ?? null
		};

		this.data.tasks = [...this.data.tasks, task];
		this.saveHistory(`Add task: ${task.title}`);

		// Select and focus the new task
		this.view.selectedTaskId = task.id;
		this.view.focusedTaskId = task.id;

		return task;
	}

	updateTask(id: string, updates: Partial<Task>): void {
		const idx = this.data.tasks.findIndex((t) => t.id === id);
		if (idx === -1) return;

		this.data.tasks = this.data.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
		this.saveHistory(`Update task: ${this.data.tasks[idx].title}`);
	}

	deleteTask(id: string): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return;

		// Reparent children to the deleted task's parent
		this.data.tasks = this.data.tasks.map((t) =>
			t.parentId === id ? { ...t, parentId: task.parentId } : t
		);

		// Remove task and any dependencies pointing to it
		this.data.tasks = this.data.tasks
			.filter((t) => t.id !== id)
			.map((t) => ({
				...t,
				dependencies: t.dependencies.filter((d) => d !== id)
			}));

		this.saveHistory(`Delete task: ${task.title}`);

		// Clear selection if deleted
		if (this.view.selectedTaskId === id) {
			this.view.selectedTaskId = null;
		}
		if (this.view.focusedTaskId === id) {
			this.focusNextTask();
		}
	}

	duplicateTask(id: string): Task | null {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return null;

		return this.addTask({
			title: `${task.title} (copy)`,
			sectionId: task.sectionId,
			startDate: task.startDate,
			endDate: task.endDate,
			status: task.status,
			dependencies: [], // Don't copy dependencies
			parentId: task.parentId, // Keep same parent
			isMilestone: task.isMilestone,
			color: task.color,
			tags: [...task.tags], // Copy tags
			estimatedHours: task.estimatedHours,
			actualHours: null, // Reset actual tracking
			estimatedCost: task.estimatedCost,
			actualCost: null, // Reset actual tracking
			notes: task.notes
		});
	}

	// Clipboard operations
	copyTask(id: string): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id: _id, ...taskWithoutId } = task;
		this.clipboard = {
			task: taskWithoutId,
			timestamp: Date.now()
		};
	}

	pasteTask(): Task | null {
		if (!this.clipboard) return null;

		const today = startOfDay(new Date());
		return this.addTask({
			...this.clipboard.task,
			title: `${this.clipboard.task.title} (pasted)`,
			startDate: today,
			endDate: addDays(today, this.getDuration(this.clipboard.task)),
			dependencies: []
		});
	}

	private getDuration(task: { startDate: Date; endDate: Date }): number {
		return Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
	}

	// Section operations
	addSection(name: string): Section {
		const section: Section = {
			id: generateId(),
			name,
			order: this.data.sections.length
		};

		this.data.sections = [...this.data.sections, section];
		this.saveHistory(`Add section: ${name}`);
		return section;
	}

	updateSection(id: string, updates: Partial<Section>): void {
		this.data.sections = this.data.sections.map((s) => (s.id === id ? { ...s, ...updates } : s));
		this.saveHistory('Update section');
	}

	deleteSection(id: string): void {
		const section = this.data.sections.find((s) => s.id === id);
		if (!section) return;

		// Move tasks to first remaining section or null
		const remainingSections = this.data.sections.filter((s) => s.id !== id);
		const targetSectionId = remainingSections[0]?.id ?? null;

		this.data.tasks = this.data.tasks.map((t) =>
			t.sectionId === id ? { ...t, sectionId: targetSectionId } : t
		);
		this.data.sections = remainingSections;
		this.saveHistory(`Delete section: ${section.name}`);
	}

	// Navigation
	focusNextTask(): void {
		const tasks = this.allTasksFlat;
		if (tasks.length === 0) {
			this.view.focusedTaskId = null;
			return;
		}

		const currentIdx = tasks.findIndex((t) => t.id === this.view.focusedTaskId);
		const nextIdx = currentIdx === -1 ? 0 : Math.min(currentIdx + 1, tasks.length - 1);
		this.view.focusedTaskId = tasks[nextIdx].id;
	}

	focusPreviousTask(): void {
		const tasks = this.allTasksFlat;
		if (tasks.length === 0) {
			this.view.focusedTaskId = null;
			return;
		}

		const currentIdx = tasks.findIndex((t) => t.id === this.view.focusedTaskId);
		const prevIdx = currentIdx === -1 ? 0 : Math.max(currentIdx - 1, 0);
		this.view.focusedTaskId = tasks[prevIdx].id;
	}

	focusFirstTask(): void {
		const tasks = this.allTasksFlat;
		this.view.focusedTaskId = tasks[0]?.id ?? null;
	}

	focusLastTask(): void {
		const tasks = this.allTasksFlat;
		this.view.focusedTaskId = tasks[tasks.length - 1]?.id ?? null;
	}

	selectFocusedTask(): void {
		if (this.view.focusedTaskId) {
			this.view.selectedTaskId = this.view.focusedTaskId;
		}
	}

	// Timeline operations
	moveTaskStart(id: string, days: number): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return;

		const newStart = addDays(task.startDate, days);
		if (newStart <= task.endDate) {
			this.updateTask(id, { startDate: newStart });
		}
	}

	moveTaskEnd(id: string, days: number): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return;

		const newEnd = addDays(task.endDate, days);
		if (newEnd >= task.startDate) {
			this.updateTask(id, { endDate: newEnd });
		}
	}

	moveTask(id: string, days: number): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return;

		this.updateTask(id, {
			startDate: addDays(task.startDate, days),
			endDate: addDays(task.endDate, days)
		});
	}

	// Subtask hierarchy operations
	getTaskLevel(id: string): number {
		let level = 0;
		let task = this.data.tasks.find((t) => t.id === id);
		while (task?.parentId) {
			level++;
			task = this.data.tasks.find((t) => t.id === task!.parentId);
		}
		return level;
	}

	getChildTasks(id: string): Task[] {
		return this.data.tasks.filter((t) => t.parentId === id);
	}

	getDescendants(id: string): Task[] {
		const children = this.getChildTasks(id);
		return children.flatMap((c) => [c, ...this.getDescendants(c.id)]);
	}

	indentTask(id: string): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return;

		// Find previous sibling (same section, same parent, earlier in list)
		const siblings = this.data.tasks.filter(
			(t) => t.sectionId === task.sectionId && t.parentId === task.parentId && t.id !== id
		);
		const taskIndex = this.data.tasks.findIndex((t) => t.id === id);
		const prevSibling = siblings
			.filter((s) => this.data.tasks.findIndex((t) => t.id === s.id) < taskIndex)
			.pop();

		if (prevSibling) {
			this.updateTask(id, { parentId: prevSibling.id });
		}
	}

	outdentTask(id: string): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task || !task.parentId) return;

		const parent = this.data.tasks.find((t) => t.id === task.parentId);
		this.updateTask(id, { parentId: parent?.parentId ?? null });
	}

	toggleMilestone(id: string): void {
		const task = this.data.tasks.find((t) => t.id === id);
		if (!task) return;

		const isMilestone = !task.isMilestone;
		const updates: Partial<Task> = { isMilestone };
		// If becoming milestone, set endDate = startDate
		if (isMilestone) {
			updates.endDate = task.startDate;
		}
		this.updateTask(id, updates);
	}

	addSubtask(parentId: string): Task {
		const parent = this.data.tasks.find((t) => t.id === parentId);
		return this.addTask({
			parentId,
			sectionId: parent?.sectionId ?? null,
			title: 'New Subtask'
		});
	}

	// Tag operations
	addTag(name: string, color?: string): Tag {
		const tag: Tag = { id: generateId(), name, color };
		this.data.tags = [...this.data.tags, tag];
		this.saveHistory(`Add tag: ${name}`);
		return tag;
	}

	updateTag(id: string, updates: Partial<Tag>): void {
		this.data.tags = this.data.tags.map((t) => (t.id === id ? { ...t, ...updates } : t));
		this.saveHistory('Update tag');
	}

	deleteTag(id: string): void {
		// Remove tag from all tasks
		this.data.tasks = this.data.tasks.map((t) => ({
			...t,
			tags: t.tags.filter((tagId) => tagId !== id)
		}));
		this.data.tags = this.data.tags.filter((t) => t.id !== id);
		this.saveHistory('Delete tag');
	}

	// Multi-select operations
	selectTask(id: string, addToSelection: boolean = false): void {
		if (addToSelection) {
			this.view.selectedTaskIds = [...new Set([...this.view.selectedTaskIds, id])];
		} else {
			this.view.selectedTaskIds = [id];
		}
		this.view.selectedTaskId = id;
	}

	selectTaskRange(fromId: string, toId: string): void {
		const tasks = this.allTasksFlat;
		const fromIdx = tasks.findIndex((t) => t.id === fromId);
		const toIdx = tasks.findIndex((t) => t.id === toId);

		if (fromIdx !== -1 && toIdx !== -1) {
			const start = Math.min(fromIdx, toIdx);
			const end = Math.max(fromIdx, toIdx);
			this.view.selectedTaskIds = tasks.slice(start, end + 1).map((t) => t.id);
			this.view.selectedTaskId = toId;
		}
	}

	selectAll(): void {
		this.view.selectedTaskIds = this.allTasksFlat.map((t) => t.id);
		this.view.selectedTaskId = this.allTasksFlat[0]?.id ?? null;
	}

	clearSelection(): void {
		this.view.selectedTaskIds = [];
		this.view.selectedTaskId = null;
	}

	bulkDelete(): void {
		const idsToDelete = new Set(this.view.selectedTaskIds);

		// Reparent children
		this.data.tasks = this.data.tasks.map((t) => {
			if (t.parentId && idsToDelete.has(t.parentId)) {
				return { ...t, parentId: null };
			}
			return t;
		});

		// Remove tasks and dependencies
		this.data.tasks = this.data.tasks
			.filter((t) => !idsToDelete.has(t.id))
			.map((t) => ({
				...t,
				dependencies: t.dependencies.filter((d) => !idsToDelete.has(d))
			}));

		this.clearSelection();
		this.saveHistory(`Delete ${idsToDelete.size} task(s)`);
	}

	bulkChangeColor(color: string | null): void {
		this.data.tasks = this.data.tasks.map((t) =>
			this.view.selectedTaskIds.includes(t.id) ? { ...t, color } : t
		);
		this.saveHistory('Change color for selected tasks');
	}

	bulkChangeSection(sectionId: string | null): void {
		this.data.tasks = this.data.tasks.map((t) =>
			this.view.selectedTaskIds.includes(t.id) ? { ...t, sectionId } : t
		);
		this.saveHistory('Move selected tasks to section');
	}

	bulkChangeStatus(status: TaskStatus): void {
		this.data.tasks = this.data.tasks.map((t) =>
			this.view.selectedTaskIds.includes(t.id) ? { ...t, status } : t
		);
		this.saveHistory('Change status for selected tasks');
	}

	// Zoom - discrete levels for buttons
	zoomIn(): void {
		this.view.zoomLevel = Math.max(0, this.view.zoomLevel - 1);
		this.view.dayWidth = ZOOM_LEVELS[this.view.zoomLevel].dayWidth;
	}

	zoomOut(): void {
		this.view.zoomLevel = Math.min(ZOOM_LEVELS.length - 1, this.view.zoomLevel + 1);
		this.view.dayWidth = ZOOM_LEVELS[this.view.zoomLevel].dayWidth;
	}

	resetZoom(): void {
		this.view.zoomLevel = 0;
		this.view.dayWidth = ZOOM_LEVELS[0].dayWidth;
	}

	// Smooth zoom - continuous control
	setDayWidth(width: number): void {
		this.view.dayWidth = Math.max(1, Math.min(100, width));
		// Find nearest zoom level for UI display
		const closest = ZOOM_LEVELS.reduce((prev, curr, i) =>
			Math.abs(curr.dayWidth - this.view.dayWidth) < Math.abs(ZOOM_LEVELS[prev].dayWidth - this.view.dayWidth) ? i : prev
		, 0);
		this.view.zoomLevel = closest;
	}

	// Fit all tasks in viewport
	fitAll(viewportWidth: number): void {
		if (this.data.tasks.length === 0) {
			this.resetZoom();
			return;
		}

		const taskRange = getDateRange(this.data.tasks);
		const totalDays = diffDays(taskRange.start, taskRange.end) + 1;
		const padding = 20; // pixels on each side
		const availableWidth = viewportWidth - padding * 2;

		if (availableWidth > 0 && totalDays > 0) {
			const calculatedDayWidth = availableWidth / totalDays;
			this.setDayWidth(calculatedDayWidth);
		}
	}

	// Date range
	extendRangeStart(months: number): void {
		const current = this.view.dateRangeStart ?? startOfDay(new Date());
		this.view.dateRangeStart = addMonths(current, -months);
	}

	extendRangeEnd(months: number): void {
		const current = this.view.dateRangeEnd ?? startOfDay(new Date());
		this.view.dateRangeEnd = addMonths(current, months);
	}

	resetDateRange(): void {
		this.view.dateRangeStart = null;
		this.view.dateRangeEnd = null;
	}

	// Config
	updateConfig(updates: Partial<GanttConfig>): void {
		this.data.config = { ...this.data.config, ...updates };
		this.saveHistory('Update config');
	}

	// Import/Export
	importData(data: GanttData): void {
		this.data = data;
		this.view = defaultViewState(data.tasks[0]?.id ?? null);
		this.saveHistory('Import data');
	}

	exportData(): GanttData {
		return JSON.parse(JSON.stringify(this.data));
	}

	// Reset
	reset(): void {
		this.data = defaultData();
		this.history = [];
		this.historyIndex = -1;
		this.view = defaultViewState(this.data.tasks[0]?.id ?? null);
		this.saveHistory('Reset');
	}
}

// Context helpers
export function createGanttStore(initialData?: GanttData): GanttStore {
	return new GanttStore(initialData);
}

export function setGanttContext(store: GanttStore): void {
	setContext(GANTT_CONTEXT, store);
}

export function getGanttContext(): GanttStore {
	const store = getContext<GanttStore>(GANTT_CONTEXT);
	if (!store) {
		throw new Error('GanttStore not found in context. Did you forget to call setGanttContext?');
	}
	return store;
}
