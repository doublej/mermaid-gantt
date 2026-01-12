import { getContext, setContext } from 'svelte';
import type {
	GanttData,
	GanttConfig,
	Task,
	Section,
	ViewState,
	HistoryEntry,
	ClipboardTask
} from '$lib/types';
import { addDays, startOfDay } from '$lib/utils/date-utils';

const GANTT_CONTEXT = Symbol('gantt');

function generateId(): string {
	return Math.random().toString(36).slice(2, 9);
}

function defaultConfig(): GanttConfig {
	return {
		title: 'My Project',
		dateFormat: 'YYYY-MM-DD',
		axisFormat: '%Y-%m-%d',
		excludes: []
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
				dependencies: []
			}
		]
	};
}

export class GanttStore {
	// Reactive state using Svelte 5 runes
	data = $state<GanttData>(defaultData());

	view = $state<ViewState>({
		zoom: 1,
		scrollX: 0,
		scrollY: 0,
		selectedTaskId: null,
		focusedTaskId: null,
		editingTaskId: null
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

	allTasksFlat = $derived(
		this.data.sections.flatMap((s) =>
			this.data.tasks
				.filter((t) => t.sectionId === s.id)
				.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
		)
	);

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
		} else {
			this.historyIndex = this.history.length - 1;
		}
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
			dependencies: partial?.dependencies ?? []
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
			...task,
			title: `${task.title} (copy)`,
			dependencies: []
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

	// Zoom
	zoomIn(): void {
		this.view.zoom = Math.max(1, this.view.zoom / 2);
	}

	zoomOut(): void {
		this.view.zoom = Math.min(30, this.view.zoom * 2);
	}

	resetZoom(): void {
		this.view.zoom = 1;
	}

	// Config
	updateConfig(updates: Partial<GanttConfig>): void {
		this.data.config = { ...this.data.config, ...updates };
		this.saveHistory('Update config');
	}

	// Import/Export
	importData(data: GanttData): void {
		this.data = data;
		this.view = {
			zoom: 1,
			scrollX: 0,
			scrollY: 0,
			selectedTaskId: null,
			focusedTaskId: data.tasks[0]?.id ?? null,
			editingTaskId: null
		};
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
		this.view = {
			zoom: 1,
			scrollX: 0,
			scrollY: 0,
			selectedTaskId: null,
			focusedTaskId: this.data.tasks[0]?.id ?? null,
			editingTaskId: null
		};
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
