/**
 * Schedule detection utilities for Smart Import
 * Detects schedule-like content in text using heuristic patterns
 */

export interface ScheduleSignals {
	hasDatePatterns: boolean;
	hasDurationPatterns: boolean;
	hasTaskListPatterns: boolean;
	hasProjectKeywords: boolean;
	hasMermaidSyntax: boolean;
	confidence: number; // 0-1
}

export interface PreviewResult {
	taskCount: number;
	sections: string[];
	dateRange: { start: string; end: string } | null;
	confidence: 'high' | 'medium' | 'low';
	warnings: string[];
	isMermaid: boolean;
}

// Detection patterns
const DATE_PATTERNS = [
	/\d{4}-\d{2}-\d{2}/, // ISO: 2024-01-15
	/\d{1,2}\/\d{1,2}\/\d{2,4}/, // US/EU: 1/15/24, 15/1/2024
	/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?/i, // Jan 15, 2024
	/\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*/i, // 15th January
	/Q[1-4]\s*['']?\d{2,4}/i, // Q1 2024, Q2'24
	/Week\s*\d{1,2}/i, // Week 12
];

const DURATION_PATTERNS = [
	/\d+\s*(?:days?|weeks?|months?|hours?|hrs?)/i, // 5 days, 2 weeks
	/\d+[dwmh]\b/, // 5d, 2w, 1m
	/\d+\s*-\s*\d+\s*(?:days?|weeks?)/i, // 3-5 days
];

const TASK_PATTERNS = [
	/^[-•*]\s+.+/m, // Bullet lists: - Task, • Task, * Task
	/^\d+[.)]\s+.+/m, // Numbered lists: 1. Task, 2) Task
	/^(?:task|todo|milestone|phase|sprint|step)[\s:]/im, // Labeled items
	/^\s*\[[ x]?\]\s+.+/m, // Checkbox: [ ] Task, [x] Done
];

const PROJECT_KEYWORDS = [
	'deadline',
	'due date',
	'due:',
	'milestone',
	'deliverable',
	'kickoff',
	'launch',
	'phase',
	'sprint',
	'iteration',
	'depends on',
	'blocked by',
	'after',
	'before',
	'start date',
	'end date',
	'timeline',
	'schedule',
	'project',
	'task',
	'release',
	'target',
	'eta',
	'estimated',
];

const MERMAID_INDICATORS = [/^\s*gantt\s*$/m, /^\s*title\s+.+$/m, /^\s*section\s+.+$/m, /:\s*\w+,\s*\d{4}-\d{2}-\d{2}/];

/**
 * Detect schedule-like signals in text
 */
export function detectScheduleSignals(text: string): ScheduleSignals {
	const lowerText = text.toLowerCase();

	const hasDatePatterns = DATE_PATTERNS.some((p) => p.test(text));
	const hasDurationPatterns = DURATION_PATTERNS.some((p) => p.test(text));
	const hasTaskListPatterns = TASK_PATTERNS.some((p) => p.test(text));
	const hasProjectKeywords = PROJECT_KEYWORDS.some((kw) => lowerText.includes(kw));
	const hasMermaidSyntax = MERMAID_INDICATORS.some((p) => p.test(text));

	// Calculate confidence score
	let score = 0;
	if (hasMermaidSyntax) score += 0.5; // Strong signal
	if (hasDatePatterns) score += 0.25;
	if (hasDurationPatterns) score += 0.15;
	if (hasTaskListPatterns) score += 0.2;
	if (hasProjectKeywords) score += 0.15;

	// Bonus for combinations
	if (hasDatePatterns && hasTaskListPatterns) score += 0.1;
	if (hasDurationPatterns && hasTaskListPatterns) score += 0.1;

	const confidence = Math.min(1, score);

	return {
		hasDatePatterns,
		hasDurationPatterns,
		hasTaskListPatterns,
		hasProjectKeywords,
		hasMermaidSyntax,
		confidence,
	};
}

/**
 * Check if text is likely a schedule
 */
export function isLikelySchedule(text: string, threshold = 0.3): boolean {
	if (!text || text.trim().length < 10) return false;
	const signals = detectScheduleSignals(text);
	return signals.confidence >= threshold;
}

/**
 * Extract a preview of detected schedule content
 */
export function extractPreview(text: string): PreviewResult {
	const signals = detectScheduleSignals(text);
	const warnings: string[] = [];

	// Check for mermaid syntax
	const isMermaid = signals.hasMermaidSyntax && /^\s*gantt\s*$/m.test(text);

	// Count potential tasks
	let taskCount = 0;
	const lines = text.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();
		// Count bullet/numbered items
		if (/^[-•*]\s+\S/.test(trimmed) || /^\d+[.)]\s+\S/.test(trimmed)) {
			taskCount++;
		}
		// Count mermaid task lines
		if (/^\s+\S.*:\s*\w*,?\s*\w+,/.test(line)) {
			taskCount++;
		}
	}

	// If no structured tasks found, estimate from line count
	if (taskCount === 0) {
		// Count non-empty, non-header lines
		taskCount = lines.filter((l) => {
			const t = l.trim();
			return t.length > 0 && !t.startsWith('#') && !t.startsWith('gantt') && !t.startsWith('title') && !t.startsWith('section') && !t.startsWith('dateFormat');
		}).length;
	}

	// Extract section names
	const sections: string[] = [];
	const sectionMatches = text.matchAll(/(?:^|\n)\s*(?:section|phase|##?)\s*[:\-]?\s*(.+)/gi);
	for (const match of sectionMatches) {
		const name = match[1].trim();
		if (name && !sections.includes(name)) {
			sections.push(name);
		}
	}

	// Try to extract date range
	let dateRange: { start: string; end: string } | null = null;
	const isoDateMatches = [...text.matchAll(/\d{4}-\d{2}-\d{2}/g)].map((m) => m[0]);
	if (isoDateMatches.length >= 1) {
		const sorted = isoDateMatches.sort();
		dateRange = {
			start: sorted[0],
			end: sorted[sorted.length - 1],
		};
	}

	// Generate warnings
	if (!signals.hasDatePatterns && !isMermaid) {
		warnings.push('No dates detected - will start from today');
	}
	if (!signals.hasDurationPatterns && !isMermaid) {
		warnings.push('No durations detected - will estimate based on task complexity');
	}
	if (taskCount === 0) {
		warnings.push('No tasks detected - content may need more structure');
	}

	// Determine confidence level
	let confidence: 'high' | 'medium' | 'low';
	if (signals.confidence >= 0.6) {
		confidence = 'high';
	} else if (signals.confidence >= 0.3) {
		confidence = 'medium';
	} else {
		confidence = 'low';
	}

	return {
		taskCount,
		sections,
		dateRange,
		confidence,
		warnings,
		isMermaid,
	};
}
