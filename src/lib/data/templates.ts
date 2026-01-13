import type { Template } from '$lib/stores/template-store.svelte';
import { addDays, addMonths, startOfDay } from '$lib/utils/date-utils';
import { generateId } from '$lib/utils/id';

const today = startOfDay(new Date());

// Helper to add weeks
function addWeeks(date: Date, weeks: number): Date {
	return addDays(date, weeks * 7);
}

interface TaskTemplate {
	title: string;
	sectionIdx: number;
	startDaysOffset: number;
	durationDays: number;
	status: 'done' | 'active' | 'crit' | 'milestone' | null;
}

interface SectionTemplate {
	name: string;
	tasks: TaskTemplate[];
}

function createTemplate(
	id: string,
	name: string,
	description: string,
	sections: SectionTemplate[]
): Template {
	const sectionObjs = sections.map((s, idx) => ({
		id: generateId(),
		name: s.name,
		order: idx
	}));

	const tasks = [];
	for (const section of sections) {
		for (const task of section.tasks) {
			const startDate = addDays(today, task.startDaysOffset);
			const endDate = addDays(startDate, task.durationDays - 1);

			tasks.push({
				id: generateId(),
				title: task.title,
				sectionId: sectionObjs[task.sectionIdx].id,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				status: task.status,
				dependencies: [] as string[],
				parentId: null,
				isMilestone: task.status === 'milestone',
				color: null,
				tags: [],
				estimatedHours: null,
				actualHours: null,
				estimatedCost: null,
				actualCost: null,
				notes: null
			});
		}
	}

	return {
		id,
		name,
		description,
		isBuiltIn: true,
		createdAt: Date.now(),
		data: {
			config: {
				title: name,
				dateFormat: 'YYYY-MM-DD',
				axisFormat: '%Y-%m-%d',
				excludes: []
			},
			sections: sectionObjs,
			tasks,
			tags: []
		}
	};
}

// Software Release Template
const softwareReleaseTemplate = createTemplate(
	'builtin-software-release',
	'Software Release',
	'Plan and execute a software release cycle with planning, development, testing, and release phases.',
	[
		{
			name: 'Planning',
			tasks: [
				{ title: 'Requirements & Design', sectionIdx: 0, startDaysOffset: 0, durationDays: 14, status: 'done' },
				{ title: 'Sprint Setup', sectionIdx: 0, startDaysOffset: 14, durationDays: 1, status: 'milestone' }
			]
		},
		{
			name: 'Development',
			tasks: [
				{ title: 'Feature Development', sectionIdx: 1, startDaysOffset: 14, durationDays: 28, status: 'active' },
				{ title: 'Code Review & Merge', sectionIdx: 1, startDaysOffset: 42, durationDays: 7, status: null }
			]
		},
		{
			name: 'Testing',
			tasks: [
				{ title: 'QA Testing', sectionIdx: 2, startDaysOffset: 49, durationDays: 14, status: null },
				{ title: 'Bug Fixes', sectionIdx: 2, startDaysOffset: 63, durationDays: 7, status: null }
			]
		},
		{
			name: 'Release',
			tasks: [
				{ title: 'Release Candidate', sectionIdx: 3, startDaysOffset: 70, durationDays: 1, status: 'milestone' },
				{ title: 'Production Deployment', sectionIdx: 3, startDaysOffset: 70, durationDays: 7, status: null }
			]
		}
	]
);

// Marketing Campaign Template
const marketingCampaignTemplate = createTemplate(
	'builtin-marketing-campaign',
	'Marketing Campaign',
	'Manage a marketing campaign from research through launch to post-campaign analysis.',
	[
		{
			name: 'Research',
			tasks: [
				{ title: 'Market Research', sectionIdx: 0, startDaysOffset: 0, durationDays: 14, status: 'active' },
				{ title: 'Audience Analysis', sectionIdx: 0, startDaysOffset: 7, durationDays: 14, status: 'active' }
			]
		},
		{
			name: 'Content',
			tasks: [
				{ title: 'Creative Strategy', sectionIdx: 1, startDaysOffset: 14, durationDays: 14, status: null },
				{ title: 'Content Production', sectionIdx: 1, startDaysOffset: 28, durationDays: 21, status: null },
				{ title: 'Asset Approval', sectionIdx: 1, startDaysOffset: 49, durationDays: 7, status: null }
			]
		},
		{
			name: 'Launch',
			tasks: [
				{ title: 'Campaign Setup', sectionIdx: 2, startDaysOffset: 56, durationDays: 7, status: null },
				{ title: 'Launch', sectionIdx: 2, startDaysOffset: 63, durationDays: 1, status: 'milestone' },
				{ title: 'Monitor & Optimize', sectionIdx: 2, startDaysOffset: 63, durationDays: 28, status: null }
			]
		}
	]
);

// Event Planning Template
const eventPlanningTemplate = createTemplate(
	'builtin-event-planning',
	'Event Planning',
	'Organize and execute an event with pre-event preparation, event day, and post-event activities.',
	[
		{
			name: 'Pre-Event',
			tasks: [
				{ title: 'Venue Selection', sectionIdx: 0, startDaysOffset: 0, durationDays: 14, status: 'done' },
				{ title: 'Vendor Coordination', sectionIdx: 0, startDaysOffset: 14, durationDays: 42, status: 'active' },
				{ title: 'Marketing & Promotion', sectionIdx: 0, startDaysOffset: 21, durationDays: 49, status: 'active' },
				{ title: 'Final Logistics', sectionIdx: 0, startDaysOffset: 70, durationDays: 7, status: null }
			]
		},
		{
			name: 'Event Day',
			tasks: [
				{ title: 'Registration & Check-in', sectionIdx: 1, startDaysOffset: 77, durationDays: 1, status: null },
				{ title: 'Main Event', sectionIdx: 1, startDaysOffset: 77, durationDays: 1, status: 'milestone' }
			]
		},
		{
			name: 'Post-Event',
			tasks: [
				{ title: 'Post-Event Cleanup', sectionIdx: 2, startDaysOffset: 78, durationDays: 2, status: null },
				{ title: 'Follow-up & Analysis', sectionIdx: 2, startDaysOffset: 80, durationDays: 14, status: null }
			]
		}
	]
);

export const BUILTIN_TEMPLATES: Template[] = [
	softwareReleaseTemplate,
	marketingCampaignTemplate,
	eventPlanningTemplate
];
