import { downloadBlob } from './download';
import { captureElementAsCanvas } from './export-utils';

export interface PNGExportOptions {
	scale?: number;
	filename?: string;
	backgroundColor?: string;
}

/**
 * Export an HTML element to PNG image
 */
export async function exportToPNG(
	element: HTMLElement,
	options: PNGExportOptions = {}
): Promise<void> {
	const { scale = 2, filename = 'gantt-chart.png', backgroundColor } = options;
	const canvas = await captureElementAsCanvas(element, scale, backgroundColor);

	// Convert to blob and download
	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error('Failed to create blob'));
			}
		}, 'image/png');
	});

	downloadBlob(blob, filename);
}

/**
 * Get PNG data URL from an HTML element
 */
export async function getPNGDataURL(
	element: HTMLElement,
	options: Omit<PNGExportOptions, 'filename'> = {}
): Promise<string> {
	const { scale = 2, backgroundColor } = options;
	const canvas = await captureElementAsCanvas(element, scale, backgroundColor);
	return canvas.toDataURL('image/png');
}
