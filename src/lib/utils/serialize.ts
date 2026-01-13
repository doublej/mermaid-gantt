import type { GanttData, SerializedGanttData } from '$lib/types';

/**
 * Serialize GanttData for storage (converts Date objects to ISO strings)
 */
export function serializeGanttData(data: GanttData): SerializedGanttData {
	return {
		config: data.config,
		sections: data.sections,
		tasks: data.tasks.map((t) => ({
			id: t.id,
			title: t.title,
			sectionId: t.sectionId,
			startDate: t.startDate instanceof Date ? t.startDate.toISOString() : t.startDate,
			endDate: t.endDate instanceof Date ? t.endDate.toISOString() : t.endDate,
			status: t.status,
			dependencies: t.dependencies,
			parentId: t.parentId ?? null,
			isMilestone: t.isMilestone ?? false,
			color: t.color ?? null,
			tags: t.tags ?? [],
			estimatedHours: t.estimatedHours ?? null,
			actualHours: t.actualHours ?? null,
			estimatedCost: t.estimatedCost ?? null,
			actualCost: t.actualCost ?? null,
			notes: t.notes ?? null
		})),
		tags: data.tags ?? []
	};
}

/**
 * Deserialize stored data back to GanttData (converts ISO strings to Date objects)
 */
export function deserializeGanttData(data: SerializedGanttData): GanttData {
	return {
		config: data.config,
		sections: data.sections,
		tasks: data.tasks.map((t) => ({
			id: t.id,
			title: t.title,
			sectionId: t.sectionId,
			startDate: new Date(t.startDate),
			endDate: new Date(t.endDate),
			status: t.status,
			dependencies: t.dependencies ?? [],
			parentId: t.parentId ?? null,
			isMilestone: t.isMilestone ?? false,
			color: t.color ?? null,
			tags: t.tags ?? [],
			estimatedHours: t.estimatedHours ?? null,
			actualHours: t.actualHours ?? null,
			estimatedCost: t.estimatedCost ?? null,
			actualCost: t.actualCost ?? null,
			notes: t.notes ?? null
		})),
		tags: data.tags ?? []
	};
}
