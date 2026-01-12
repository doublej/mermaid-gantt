<script lang="ts">
	import { addDays } from '$lib/utils/date-utils';

	interface Props {
		startDate: Date;
		totalDays: number;
		dayWidth: number;
		height: number;
		zoom: number;
	}

	let { startDate, totalDays, dayWidth, height, zoom }: Props = $props();

	const labels = $derived.by(() => {
		const result: { date: Date; x: number; label: string; isWeekend: boolean }[] = [];

		for (let i = 0; i < totalDays; i += zoom) {
			const date = addDays(startDate, i);
			const dayOfWeek = date.getDay();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

			let label: string;
			if (zoom >= 7) {
				// Week view
				label = `W${getWeekNumber(date)}`;
			} else if (zoom >= 30) {
				// Month view
				label = date.toLocaleDateString('en-US', { month: 'short' });
			} else {
				// Day view
				label = date.getDate().toString();
			}

			result.push({
				date,
				x: i * dayWidth,
				label,
				isWeekend
			});
		}

		return result;
	});

	// Month labels for multi-day views
	const monthLabels = $derived.by(() => {
		if (zoom > 7) return [];

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
	<rect x="0" y="0" width="100%" {height} fill="#f9fafb" />

	<!-- Month labels (top row) -->
	{#each monthLabels as { month, x, width }}
		<g transform="translate({x}, 0)">
			<rect x="0" y="0" {width} height={height / 2} fill="#f3f4f6" stroke="#e5e7eb" />
			<text
				x={width / 2}
				y={height / 4 + 4}
				text-anchor="middle"
				class="text-xs font-medium fill-gray-600"
			>
				{month}
			</text>
		</g>
	{/each}

	<!-- Day labels (bottom row) -->
	{#each labels as { x, label, isWeekend }}
		<g transform="translate({x}, {height / 2})">
			<rect
				x="0"
				y="0"
				width={dayWidth * zoom}
				height={height / 2}
				fill={isWeekend ? '#f3f4f6' : 'transparent'}
				stroke="#e5e7eb"
			/>
			<text
				x={(dayWidth * zoom) / 2}
				y={height / 4 + 4}
				text-anchor="middle"
				class="text-xs fill-gray-500"
				class:fill-gray-400={isWeekend}
			>
				{label}
			</text>
		</g>
	{/each}

	<!-- Bottom border -->
	<line x1="0" y1={height} x2="100%" y2={height} stroke="#d1d5db" />
</g>
