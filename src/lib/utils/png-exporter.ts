import { downloadBlob } from './download';
import { captureElementAsCanvas } from './export-utils';
import type { GanttData } from '$lib/types';
import { buildGanttExportSVG, serializeExportSVGWithFonts, type ExportSVGOptions } from './gantt-svg-export';

export interface PNGExportOptions {
	scale?: number;
	filename?: string;
	/** Cap on the longest output dimension (px) to avoid huge canvases. */
	maxDimension?: number;
	svgOptions?: ExportSVGOptions;
}

const DEFAULT_MAX_DIMENSION = 12000;

/** Rasterize the full-chart export SVG onto a canvas at high DPI. */
async function renderFullChartCanvas(
	data: GanttData,
	scale: number,
	maxDimension: number,
	svgOptions?: ExportSVGOptions
): Promise<HTMLCanvasElement> {
	const { svg, width, height } = buildGanttExportSVG(data, svgOptions);

	// Clamp scale so neither dimension exceeds the cap (never clips content).
	const fit = Math.min(maxDimension / width, maxDimension / height, scale);
	const effectiveScale = Math.max(0.5, Math.min(scale, fit));

	// Embed DM Sans as @font-face data URIs so the isolated SVG renders the
	// brand font when rasterized (it can't see the page's loaded webfonts).
	const svgString = await serializeExportSVGWithFonts(svg);
	const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	try {
		const img = await loadImage(url);
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(width * effectiveScale);
		canvas.height = Math.round(height * effectiveScale);
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get 2D canvas context');
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		return canvas;
	} finally {
		URL.revokeObjectURL(url);
	}
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Failed to render SVG to image'));
		img.src = url;
	});
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error('Failed to create blob'));
		}, 'image/png');
	});
}

/**
 * Export the FULL Gantt schedule to a high-resolution PNG — every task row
 * and the entire date range, independent of scroll position or zoom.
 */
export async function exportToPNG(data: GanttData, options: PNGExportOptions = {}): Promise<void> {
	const {
		scale = 2,
		filename = 'gantt-chart.png',
		maxDimension = DEFAULT_MAX_DIMENSION,
		svgOptions
	} = options;
	const canvas = await renderFullChartCanvas(data, scale, maxDimension, svgOptions);
	const blob = await canvasToBlob(canvas);
	downloadBlob(blob, filename);
}

/** Get a PNG data URL of the full chart (e.g. for previews). */
export async function getPNGDataURL(
	data: GanttData,
	options: Omit<PNGExportOptions, 'filename'> = {}
): Promise<string> {
	const { scale = 2, maxDimension = DEFAULT_MAX_DIMENSION, svgOptions } = options;
	const canvas = await renderFullChartCanvas(data, scale, maxDimension, svgOptions);
	return canvas.toDataURL('image/png');
}

/** Legacy raster capture of an on-screen element (retained as a fallback). */
export async function captureElementPNG(
	element: HTMLElement,
	options: { scale?: number; backgroundColor?: string } = {}
): Promise<HTMLCanvasElement> {
	const { scale = 2, backgroundColor } = options;
	return captureElementAsCanvas(element, scale, backgroundColor);
}
