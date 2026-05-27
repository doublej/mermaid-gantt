import type { GanttData, Task } from '$lib/types';
import { addDays, diffDays, getDateRange, isWeekend } from './date-utils';
import { DM_SANS_STACK, getEmbeddedFontFaceCss } from './export-fonts';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Layout constants mirror GanttChart.svelte
export const EXPORT_ROW_HEIGHT = 40;
export const EXPORT_HEADER_HEIGHT = 48;
const MIN_DAYS = 90;
const BAR_INSET = 4; // vertical inset of bar within row
const DEFAULT_SIDEBAR_WIDTH = 240;
// A legible day width for export so the timeline never collapses to unreadable.
const EXPORT_DAY_WIDTH = 24;

export interface ExportSVGOptions {
	dayWidth?: number;
	sidebarWidth?: number;
	labelPosition?: 'inside' | 'beside';
}

export interface ExportLayout {
	svg: SVGSVGElement;
	width: number;
	height: number;
	sidebarWidth: number;
	headerHeight: number;
	rowHeight: number;
	dayWidth: number;
	/** width of the timeline area (excludes sidebar) */
	timelineWidth: number;
}

// CSS variables the chart relies on, resolved to concrete colors for a
// self-contained SVG (CSS custom properties don't survive serialization).
const COLOR_VARS = {
	surface: '--color-surface',
	surfaceElevated: '--color-surface-elevated',
	border: '--color-border',
	grid: '--color-grid',
	gridDark: '--color-grid-dark',
	weekend: '--color-weekend',
	today: '--color-today',
	text: '--color-text',
	textSecondary: '--color-text-secondary',
	textTertiary: '--color-text-tertiary',
	accent: '--color-accent',
	statusDone: '--color-status-done',
	statusCritical: '--color-status-critical',
	statusMilestone: '--color-status-milestone'
} as const;

type ResolvedColors = Record<keyof typeof COLOR_VARS, string>;

function resolveColors(): ResolvedColors {
	const styles = getComputedStyle(document.documentElement);
	const out = {} as ResolvedColors;
	for (const [key, varName] of Object.entries(COLOR_VARS)) {
		out[key as keyof typeof COLOR_VARS] = styles.getPropertyValue(varName).trim() || '#000000';
	}
	return out;
}

function el(tag: string, attrs: Record<string, string | number>): SVGElement {
	const node = document.createElementNS(SVG_NS, tag);
	// Brand font on every text node so svg2pdf (vector) and rasterized SVG (PNG)
	// both render in DM Sans instead of falling back to Times/Helvetica.
	if (tag === 'text' && !('font-family' in attrs)) {
		node.setAttribute('font-family', DM_SANS_STACK);
	}
	for (const [k, v] of Object.entries(attrs)) {
		node.setAttribute(k, String(v));
	}
	return node;
}

function textNode(content: string): Text {
	return document.createTextNode(content);
}

function taskColors(task: Task, colors: ResolvedColors): { fill: string; text: string } {
	if (task.color) return { fill: task.color, text: '#ffffff' };
	switch (task.status) {
		case 'done':
			return { fill: colors.statusDone, text: '#ffffff' };
		case 'crit':
			return { fill: colors.statusCritical, text: '#ffffff' };
		case 'milestone':
			return { fill: colors.statusMilestone, text: '#ffffff' };
		default:
			return { fill: colors.accent, text: '#ffffff' };
	}
}

interface PositionedTask {
	task: Task;
	x: number;
	y: number;
	width: number;
	height: number;
	rowIndex: number;
}

interface Layout {
	start: Date;
	totalDays: number;
	positions: PositionedTask[];
	rowEntries: { label: string; y: number; kind: 'section' | 'task'; level: number }[];
	totalRows: number;
}

function computeLayout(data: GanttData, dayWidth: number): Layout {
	const taskRange = getDateRange(data.tasks);
	const start = addDays(taskRange.start, -2);
	let end = addDays(taskRange.end, 7);
	if (diffDays(start, end) < MIN_DAYS) end = addDays(start, MIN_DAYS);
	const totalDays = diffDays(start, end) + 1;

	const taskMap = new Map(data.tasks.map((t) => [t.id, t]));
	const levelOf = (task: Task): number => {
		let level = 0;
		let current = task;
		while (current.parentId) {
			const parent = taskMap.get(current.parentId);
			if (!parent) break;
			level++;
			current = parent;
		}
		return level;
	};

	const sections = [...data.sections].sort((a, b) => a.order - b.order);
	const positions: PositionedTask[] = [];
	const rowEntries: Layout['rowEntries'] = [];
	let rowIndex = 0;

	for (const section of sections) {
		const y = rowIndex * EXPORT_ROW_HEIGHT + EXPORT_HEADER_HEIGHT;
		rowEntries.push({ label: section.name, y, kind: 'section', level: 0 });
		rowIndex++;

		const sectionTasks = data.tasks.filter((t) => t.sectionId === section.id);
		for (const task of sectionTasks) {
			const rowY = rowIndex * EXPORT_ROW_HEIGHT + EXPORT_HEADER_HEIGHT;
			const startOffset = diffDays(start, task.startDate);
			const duration = diffDays(task.startDate, task.endDate) + 1;
			positions.push({
				task,
				x: startOffset * dayWidth,
				// Inset the bar within the row so it is vertically centred (matches
				// GanttChart.svelte, which renders the bar at pos.y + BAR_INSET).
				y: rowY + BAR_INSET,
				width: duration * dayWidth,
				height: EXPORT_ROW_HEIGHT - 2 * BAR_INSET,
				rowIndex
			});
			rowEntries.push({ label: task.title, y: rowY, kind: 'task', level: levelOf(task) });
			rowIndex++;
		}
	}

	return { start, totalDays, positions, rowEntries, totalRows: rowIndex };
}

function drawHeader(
	g: SVGElement,
	start: Date,
	totalDays: number,
	dayWidth: number,
	timelineWidth: number,
	colors: ResolvedColors
): void {
	const h = EXPORT_HEADER_HEIGHT;
	g.appendChild(el('rect', { x: 0, y: 0, width: timelineWidth, height: h, fill: colors.surfaceElevated }));

	// Month labels (top half)
	let monthStart = 0;
	let currentMonth = addDays(start, 0).getMonth();
	const pushMonth = (from: number, to: number) => {
		const label = addDays(start, from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		const x = from * dayWidth;
		const w = (to - from) * dayWidth;
		g.appendChild(el('rect', { x, y: 0, width: w, height: h / 2, fill: colors.surfaceElevated, stroke: colors.grid }));
		const t = el('text', {
			x: x + w / 2,
			y: h / 4 + 4,
			'text-anchor': 'middle',
			'font-size': 12,
			'font-weight': 500,
			fill: colors.textSecondary
		});
		t.appendChild(textNode(label));
		g.appendChild(t);
	};
	for (let i = 0; i <= totalDays; i++) {
		const m = addDays(start, i).getMonth();
		if (m !== currentMonth) {
			pushMonth(monthStart, i);
			currentMonth = m;
			monthStart = i;
		}
	}
	pushMonth(monthStart, totalDays);

	// Day labels (bottom half)
	for (let i = 0; i < totalDays; i++) {
		const date = addDays(start, i);
		const weekend = isWeekend(date);
		const x = i * dayWidth;
		g.appendChild(
			el('rect', {
				x,
				y: h / 2,
				width: dayWidth,
				height: h / 2,
				fill: weekend ? colors.weekend : colors.surfaceElevated,
				stroke: colors.grid
			})
		);
		const t = el('text', {
			x: x + dayWidth / 2,
			y: h / 2 + h / 4 + 4,
			'text-anchor': 'middle',
			'font-size': 11,
			fill: colors.textTertiary
		});
		t.appendChild(textNode(String(date.getDate())));
		g.appendChild(t);
	}

	g.appendChild(el('line', { x1: 0, y1: h, x2: timelineWidth, y2: h, stroke: colors.gridDark, 'stroke-width': 1 }));
}

function drawGrid(
	g: SVGElement,
	start: Date,
	totalDays: number,
	dayWidth: number,
	totalRows: number,
	timelineWidth: number,
	colors: ResolvedColors
): void {
	const gridHeight = totalRows * EXPORT_ROW_HEIGHT;
	for (let i = 0; i < totalRows; i++) {
		g.appendChild(
			el('rect', {
				x: 0,
				y: EXPORT_HEADER_HEIGHT + i * EXPORT_ROW_HEIGHT,
				width: timelineWidth,
				height: EXPORT_ROW_HEIGHT,
				fill: i % 2 === 0 ? colors.surface : colors.surfaceElevated
			})
		);
	}
	for (let i = 0; i < totalDays; i++) {
		if (!isWeekend(addDays(start, i))) continue;
		g.appendChild(
			el('rect', {
				x: i * dayWidth,
				y: EXPORT_HEADER_HEIGHT,
				width: dayWidth,
				height: gridHeight,
				fill: colors.weekend,
				opacity: 0.7
			})
		);
	}
	for (let i = 0; i <= totalDays; i++) {
		const x = i * dayWidth;
		g.appendChild(
			el('line', {
				x1: x,
				y1: EXPORT_HEADER_HEIGHT,
				x2: x,
				y2: EXPORT_HEADER_HEIGHT + gridHeight,
				stroke: colors.grid,
				'stroke-width': 1
			})
		);
	}
	for (let i = 0; i <= totalRows; i++) {
		const y = EXPORT_HEADER_HEIGHT + i * EXPORT_ROW_HEIGHT;
		g.appendChild(el('line', { x1: 0, y1: y, x2: timelineWidth, y2: y, stroke: colors.grid, 'stroke-width': 1 }));
	}

	// Today marker
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const diff = Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
	if (diff >= 0 && diff <= totalDays) {
		const x = diff * dayWidth + dayWidth / 2;
		g.appendChild(
			el('line', {
				x1: x,
				y1: EXPORT_HEADER_HEIGHT,
				x2: x,
				y2: EXPORT_HEADER_HEIGHT + gridHeight,
				stroke: colors.today,
				'stroke-width': 2,
				'stroke-dasharray': '4 4'
			})
		);
		g.appendChild(el('circle', { cx: x, cy: EXPORT_HEADER_HEIGHT, r: 4, fill: colors.today }));
	}
}

function drawDependencies(g: SVGElement, layout: Layout, colors: ResolvedColors): void {
	const posMap = new Map(layout.positions.map((p) => [p.task.id, p]));
	for (const { task } of layout.positions) {
		for (const depId of task.dependencies) {
			const from = posMap.get(depId);
			const to = posMap.get(task.id);
			if (!from || !to) continue;
			const fromX = from.x + from.width;
			const fromY = from.y + from.height / 2;
			const toX = to.x;
			const toY = to.y + to.height / 2;
			const midX = fromX + (toX - fromX) / 2;
			const d =
				toX - fromX < 20
					? `M ${fromX} ${fromY} L ${toX - 4} ${toY}`
					: `M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX - 4}`;
			g.appendChild(
				el('path', {
					d,
					fill: 'none',
					stroke: colors.textTertiary,
					'stroke-width': 1.5,
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round'
				})
			);
			g.appendChild(
				el('polygon', {
					points: `${toX},${toY} ${toX - 6},${toY - 4} ${toX - 6},${toY + 4}`,
					fill: colors.textTertiary
				})
			);
		}
	}
}

function drawBars(
	g: SVGElement,
	layout: Layout,
	labelPosition: 'inside' | 'beside',
	colors: ResolvedColors
): void {
	for (const pos of layout.positions) {
		const { task, x, y, width, height } = pos;
		const c = taskColors(task, colors);
		const isMilestone = task.isMilestone || task.status === 'milestone';

		if (isMilestone) {
			const cx = x + width / 2;
			const cy = y + height / 2;
			const size = height / 2;
			g.appendChild(
				el('polygon', {
					points: `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`,
					fill: c.fill
				})
			);
			continue;
		}

		g.appendChild(el('rect', { x, y, width, height, rx: 4, fill: c.fill }));

		// Label
		if (labelPosition === 'beside') {
			const t = el('text', {
				x: x + width + 6,
				y: y + height / 2 + 4,
				'font-size': 12,
				'font-weight': 500,
				fill: colors.text
			});
			t.appendChild(textNode(task.title));
			g.appendChild(t);
		} else if (width > 60) {
			const maxChars = Math.floor(width / 8) - 2;
			const label = task.title.length > maxChars ? task.title.slice(0, maxChars) + '...' : task.title;
			const t = el('text', {
				x: x + 8,
				y: y + height / 2 + 4,
				'font-size': 12,
				'font-weight': 500,
				fill: c.text
			});
			t.appendChild(textNode(label));
			g.appendChild(t);
		}
	}
}

function drawSidebar(
	g: SVGElement,
	layout: Layout,
	sidebarWidth: number,
	title: string,
	colors: ResolvedColors
): void {
	const totalHeight = EXPORT_HEADER_HEIGHT + layout.totalRows * EXPORT_ROW_HEIGHT;
	g.appendChild(el('rect', { x: 0, y: 0, width: sidebarWidth, height: totalHeight, fill: colors.surface }));
	g.appendChild(
		el('line', {
			x1: sidebarWidth,
			y1: 0,
			x2: sidebarWidth,
			y2: totalHeight,
			stroke: colors.border,
			'stroke-width': 1
		})
	);

	// Header cell
	g.appendChild(el('rect', { x: 0, y: 0, width: sidebarWidth, height: EXPORT_HEADER_HEIGHT, fill: colors.surfaceElevated }));
	g.appendChild(
		el('line', { x1: 0, y1: EXPORT_HEADER_HEIGHT, x2: sidebarWidth, y2: EXPORT_HEADER_HEIGHT, stroke: colors.border })
	);
	const titleText = el('text', {
		x: 16,
		y: EXPORT_HEADER_HEIGHT / 2 + 5,
		'font-size': 13,
		// Use 700 (registered as "bold"); svg2pdf can't resolve 600 ("600normal").
		'font-weight': 700,
		fill: colors.text
	});
	titleText.appendChild(textNode(title || 'Tasks'));
	g.appendChild(titleText);

	const maxLabelWidth = sidebarWidth - 24;
	for (const entry of layout.rowEntries) {
		if (entry.kind === 'section') {
			g.appendChild(el('rect', { x: 0, y: entry.y, width: sidebarWidth, height: EXPORT_ROW_HEIGHT, fill: colors.surfaceElevated }));
			g.appendChild(
				el('line', { x1: 0, y1: entry.y + EXPORT_ROW_HEIGHT, x2: sidebarWidth, y2: entry.y + EXPORT_ROW_HEIGHT, stroke: colors.border })
			);
			const t = el('text', {
				x: 16,
				y: entry.y + EXPORT_ROW_HEIGHT / 2 + 4,
				'font-size': 11,
				'font-weight': 500,
				'letter-spacing': '0.05em',
				fill: colors.textTertiary
			});
			t.appendChild(textNode(entry.label.toUpperCase()));
			g.appendChild(t);
		} else {
			const indent = 16 + entry.level * 14;
			const t = el('text', {
				x: indent,
				y: entry.y + EXPORT_ROW_HEIGHT / 2 + 4,
				'font-size': 13,
				fill: colors.text,
				textLength: Math.min(maxLabelWidth - entry.level * 14, Math.max(1, entry.label.length * 7)),
				lengthAdjust: 'spacingAndGlyphs'
			});
			t.appendChild(textNode(entry.label));
			g.appendChild(t);
		}
	}
}

/**
 * Build a self-contained, full-size SVG of the entire schedule (all rows,
 * full date range) with concrete colors — independent of scroll/zoom.
 * This is the shared foundation for both PDF (vector) and PNG (raster) export.
 */
export function buildGanttExportSVG(data: GanttData, options: ExportSVGOptions = {}): ExportLayout {
	const dayWidth = options.dayWidth ?? EXPORT_DAY_WIDTH;
	const sidebarWidth = options.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH;
	const labelPosition = options.labelPosition ?? 'inside';
	const colors = resolveColors();

	const layout = computeLayout(data, dayWidth);
	const timelineWidth = layout.totalDays * dayWidth;
	const width = sidebarWidth + timelineWidth;
	const height = EXPORT_HEADER_HEIGHT + layout.totalRows * EXPORT_ROW_HEIGHT;

	const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
	svg.setAttribute('xmlns', SVG_NS);
	svg.setAttribute('width', String(width));
	svg.setAttribute('height', String(height));
	svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
	svg.setAttribute('font-family', DM_SANS_STACK);

	// Page background
	svg.appendChild(el('rect', { x: 0, y: 0, width, height, fill: colors.surface }));

	// Timeline group (shifted right of the sidebar)
	const timeline = el('g', { transform: `translate(${sidebarWidth}, 0)` });
	drawGrid(timeline, layout.start, layout.totalDays, dayWidth, layout.totalRows, timelineWidth, colors);
	drawHeader(timeline, layout.start, layout.totalDays, dayWidth, timelineWidth, colors);
	drawDependencies(timeline, layout, colors);
	drawBars(timeline, layout, labelPosition, colors);
	svg.appendChild(timeline);

	// Sidebar on top (drawn last so it overlays scrolled bars at the seam)
	const sidebar = el('g', { transform: 'translate(0, 0)' });
	drawSidebar(sidebar, layout, sidebarWidth, data.config.title, colors);
	svg.appendChild(sidebar);

	return {
		svg,
		width,
		height,
		sidebarWidth,
		headerHeight: EXPORT_HEADER_HEIGHT,
		rowHeight: EXPORT_ROW_HEIGHT,
		dayWidth,
		timelineWidth
	};
}

/** Serialize the export SVG to a standalone XML string. */
export function serializeExportSVG(svg: SVGSVGElement): string {
	return new XMLSerializer().serializeToString(svg);
}

/**
 * Serialize the export SVG with DM Sans embedded as `@font-face` data URIs, so
 * a rasterized standalone SVG (PNG export) renders text in the brand font even
 * though it has no access to the page's Google-Fonts-loaded DM Sans.
 */
export async function serializeExportSVGWithFonts(svg: SVGSVGElement): Promise<string> {
	const css = await getEmbeddedFontFaceCss();
	const clone = svg.cloneNode(true) as SVGSVGElement;
	const style = document.createElementNS(SVG_NS, 'style');
	style.setAttribute('type', 'text/css');
	style.appendChild(document.createTextNode(css));
	clone.insertBefore(style, clone.firstChild);
	return new XMLSerializer().serializeToString(clone);
}
