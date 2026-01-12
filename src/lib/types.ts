// Task status types matching Mermaid Gantt syntax
export type TaskStatus = 'active' | 'done' | 'crit' | 'milestone' | null;

export interface Task {
	id: string;
	title: string;
	sectionId: string | null;
	startDate: Date;
	endDate: Date;
	status: TaskStatus;
	dependencies: string[]; // task IDs this depends on
}

export interface Section {
	id: string;
	name: string;
	order: number;
}

export interface GanttConfig {
	title: string;
	dateFormat: string; // e.g., 'YYYY-MM-DD'
	axisFormat: string; // e.g., '%Y-%m-%d'
	excludes: string[]; // e.g., ['weekends', '2024-01-15']
}

export interface GanttData {
	config: GanttConfig;
	sections: Section[];
	tasks: Task[];
}

export interface ViewState {
	zoomLevel: number; // index into ZOOM_LEVELS array
	scrollX: number;
	scrollY: number;
	selectedTaskId: string | null;
	focusedTaskId: string | null;
	editingTaskId: string | null;
	dateRangeStart: Date | null; // null = auto-calculate from tasks
	dateRangeEnd: Date | null; // null = auto-calculate from tasks
}

// Keyboard system types
export type KeyModifier = 'ctrl' | 'shift' | 'alt' | 'meta';

export interface KeyBinding {
	key: string;
	modifiers: KeyModifier[];
	action: string;
	description: string;
	category: KeyCategory;
}

export type KeyCategory = 'navigation' | 'task' | 'timeline' | 'global';

// Onboarding types
export interface TutorialStep {
	id: string;
	title: string;
	description: string;
	action: string; // Action user must perform to advance
	targetSelector?: string; // CSS selector for highlighting
	keys: string[]; // Keys to display
}

// Command palette types
export interface Command {
	id: string;
	title: string;
	description?: string;
	keys?: string[];
	action: () => void;
	category: string;
}

// History for undo/redo
export interface HistoryEntry {
	data: GanttData;
	description: string;
	timestamp: number;
}

// Clipboard for copy/paste
export interface ClipboardTask {
	task: Omit<Task, 'id'>;
	timestamp: number;
}

// Persistence types
export interface ProjectMeta {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
}

export interface ProjectVersion {
	id: string;
	name: string | null; // null = auto-snapshot, string = manual
	timestamp: number;
	data: SerializedGanttData;
}

export interface SerializedGanttData {
	config: GanttConfig;
	sections: Section[];
	tasks: SerializedTask[];
}

export interface SerializedTask {
	id: string;
	title: string;
	sectionId: string | null;
	startDate: string; // ISO string
	endDate: string; // ISO string
	status: TaskStatus;
	dependencies: string[];
}

export interface ProjectData {
	meta: ProjectMeta;
	current: SerializedGanttData;
	versions: ProjectVersion[];
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';
