<script lang="ts">
	import { addDays } from '$lib/utils/date-utils';

	interface Props {
		startDate: Date;
		totalDays: number;
		dayWidth: number;
		height: number;
		zoomLevel: number;
	}

	let { startDate, totalDays, dayWidth, height, zoomLevel }: Props = $props();

	// Label step by zoom level: Day=1, Week=7, 2Week=14, Month=30, Quarter=90
	const LABEL_STEPS = [1, 7, 14, 30, 90] as const;
	const labelStep = $derived(LABEL_STEPS[zoomLevel] ?? 1);

	const labels = $derived.by(() => {
		const result: { date: Date; x: number; width: number; label: string; isWeekend: boolean }[] = [];

		for (let i = 0; i < totalDays; i += labelStep) {
			const date = addDays(startDate, i);
			const dayOfWeek = date.getDay();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

			const label = zoomLevel >= 3 ? date.toLocaleDateString('en-US', { month: 'short' })
				: zoomLevel >= 1 ? `W${getWeekNumber(date)}` : date.getDate().toString();

			result.push({
				date,
				x: i * dayWidth,
				width: labelStep * dayWidth,
				label,
				isWeekend
			});
		}

		return result;
	});

	// Month labels for multi-day views (show when zoomed in enough)
	const monthLabels = $derived.by(() => {
		if (zoomLevel > 2) return [];

		const months: { month: string; x: number; width: number }[] = [];
		let currentMonth = -1;
		let monthStart = 0;

		for (let i = 0; i <= totalDays; i++) {
			const date = addDays(startDate, i);
			const month = date.getMonth();

			if (month !== currentMonth) {
				if (currentMonth !== -1) {
					months.push({
						month: addDays(startDate, monthStart).toLocaleDateString('en-US', {
							month: 'short',
							year: 'numeric'
						}),
						x: monthStart * dayWidth,
						width: (i - monthStart) * dayWidth
					});
				}
				currentMonth = month;
				monthStart = i;
			}
		}

		// Add last month
		if (currentMonth !== -1) {
			months.push({
				month: addDays(startDate, monthStart).toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric'
				}),
				x: monthStart * dayWidth,
				width: (totalDays - monthStart) * dayWidth
			});
		}

		return months;
	});

	function getWeekNumber(date: Date): number {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		const yearStart = new Date(d.getFullYear(), 0, 1);
		return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	}
</script>

<g class="gantt-header">
	<!-- Background -->
	<rect x="0" y="0" width="100%" {height} fill="var(--color-surface-elevated)" />

	<!-- Month labels (top row) -->
	{#each monthLabels as { month, x, width }}
		<g transform="translate({x}, 0)">
			<rect x="0" y="0" {width} height={height / 2} fill="var(--color-surface-elevated)" stroke="var(--color-grid)" />
			<text
				x={width / 2}
				y={height / 4 + 4}
				text-anchor="middle"
				class="header-label-month"
			>
				{month}
			</text>
		</g>
	{/each}

	<!-- Day labels (bottom row) -->
	{#each labels as { x, width, label, isWeekend }}
		<g transform="translate({x}, {height / 2})">
			<rect
				x="0"
				y="0"
				{width}
				height={height / 2}
				fill={isWeekend ? 'var(--color-weekend)' : 'transparent'}
				stroke="var(--color-grid)"
			/>
			<text
				x={width / 2}
				y={height / 4 + 4}
				text-anchor="middle"
				class="header-label-day"
				class:weekend={isWeekend}
			>
				{label}
			</text>
		</g>
	{/each}

	<!-- Bottom border -->
	<line x1="0" y1={height} x2="100%" y2={height} stroke="var(--color-grid-dark)" />
</g>

<style>
	.header-label-month {
		font-size: 0.75rem;
		font-weight: 500;
		fill: var(--color-text-secondary);
	}

	.header-label-day {
		font-size: 0.75rem;
		fill: var(--color-text-tertiary);
	}

	.header-label-day.weekend {
		fill: var(--color-text-tertiary);
		opacity: 0.7;
	}
</style>
