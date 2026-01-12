// Date utility functions for Gantt chart calculations

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export function diffDays(start: Date, end: Date): number {
	return Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);
}

export function startOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

export function formatDate(date: Date, format: string): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return format
		.replace('YYYY', String(year))
		.replace('MM', month)
		.replace('DD', day);
}

export function parseDate(dateStr: string, format: string): Date | null {
	// Extract positions from format
	const yearIdx = format.indexOf('YYYY');
	const monthIdx = format.indexOf('MM');
	const dayIdx = format.indexOf('DD');

	if (yearIdx === -1 || monthIdx === -1 || dayIdx === -1) {
		return null;
	}

	const year = parseInt(dateStr.slice(yearIdx, yearIdx + 4), 10);
	const month = parseInt(dateStr.slice(monthIdx, monthIdx + 2), 10) - 1;
	const day = parseInt(dateStr.slice(dayIdx, dayIdx + 2), 10);

	if (isNaN(year) || isNaN(month) || isNaN(day)) {
		return null;
	}

	return new Date(year, month, day);
}

export function parseDuration(duration: string): number {
	const match = duration.match(/^(\d+)(d|w|h)?$/);
	if (!match) return 1;

	const value = parseInt(match[1], 10);
	const unit = match[2] || 'd';

	switch (unit) {
		case 'w':
			return value * 7;
		case 'h':
			return Math.ceil(value / 24);
		default:
			return value;
	}
}

export function getDateRange(tasks: { startDate: Date; endDate: Date }[]): {
	start: Date;
	end: Date;
} {
	if (tasks.length === 0) {
		const today = startOfDay(new Date());
		return { start: today, end: addDays(today, 30) };
	}

	const start = new Date(Math.min(...tasks.map((t) => t.startDate.getTime())));
	const end = new Date(Math.max(...tasks.map((t) => t.endDate.getTime())));

	return { start: startOfDay(start), end: startOfDay(end) };
}

export function generateDateLabels(
	start: Date,
	end: Date,
	zoom: number
): { date: Date; label: string }[] {
	const labels: { date: Date; label: string }[] = [];
	const current = new Date(start);

	while (current <= end) {
		const label =
			zoom >= 7
				? `Week ${getWeekNumber(current)}`
				: zoom >= 30
					? current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
					: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

		labels.push({ date: new Date(current), label });
		current.setDate(current.getDate() + zoom);
	}

	return labels;
}

function getWeekNumber(date: Date): number {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + 4 - (d.getDay() || 7));
	const yearStart = new Date(d.getFullYear(), 0, 1);
	return Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
}

export function isWeekend(date: Date): boolean {
	const day = date.getDay();
	return day === 0 || day === 6;
}

export function getMonday(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return startOfDay(d);
}
