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
	zoom: number; // 1 = day, 7 = week, 30 = month
	scrollX: number;
	scrollY: number;
	selectedTaskId: string | null;
	focusedTaskId: string | null;
	editingTaskId: string | null;
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
