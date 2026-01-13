import type { GanttData } from '$lib/types';

/**
 * Creates demo data for the landing page with dates relative to today.
 * Shows a realistic software project timeline with various task states.
 */
export function createDemoData(): GanttData {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const addDays = (date: Date, days: number): Date => {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	};

	const planningId = 'section-planning';
	const developmentId = 'section-dev';
	const launchId = 'section-launch';

	return {
		config: {
			title: 'Product Launch',
			dateFormat: 'YYYY-MM-DD',
			axisFormat: '%b %d',
			excludes: []
		},
		sections: [
			{ id: planningId, name: 'Planning', order: 0 },
			{ id: developmentId, name: 'Development', order: 1 },
			{ id: launchId, name: 'Launch', order: 2 }
		],
		tasks: [
			{
				id: 'task-research',
				title: 'User Research',
				sectionId: planningId,
				startDate: addDays(today, -14),
				endDate: addDays(today, -7),
				status: 'done',
				dependencies: []
			},
			{
				id: 'task-design',
				title: 'Design Sprint',
				sectionId: planningId,
				startDate: addDays(today, -7),
				endDate: addDays(today, 0),
				status: 'active',
				dependencies: ['task-research']
			},
			{
				id: 'task-frontend',
				title: 'Frontend Build',
				sectionId: developmentId,
				startDate: addDays(today, 1),
				endDate: addDays(today, 14),
				status: null,
				dependencies: ['task-design']
			},
			{
				id: 'task-backend',
				title: 'API Development',
				sectionId: developmentId,
				startDate: addDays(today, 1),
				endDate: addDays(today, 10),
				status: 'crit',
				dependencies: ['task-design']
			},
			{
				id: 'task-deploy',
				title: 'Deploy',
				sectionId: launchId,
				startDate: addDays(today, 15),
				endDate: addDays(today, 15),
				status: 'milestone',
				dependencies: ['task-frontend', 'task-backend']
			}
		]
	};
}

/**
 * Mermaid syntax representation of the demo data.
 * Used for the typewriter animation on the landing page.
 */
export const demoMermaidSyntax = `gantt
    title Product Launch
    dateFormat YYYY-MM-DD

    section Planning
    User Research    :done,    research, 2024-01-01, 7d
    Design Sprint    :active,  design, after research, 7d

    section Development
    Frontend Build   :         frontend, after design, 14d
    API Development  :crit,    backend, after design, 10d

    section Launch
    Deploy           :milestone, deploy, after frontend backend, 1d`;
