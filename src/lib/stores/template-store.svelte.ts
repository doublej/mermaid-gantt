import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type { SerializedGanttData } from '$lib/types';
import { generateId } from '$lib/utils/id';

const TEMPLATE_CONTEXT = Symbol('template');
const STORAGE_PREFIX = 'gantt:template:';
const BUILTIN_PREFIX = 'builtin:';

export interface Template {
	id: string;
	name: string;
	description?: string;
	data: SerializedGanttData;
	createdAt: number;
	isBuiltIn: boolean;
}

export class TemplateStore {
	// User-created templates
	templates = $state<Template[]>([]);
	// Built-in templates provided at construction
	builtInTemplates = $state<Template[]>([]);

	// Derived: all templates combined
	allTemplates = $derived([...this.builtInTemplates, ...this.templates]);

	constructor(builtIns: Template[]) {
		this.builtInTemplates = builtIns;
		if (browser) {
			this.loadUserTemplates();
		}
	}

	// Load user templates from localStorage
	private loadUserTemplates(): void {
		if (!browser) return;

		const templates: Template[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(STORAGE_PREFIX) && !key.includes(BUILTIN_PREFIX)) {
				try {
					const data = localStorage.getItem(key);
					if (data) {
						templates.push(JSON.parse(data));
					}
				} catch (e) {
					console.error('Failed to load template:', e);
				}
			}
		}
		this.templates = templates;
	}

	// Get all templates (built-in + user)
	getTemplates(): Template[] {
		return this.allTemplates;
	}

	// Get user templates only
	getUserTemplates(): Template[] {
		return this.templates;
	}

	// Get built-in templates only
	getBuiltInTemplates(): Template[] {
		return this.builtInTemplates;
	}

	// Save current project as template
	saveAsTemplate(name: string, data: SerializedGanttData, description?: string): Template {
		if (!browser) throw new Error('Cannot save template in non-browser environment');

		const template: Template = {
			id: generateId(),
			name,
			description,
			data,
			createdAt: Date.now(),
			isBuiltIn: false
		};

		this.templates.push(template);
		this.persistTemplate(template);
		return template;
	}

	// Load template and return its data
	getTemplate(id: string): Template | null {
		const all = this.getTemplates();
		return all.find((t) => t.id === id) ?? null;
	}

	// Delete user template (not built-in)
	deleteTemplate(id: string): boolean {
		if (!browser) return false;

		const index = this.templates.findIndex((t) => t.id === id);
		if (index === -1) return false;

		const template = this.templates[index];
		this.templates.splice(index, 1);

		// Remove from localStorage
		const key = `${STORAGE_PREFIX}${template.id}`;
		localStorage.removeItem(key);

		return true;
	}

	// Persist template to localStorage
	private persistTemplate(template: Template): void {
		if (!browser) return;

		const key = `${STORAGE_PREFIX}${template.id}`;
		localStorage.setItem(key, JSON.stringify(template));
	}
}

// Context helpers
export function createTemplateStore(builtInTemplates: Template[]): TemplateStore {
	return new TemplateStore(builtInTemplates);
}

export function setTemplateContext(store: TemplateStore): void {
	setContext(TEMPLATE_CONTEXT, store);
}

export function getTemplateContext(): TemplateStore {
	const store = getContext<TemplateStore>(TEMPLATE_CONTEXT);
	if (!store) {
		throw new Error('TemplateStore not found in context');
	}
	return store;
}
