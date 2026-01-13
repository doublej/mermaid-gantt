export interface KeyboardLesson {
	id: string;
	category: 'navigation' | 'task' | 'timeline' | 'global';
	keys: string[]; // e.g., ['Cmd', 'N'] or ['ArrowDown']
	action: string; // Action name (e.g., 'newTask')
	description: string; // Human-readable description (e.g., 'Create a new task')
	instruction: string; // What to do (e.g., 'Press Cmd+N to create a new task')
}

export const KEYBOARD_LESSONS: KeyboardLesson[] = [
	// Navigation
	{
		id: 'nav-down',
		category: 'navigation',
		keys: ['ArrowDown'],
		action: 'focusNext',
		description: 'Focus next task',
		instruction: 'Press the Down arrow key to move to the next task'
	},
	{
		id: 'nav-up',
		category: 'navigation',
		keys: ['ArrowUp'],
		action: 'focusPrev',
		description: 'Focus previous task',
		instruction: 'Press the Up arrow key to move to the previous task'
	},
	{
		id: 'nav-home',
		category: 'navigation',
		keys: ['Home'],
		action: 'focusFirst',
		description: 'Focus first task',
		instruction: 'Press Home to jump to the first task'
	},
	{
		id: 'nav-end',
		category: 'navigation',
		keys: ['End'],
		action: 'focusLast',
		description: 'Focus last task',
		instruction: 'Press End to jump to the last task'
	},
	{
		id: 'nav-pageup',
		category: 'navigation',
		keys: ['PageUp'],
		action: 'scrollUp',
		description: 'Scroll timeline up',
		instruction: 'Press PageUp to scroll up through tasks'
	},
	{
		id: 'nav-pagedown',
		category: 'navigation',
		keys: ['PageDown'],
		action: 'scrollDown',
		description: 'Scroll timeline down',
		instruction: 'Press PageDown to scroll down through tasks'
	},

	// Tasks
	{
		id: 'task-new',
		category: 'task',
		keys: ['Ctrl', 'N'],
		action: 'newTask',
		description: 'Create new task',
		instruction: 'Press Ctrl+N to create a new task'
	},
	{
		id: 'task-edit',
		category: 'task',
		keys: ['Enter'],
		action: 'editTask',
		description: 'Edit selected task',
		instruction: 'Press Enter to edit the selected task'
	},
	{
		id: 'task-delete',
		category: 'task',
		keys: ['Delete'],
		action: 'deleteTask',
		description: 'Delete task',
		instruction: 'Press Delete to remove the selected task'
	},
	{
		id: 'task-copy',
		category: 'task',
		keys: ['Ctrl', 'C'],
		action: 'copyTask',
		description: 'Copy task',
		instruction: 'Press Ctrl+C to copy the selected task'
	},
	{
		id: 'task-paste',
		category: 'task',
		keys: ['Ctrl', 'V'],
		action: 'pasteTask',
		description: 'Paste task',
		instruction: 'Press Ctrl+V to paste a copied task'
	},
	{
		id: 'task-duplicate',
		category: 'task',
		keys: ['Ctrl', 'D'],
		action: 'duplicateTask',
		description: 'Duplicate task',
		instruction: 'Press Ctrl+D to duplicate the selected task'
	},
	{
		id: 'task-rename',
		category: 'task',
		keys: ['F2'],
		action: 'renameTask',
		description: 'Rename task inline',
		instruction: 'Press F2 to rename the selected task'
	},

	// Timeline
	{
		id: 'timeline-zoomin',
		category: 'timeline',
		keys: ['Ctrl', '+'],
		action: 'zoomIn',
		description: 'Zoom in',
		instruction: 'Press Ctrl+Plus to zoom in on the timeline'
	},
	{
		id: 'timeline-zoomout',
		category: 'timeline',
		keys: ['Ctrl', '-'],
		action: 'zoomOut',
		description: 'Zoom out',
		instruction: 'Press Ctrl+Minus to zoom out on the timeline'
	},
	{
		id: 'timeline-reset',
		category: 'timeline',
		keys: ['Ctrl', '0'],
		action: 'resetZoom',
		description: 'Reset zoom',
		instruction: 'Press Ctrl+0 to reset the zoom level'
	},
	{
		id: 'timeline-move-start-left',
		category: 'timeline',
		keys: ['Shift', 'ArrowLeft'],
		action: 'moveStartLeft',
		description: 'Move task start -1 day',
		instruction: 'Press Shift+Left arrow to move task start earlier'
	},
	{
		id: 'timeline-move-start-right',
		category: 'timeline',
		keys: ['Shift', 'ArrowRight'],
		action: 'moveStartRight',
		description: 'Move task start +1 day',
		instruction: 'Press Shift+Right arrow to move task start later'
	},

	// Global
	{
		id: 'global-command',
		category: 'global',
		keys: ['Ctrl', 'K'],
		action: 'openCommandPalette',
		description: 'Open command palette',
		instruction: 'Press Ctrl+K to open the command palette'
	},
	{
		id: 'global-help',
		category: 'global',
		keys: ['?'],
		action: 'openHelp',
		description: 'Open keyboard shortcuts',
		instruction: 'Press ? to view all keyboard shortcuts'
	},
	{
		id: 'global-undo',
		category: 'global',
		keys: ['Ctrl', 'Z'],
		action: 'undo',
		description: 'Undo',
		instruction: 'Press Ctrl+Z to undo your last action'
	},
	{
		id: 'global-redo',
		category: 'global',
		keys: ['Ctrl', 'Shift', 'Z'],
		action: 'redo',
		description: 'Redo',
		instruction: 'Press Ctrl+Shift+Z to redo your last action'
	}
];

// Group lessons by category
export function getLessonsByCategory(category: KeyboardLesson['category']): KeyboardLesson[] {
	return KEYBOARD_LESSONS.filter((lesson) => lesson.category === category);
}

// Get all categories
export function getCategories(): KeyboardLesson['category'][] {
	const categories = new Set<KeyboardLesson['category']>();
	KEYBOARD_LESSONS.forEach((lesson) => categories.add(lesson.category));
	return Array.from(categories);
}

// Get lesson by ID
export function getLesson(id: string): KeyboardLesson | null {
	return KEYBOARD_LESSONS.find((lesson) => lesson.id === id) ?? null;
}
