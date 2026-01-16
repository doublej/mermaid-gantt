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
	// Hierarchy
	parentId: string | null;
	// Visual
	isMilestone: boolean;
	color: string | null; // hex color or preset name
	// Tracking
	tags: string[]; // tag IDs
	estimatedHours: number | null;
	actualHours: number | null;
	estimatedCost: number | null;
	actualCost: number | null;
	notes: string | null;
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

export interface Tag {
	id: string;
	name: string;
	color?: string; // hex color
}

export interface GanttData {
	config: GanttConfig;
	sections: Section[];
	tasks: Task[];
	tags: Tag[];
}

export interface ViewState {
	zoomLevel: number; // index into ZOOM_LEVELS array (kept for backward compatibility)
	dayWidth: number; // continuous zoom level in pixels/day (1-100)
	scrollX: number;
	scrollY: number;
	selectedTaskId: string | null;
	focusedTaskId: string | null;
	editingTaskId: string | null;
	dateRangeStart: Date | null; // null = auto-calculate from tasks
	dateRangeEnd: Date | null; // null = auto-calculate from tasks
	selectedTaskIds: string[]; // multi-select support
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
export type TutorialCleanup = 'closeModals' | 'closeEditor';
export type TutorialMode = 'quick' | 'extended' | 'complete';

export interface TutorialStep {
	id: string;
	title: string;
	description: string;
	action: string; // Action user must perform to advance
	targetSelector?: string; // CSS selector for highlighting
	keys: string[]; // Keys to display
	cleanup?: TutorialCleanup; // Reset UI state after step completes
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
	tags: Tag[];
}

export interface SerializedTask {
	id: string;
	title: string;
	sectionId: string | null;
	startDate: string; // ISO string
	endDate: string; // ISO string
	status: TaskStatus;
	dependencies: string[];
	// Hierarchy
	parentId: string | null;
	// Visual
	isMilestone: boolean;
	color: string | null;
	// Tracking
	tags: string[];
	estimatedHours: number | null;
	actualHours: number | null;
	estimatedCost: number | null;
	actualCost: number | null;
	notes: string | null;
}

export interface ProjectData {
	meta: ProjectMeta;
	current: SerializedGanttData;
	versions: ProjectVersion[];
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

// Context menu types
export interface MenuItem {
	label?: string;
	icon?: import('svelte').Component;
	iconColor?: string; // hex color for icon
	action?: () => void;
	disabled?: boolean;
	divider?: boolean;
	submenu?: MenuItem[];
}
