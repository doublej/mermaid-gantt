import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type {
	GanttData,
	ProjectMeta,
	ProjectData,
	ProjectVersion,
	SaveStatus,
	SerializedGanttData,
	SerializedTask,
	Section
} from '$lib/types';
import type { GanttStore } from './gantt-store.svelte';

const PERSISTENCE_CONTEXT = Symbol('persistence');
const STORAGE_PREFIX = 'gantt:';
const MAX_AUTO_VERSIONS = 60; // Keep ~1 hour of history at 1/min
const MAX_MANUAL_VERSIONS = 10;
const AUTO_SNAPSHOT_INTERVAL = 60 * 1000; // 1 minute

function generateId(): string {
	return Math.random().toString(36).slice(2, 9);
}

function serializeData(data: GanttData): SerializedGanttData {
	return {
		config: data.config,
		sections: data.sections,
		tasks: data.tasks.map((t) => ({
			...t,
			startDate: t.startDate.toISOString(),
			endDate: t.endDate.toISOString()
		}))
	};
}

function deserializeData(data: SerializedGanttData): GanttData {
	return {
		config: data.config,
		sections: data.sections,
		tasks: data.tasks.map((t) => ({
			...t,
			startDate: new Date(t.startDate),
			endDate: new Date(t.endDate)
		}))
	};
}

export class PersistenceStore {
	// Reactive state
	projects = $state<ProjectMeta[]>([]);
	currentProjectId = $state<string | null>(null);
	saveStatus = $state<SaveStatus>('saved');
	isHistoryOpen = $state(false);

	// Derived
	currentProject = $derived(this.projects.find((p) => p.id === this.currentProjectId) ?? null);
	currentVersions = $derived(this.loadVersions());

	// Internal
	private saveTimeout: ReturnType<typeof setTimeout> | null = null;
	private ganttStore: GanttStore | null = null;
	private lastAutoSnapshot = 0;
	private dataHash = '';

	constructor() {
		// Only load from localStorage in browser
		if (browser) {
			this.loadProjectsList();
			if (this.projects.length === 0) {
				this.createDemoProjects();
			}
		}
	}

	private createDemoProjects(): void {
		// Demo 1: Software Release
		const release = this.createDemoProject('Software Release v2.0', [
			{ name: 'Planning', tasks: [
				{ title: 'Requirements gathering', days: 5, status: 'done' },
				{ title: 'Technical design', days: 7, status: 'done' },
				{ title: 'Sprint planning', days: 2, status: 'done' }
			]},
			{ name: 'Development', tasks: [
				{ title: 'Core features', days: 14, status: 'done', offset: 14 },
				{ title: 'API integration', days: 10, status: 'active', offset: 21 },
				{ title: 'UI polish', days: 7, status: null, offset: 28 }
			]},
			{ name: 'Testing', tasks: [
				{ title: 'Unit tests', days: 5, status: null, offset: 35 },
				{ title: 'Integration tests', days: 5, status: null, offset: 38 },
				{ title: 'UAT', days: 7, status: 'crit', offset: 42 }
			]},
			{ name: 'Release', tasks: [
				{ title: 'Documentation', days: 5, status: null, offset: 45 },
				{ title: 'Deployment', days: 2, status: 'milestone', offset: 52 }
			]}
		]);

		// Demo 2: Marketing Campaign
		this.createDemoProject('Marketing Campaign Q1', [
			{ name: 'Research', tasks: [
				{ title: 'Market analysis', days: 7, status: 'done' },
				{ title: 'Competitor review', days: 5, status: 'done', offset: 3 }
			]},
			{ name: 'Content', tasks: [
				{ title: 'Blog posts', days: 14, status: 'active', offset: 10 },
				{ title: 'Social media', days: 21, status: 'active', offset: 12 },
				{ title: 'Email templates', days: 7, status: null, offset: 20 }
			]},
			{ name: 'Launch', tasks: [
				{ title: 'Campaign launch', days: 1, status: 'milestone', offset: 30 },
				{ title: 'Monitor & adjust', days: 14, status: null, offset: 31 }
			]}
		]);

		// Demo 3: Website Redesign
		this.createDemoProject('Website Redesign', [
			{ name: 'Discovery', tasks: [
				{ title: 'Stakeholder interviews', days: 5, status: 'done' },
				{ title: 'Analytics review', days: 3, status: 'done', offset: 2 },
				{ title: 'User research', days: 7, status: 'done', offset: 5 }
			]},
			{ name: 'Design', tasks: [
				{ title: 'Wireframes', days: 7, status: 'done', offset: 12 },
				{ title: 'Visual design', days: 10, status: 'active', offset: 17 },
				{ title: 'Prototype', days: 5, status: null, offset: 25 }
			]},
			{ name: 'Development', tasks: [
				{ title: 'Frontend build', days: 14, status: null, offset: 30 },
				{ title: 'CMS integration', days: 7, status: null, offset: 38 },
				{ title: 'QA testing', days: 5, status: 'crit', offset: 45 }
			]},
			{ name: 'Launch', tasks: [
				{ title: 'Content migration', days: 5, status: null, offset: 48 },
				{ title: 'Go live', days: 1, status: 'milestone', offset: 55 }
			]}
		]);

		// Switch to the first demo project
		this.switchProject(release);
	}

	private createDemoProject(
		name: string,
		sections: Array<{
			name: string;
			tasks: Array<{ title: string; days: number; status: 'active' | 'done' | 'crit' | 'milestone' | null; offset?: number }>;
		}>
	): string {
		const id = generateId();
		const now = Date.now();
		const meta: ProjectMeta = { id, name, createdAt: now, updatedAt: now };

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		// Start 2 weeks ago for realistic demo
		const baseDate = new Date(today);
		baseDate.setDate(baseDate.getDate() - 14);

		const sectionData: Section[] = [];
		const taskData: SerializedTask[] = [];

		sections.forEach((section, sIdx) => {
			const sectionId = generateId();
			sectionData.push({ id: sectionId, name: section.name, order: sIdx });

			section.tasks.forEach((task) => {
				const startDate = new Date(baseDate);
				startDate.setDate(startDate.getDate() + (task.offset ?? 0));
				const endDate = new Date(startDate);
				endDate.setDate(endDate.getDate() + task.days - 1);

				taskData.push({
					id: generateId(),
					title: task.title,
					sectionId,
					startDate: startDate.toISOString(),
					endDate: endDate.toISOString(),
					status: task.status,
					dependencies: []
				});
			});
		});

		const projectData: ProjectData = {
			meta,
			current: {
				config: { title: name, dateFormat: 'YYYY-MM-DD', axisFormat: '%Y-%m-%d', excludes: [] },
				sections: sectionData,
				tasks: taskData
			},
			versions: []
		};

		this.projects = [...this.projects, meta];
		localStorage.setItem(`${STORAGE_PREFIX}project:${id}`, JSON.stringify(projectData));
		this.saveProjectsList();

		return id;
	}

	// Project list management
	private loadProjectsList(): void {
		try {
			const raw = localStorage.getItem(`${STORAGE_PREFIX}projects`);
			this.projects = raw ? JSON.parse(raw) : [];
			const currentId = localStorage.getItem(`${STORAGE_PREFIX}current`);
			this.currentProjectId = currentId;
		} catch {
			this.projects = [];
			this.currentProjectId = null;
		}
	}

	private saveProjectsList(): void {
		localStorage.setItem(`${STORAGE_PREFIX}projects`, JSON.stringify(this.projects));
		if (this.currentProjectId) {
			localStorage.setItem(`${STORAGE_PREFIX}current`, this.currentProjectId);
		} else {
			localStorage.removeItem(`${STORAGE_PREFIX}current`);
		}
	}

	// Project CRUD
	createProject(name: string): string {
		const id = generateId();
		const now = Date.now();
		const meta: ProjectMeta = { id, name, createdAt: now, updatedAt: now };

		this.projects = [...this.projects, meta];
		this.saveProjectsList();

		// Initialize empty project data
		const projectData: ProjectData = {
			meta,
			current: this.ganttStore ? serializeData(this.ganttStore.exportData()) : this.defaultData(),
			versions: []
		};
		localStorage.setItem(`${STORAGE_PREFIX}project:${id}`, JSON.stringify(projectData));

		return id;
	}

	private defaultData(): SerializedGanttData {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const endDate = new Date(today);
		endDate.setDate(endDate.getDate() + 6);

		return {
			config: { title: 'My Project', dateFormat: 'YYYY-MM-DD', axisFormat: '%Y-%m-%d', excludes: [] },
			sections: [{ id: generateId(), name: 'Tasks', order: 0 }],
			tasks: []
		};
	}

	deleteProject(id: string): void {
		this.projects = this.projects.filter((p) => p.id !== id);
		localStorage.removeItem(`${STORAGE_PREFIX}project:${id}`);
		this.saveProjectsList();

		// If deleted current project, switch to another or create new
		if (this.currentProjectId === id) {
			if (this.projects.length > 0) {
				this.switchProject(this.projects[0].id);
			} else {
				const newId = this.createProject('Untitled');
				this.switchProject(newId);
			}
		}
	}

	renameProject(id: string, name: string): void {
		this.projects = this.projects.map((p) => (p.id === id ? { ...p, name } : p));
		this.saveProjectsList();

		// Update project data too
		const data = this.loadProjectData(id);
		if (data) {
			data.meta.name = name;
			localStorage.setItem(`${STORAGE_PREFIX}project:${id}`, JSON.stringify(data));
		}
	}

	switchProject(id: string): void {
		// Save current project first
		if (this.currentProjectId && this.ganttStore) {
			this.saveNow();
		}

		this.currentProjectId = id;
		this.saveProjectsList();

		// Load new project data into gantt store
		const data = this.loadProjectData(id);
		if (data && this.ganttStore) {
			this.ganttStore.importData(deserializeData(data.current));
			this.lastAutoSnapshot = this.findLastAutoSnapshotTime(data.versions);
			this.dataHash = this.computeHash(data.current);
		}

		this.saveStatus = 'saved';
	}

	// Project data loading
	private loadProjectData(id: string): ProjectData | null {
		try {
			const raw = localStorage.getItem(`${STORAGE_PREFIX}project:${id}`);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	private loadVersions(): ProjectVersion[] {
		if (!this.currentProjectId) return [];
		const data = this.loadProjectData(this.currentProjectId);
		return data?.versions ?? [];
	}

	private findLastAutoSnapshotTime(versions: ProjectVersion[]): number {
		const autoVersions = versions.filter((v) => v.name === null);
		if (autoVersions.length === 0) return 0;
		return Math.max(...autoVersions.map((v) => v.timestamp));
	}

	// Saving
	setupAutosave(ganttStore: GanttStore): void {
		this.ganttStore = ganttStore;

		// Initialize or load project
		if (this.currentProjectId) {
			const data = this.loadProjectData(this.currentProjectId);
			if (data) {
				ganttStore.importData(deserializeData(data.current));
				this.lastAutoSnapshot = this.findLastAutoSnapshotTime(data.versions);
				this.dataHash = this.computeHash(data.current);
			}
		} else if (this.projects.length > 0) {
			this.switchProject(this.projects[0].id);
		} else {
			const id = this.createProject('Untitled');
			this.switchProject(id);
		}
	}

	markDirty(): void {
		if (this.saveStatus === 'saved') {
			this.saveStatus = 'unsaved';
		}
		this.scheduleSave();
	}

	private scheduleSave(): void {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = setTimeout(() => this.saveNow(), 1000);
	}

	saveNow(): void {
		if (!this.currentProjectId || !this.ganttStore) return;

		this.saveStatus = 'saving';

		const data = this.loadProjectData(this.currentProjectId);
		if (!data) return;

		const serialized = serializeData(this.ganttStore.exportData());
		const newHash = this.computeHash(serialized);

		// Skip if nothing changed
		if (newHash === this.dataHash) {
			this.saveStatus = 'saved';
			return;
		}

		data.current = serialized;
		data.meta.updatedAt = Date.now();

		// Check if we need an auto-snapshot
		const now = Date.now();
		if (now - this.lastAutoSnapshot >= AUTO_SNAPSHOT_INTERVAL) {
			this.addAutoSnapshot(data);
			this.lastAutoSnapshot = now;
		}

		// Save to localStorage
		localStorage.setItem(`${STORAGE_PREFIX}project:${this.currentProjectId}`, JSON.stringify(data));

		// Update project meta in list
		this.projects = this.projects.map((p) =>
			p.id === this.currentProjectId ? { ...p, updatedAt: data.meta.updatedAt } : p
		);
		this.saveProjectsList();

		this.dataHash = newHash;
		this.saveStatus = 'saved';
	}

	private computeHash(data: SerializedGanttData): string {
		return JSON.stringify(data);
	}

	private addAutoSnapshot(data: ProjectData): void {
		const version: ProjectVersion = {
			id: generateId(),
			name: null,
			timestamp: Date.now(),
			data: { ...data.current }
		};

		data.versions.push(version);

		// Prune old auto-snapshots
		const autoVersions = data.versions.filter((v) => v.name === null);
		if (autoVersions.length > MAX_AUTO_VERSIONS) {
			const oldest = autoVersions.sort((a, b) => a.timestamp - b.timestamp)[0];
			data.versions = data.versions.filter((v) => v.id !== oldest.id);
		}
	}

	// Manual snapshots
	createSnapshot(name?: string): void {
		if (!this.currentProjectId || !this.ganttStore) return;

		const data = this.loadProjectData(this.currentProjectId);
		if (!data) return;

		// Check manual version limit
		const manualVersions = data.versions.filter((v) => v.name !== null);
		if (manualVersions.length >= MAX_MANUAL_VERSIONS) {
			// Remove oldest manual version
			const oldest = manualVersions.sort((a, b) => a.timestamp - b.timestamp)[0];
			data.versions = data.versions.filter((v) => v.id !== oldest.id);
		}

		const version: ProjectVersion = {
			id: generateId(),
			name: name || `Snapshot ${new Date().toLocaleString()}`,
			timestamp: Date.now(),
			data: serializeData(this.ganttStore.exportData())
		};

		data.versions.push(version);
		localStorage.setItem(`${STORAGE_PREFIX}project:${this.currentProjectId}`, JSON.stringify(data));
	}

	restoreVersion(versionId: string): void {
		if (!this.currentProjectId || !this.ganttStore) return;

		const data = this.loadProjectData(this.currentProjectId);
		if (!data) return;

		const version = data.versions.find((v) => v.id === versionId);
		if (!version) return;

		// Create snapshot of current state before restoring
		this.createSnapshot('Before restore');

		// Restore the version
		this.ganttStore.importData(deserializeData(version.data));
		data.current = version.data;
		data.meta.updatedAt = Date.now();

		localStorage.setItem(`${STORAGE_PREFIX}project:${this.currentProjectId}`, JSON.stringify(data));
		this.dataHash = this.computeHash(data.current);
		this.saveStatus = 'saved';
	}

	deleteVersion(versionId: string): void {
		if (!this.currentProjectId) return;

		const data = this.loadProjectData(this.currentProjectId);
		if (!data) return;

		data.versions = data.versions.filter((v) => v.id !== versionId);
		localStorage.setItem(`${STORAGE_PREFIX}project:${this.currentProjectId}`, JSON.stringify(data));
	}

	// History modal
	openHistory(): void {
		this.isHistoryOpen = true;
	}

	closeHistory(): void {
		this.isHistoryOpen = false;
	}

	// Beforeunload handler
	handleBeforeUnload(): void {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		this.saveNow();
	}
}

// Context helpers
export function createPersistenceStore(): PersistenceStore {
	return new PersistenceStore();
}

export function setPersistenceContext(store: PersistenceStore): void {
	setContext(PERSISTENCE_CONTEXT, store);
}

export function getPersistenceContext(): PersistenceStore {
	const store = getContext<PersistenceStore>(PERSISTENCE_CONTEXT);
	if (!store) {
		throw new Error('PersistenceStore not found in context');
	}
	return store;
}
