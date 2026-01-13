import type { GanttData, SerializedGanttData } from '$lib/types';

/**
 * Safely parse a date string, returning a fallback if invalid
 */
function parseDate(value: string, fallback: Date): Date {
	const date = new Date(value);
	if (isNaN(date.getTime())) {
		console.warn(`Invalid date string: "${value}", using fallback`);
		return fallback;
	}
	return date;
}

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
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const defaultEnd = new Date(today);
	defaultEnd.setDate(defaultEnd.getDate() + 6);

	return {
		config: data.config,
		sections: data.sections,
		tasks: data.tasks.map((t) => {
			const startDate = parseDate(t.startDate, today);
			const endDate = parseDate(t.endDate, defaultEnd);
			// Ensure endDate is not before startDate
			const validEndDate = endDate >= startDate ? endDate : startDate;
			return {
				id: t.id,
				title: t.title,
				sectionId: t.sectionId,
				startDate,
				endDate: validEndDate,
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
			};
		}),
		tags: data.tags ?? []
	};
}
