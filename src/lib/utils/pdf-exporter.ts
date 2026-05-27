import { jsPDF } from 'jspdf';
import type { GanttData } from '$lib/types';
import {
	buildGanttExportSVG,
	type ExportLayout,
	type ExportSVGOptions
} from './gantt-svg-export';
import { captureElementAsCanvas } from './export-utils';

export type PageSize = 'a4' | 'a3' | 'letter';
export type Orientation = 'landscape' | 'portrait';
export type ScaleMode = 'fit-page' | 'fit-width' | 'actual-size';

export interface PDFExportOptions {
	orientation?: Orientation;
	filename?: string;
	pageSize?: PageSize;
	scaleMode?: ScaleMode;
	svgOptions?: ExportSVGOptions;
}

// Page dimensions in points (pt), portrait orientation.
const PAGE_SIZES_PT: Record<PageSize, { w: number; h: number }> = {
	a4: { w: 595.28, h: 841.89 },
	a3: { w: 841.89, h: 1190.55 },
	letter: { w: 612, h: 792 }
};

const MARGIN = 24; // pt
const META_BAND = 36; // pt, height of title band on page 1
const SVG_NS = 'http://www.w3.org/2000/svg';

function pageDimensions(size: PageSize, orientation: Orientation): { w: number; h: number } {
	const { w, h } = PAGE_SIZES_PT[size];
	return orientation === 'landscape' ? { w: h, h: w } : { w, h };
}

let clipSeq = 0;

/**
 * Append a clipped, translated copy of the full chart so that the source
 * region [srcX, srcY, w, h] lands at [destX, destY] on the page tile.
 *
 * The clip rect is placed in the source coordinate space and the whole group
 * is then translated, so the clip travels with the content.
 */
function appendRegion(
	page: SVGSVGElement,
	source: SVGSVGElement,
	srcX: number,
	srcY: number,
	w: number,
	h: number,
	destX: number,
	destY: number
): void {
	const clipId = `pgclip-${clipSeq++}`;
	const defs = document.createElementNS(SVG_NS, 'defs');
	const clip = document.createElementNS(SVG_NS, 'clipPath');
	clip.setAttribute('id', clipId);
	clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
	const rect = document.createElementNS(SVG_NS, 'rect');
	// Clip rect lives in the source space (inside the translated group).
	rect.setAttribute('x', String(srcX));
	rect.setAttribute('y', String(srcY));
	rect.setAttribute('width', String(w));
	rect.setAttribute('height', String(h));
	clip.appendChild(rect);
	defs.appendChild(clip);
	page.appendChild(defs);

	const g = document.createElementNS(SVG_NS, 'g');
	g.setAttribute('transform', `translate(${destX - srcX}, ${destY - srcY})`);
	const inner = document.createElementNS(SVG_NS, 'g');
	inner.setAttribute('clip-path', `url(#${clipId})`);
	inner.appendChild(source.cloneNode(true));
	g.appendChild(inner);
	page.appendChild(g);
}

/**
 * Build a self-contained SVG element for one page tile: always includes the
 * sidebar column, plus the timeline slice [colStart, colEnd) and row slice
 * [rowTop, rowBottom) of the full chart, with the date header repeated on top.
 */
function buildPageSVG(
	full: ExportLayout,
	colStart: number,
	colEnd: number,
	rowTop: number,
	rowBottom: number
): { svg: SVGSVGElement; width: number; height: number } {
	const { sidebarWidth, headerHeight } = full;
	const sliceWidth = colEnd - colStart;
	const bodyHeight = rowBottom - rowTop;
	const width = sidebarWidth + sliceWidth;
	const height = headerHeight + bodyHeight;
	const source = full.svg;

	const page = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
	page.setAttribute('xmlns', SVG_NS);
	page.setAttribute('width', String(width));
	page.setAttribute('height', String(height));
	page.setAttribute('viewBox', `0 0 ${width} ${height}`);

	// Timeline header band (repeat the date header on every vertical page).
	appendRegion(page, source, sidebarWidth + colStart, 0, sliceWidth, headerHeight, sidebarWidth, 0);
	// Timeline body slice.
	appendRegion(
		page,
		source,
		sidebarWidth + colStart,
		headerHeight + rowTop,
		sliceWidth,
		bodyHeight,
		sidebarWidth,
		headerHeight
	);
	// Sidebar header cell (repeat on every page).
	appendRegion(page, source, 0, 0, sidebarWidth, headerHeight, 0, 0);
	// Sidebar labels for this row slice (repeat on every horizontal page).
	appendRegion(page, source, 0, headerHeight + rowTop, sidebarWidth, bodyHeight, 0, headerHeight);

	return { svg: page, width, height };
}

// A small epsilon so floating-point rounding never spawns a sliver page.
const TILE_EPSILON = 0.5;

/** Compute tile boundaries along the timeline (columns) and rows (vertical). */
function planTiles(
	full: ExportLayout,
	contentW: number,
	contentH: number,
	scale: number,
	mode: ScaleMode
): { cols: [number, number][]; rows: [number, number][] } {
	const { sidebarWidth, headerHeight, timelineWidth, height } = full;
	const bodyHeight = height - headerHeight;

	// fit-page: the whole chart is scaled onto one page — exactly one tile.
	if (mode === 'fit-page') {
		return { cols: [[0, timelineWidth]], rows: [[0, bodyHeight]] };
	}

	// Usable timeline width per page (in source px), after sidebar + scale.
	const usableTimelinePx = Math.max(1, (contentW - sidebarWidth * scale) / scale);
	const usableBodyPx = Math.max(1, (contentH - headerHeight * scale) / scale);

	const cols: [number, number][] = [];
	for (let x = 0; x < timelineWidth - TILE_EPSILON; x += usableTimelinePx) {
		cols.push([x, Math.min(timelineWidth, x + usableTimelinePx)]);
	}
	if (cols.length === 0) cols.push([0, timelineWidth]);

	const rows: [number, number][] = [];
	for (let y = 0; y < bodyHeight - TILE_EPSILON; y += usableBodyPx) {
		rows.push([y, Math.min(bodyHeight, y + usableBodyPx)]);
	}
	if (rows.length === 0) rows.push([0, bodyHeight]);

	return { cols, rows };
}

/**
 * Determine the render scale (source px → pt) for the chosen scale mode.
 */
function resolveScale(
	full: ExportLayout,
	contentW: number,
	contentH: number,
	mode: ScaleMode
): number {
	if (mode === 'actual-size') return 1;
	if (mode === 'fit-width') {
		// Fit the full chart width onto one page width; paginate vertically.
		return contentW / full.width;
	}
	// fit-page: shrink whole chart onto a single page (opt-in only).
	return Math.min(contentW / full.width, contentH / full.height);
}

/**
 * Export the FULL Gantt schedule to a (possibly multi-page) vector PDF.
 * Renders every task row and the entire date range regardless of scroll/zoom.
 */
export async function exportGanttToPDF(data: GanttData, options: PDFExportOptions = {}): Promise<void> {
	const {
		orientation = 'landscape',
		filename = 'gantt-chart.pdf',
		pageSize = 'a4',
		scaleMode = 'fit-width',
		svgOptions
	} = options;

	// Lazily load svg2pdf.js — it touches the DOM at module load, so it must
	// not be imported during SSR.
	const { svg2pdf } = await import('svg2pdf.js');

	const full = buildGanttExportSVG(data, svgOptions);
	// svg2pdf measures elements via the DOM, so the source must be attached.
	const holder = document.createElement('div');
	holder.style.cssText = 'position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none;';
	holder.appendChild(full.svg);
	document.body.appendChild(holder);

	try {
		const page = pageDimensions(pageSize, orientation);
		const pdf = new jsPDF({ orientation, unit: 'pt', format: [page.w, page.h] });

		const contentW = page.w - MARGIN * 2;
		// Reserve the metadata band on the first page only.
		const scale = resolveScale(full, contentW, page.h - MARGIN * 2 - META_BAND, scaleMode);
		const { cols, rows } = planTiles(full, contentW, page.h - MARGIN * 2 - META_BAND, scale, scaleMode);

		const totalPages = cols.length * rows.length;
		let pageNum = 0;

		for (let r = 0; r < rows.length; r++) {
			for (let c = 0; c < cols.length; c++) {
				if (pageNum > 0) pdf.addPage([page.w, page.h], orientation);
				pageNum++;

				const isFirst = pageNum === 1;
				const topOffset = MARGIN + (isFirst ? META_BAND : 0);

				if (isFirst) {
					pdf.setFontSize(14);
					pdf.setTextColor(20, 20, 20);
					pdf.text(data.config.title || 'Gantt Chart', MARGIN, MARGIN + 12);
					pdf.setFontSize(9);
					pdf.setTextColor(120, 120, 120);
					pdf.text(`Exported ${new Date().toLocaleDateString()}`, MARGIN, MARGIN + 26);
				}

				const [colStart, colEnd] = cols[c];
				const [rowTop, rowBottom] = rows[r];
				const tile = buildPageSVG(full, colStart, colEnd, rowTop, rowBottom);
				holder.appendChild(tile.svg);

				await svg2pdf(tile.svg, pdf, {
					x: MARGIN,
					y: topOffset,
					width: tile.width * scale,
					height: tile.height * scale
				});

				holder.removeChild(tile.svg);

				// Page footer with page number.
				pdf.setFontSize(8);
				pdf.setTextColor(150, 150, 150);
				pdf.text(`Page ${pageNum} / ${totalPages}`, page.w - MARGIN, page.h - 10, { align: 'right' });
			}
		}

		pdf.save(filename);
	} finally {
		document.body.removeChild(holder);
	}
}

/**
 * Legacy single-page raster export of an on-screen element. Retained for
 * callers that still pass an HTMLElement (and as a raster fallback).
 */
export async function exportToPDF(
	element: HTMLElement,
	options: { orientation?: Orientation; filename?: string; title?: string; scale?: number } = {}
): Promise<void> {
	const { orientation = 'landscape', filename = 'gantt-chart.pdf', title, scale = 2 } = options;
	const canvas = await captureElementAsCanvas(element, scale);
	const imgData = canvas.toDataURL('image/png');
	const imgWidth = canvas.width / scale;
	const imgHeight = canvas.height / scale;
	const pdf = new jsPDF({ orientation, unit: 'px', format: [imgWidth, imgHeight] });
	if (title) {
		pdf.setFontSize(16);
		pdf.text(title, 20, 30);
	}
	const yOffset = title ? 50 : 0;
	pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
	pdf.save(filename);
}
