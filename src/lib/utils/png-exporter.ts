import html2canvas from 'html2canvas';

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

	// Determine background color
	const bgColor =
		backgroundColor ?? getComputedStyle(element).backgroundColor ?? '#ffffff';

	// Capture the element as a canvas
	const canvas = await html2canvas(element, {
		scale,
		useCORS: true,
		logging: false,
		backgroundColor: bgColor
	});

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

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/**
 * Get PNG data URL from an HTML element
 */
export async function getPNGDataURL(
	element: HTMLElement,
	options: Omit<PNGExportOptions, 'filename'> = {}
): Promise<string> {
	const { scale = 2, backgroundColor } = options;

	const bgColor =
		backgroundColor ?? getComputedStyle(element).backgroundColor ?? '#ffffff';

	const canvas = await html2canvas(element, {
		scale,
		useCORS: true,
		logging: false,
		backgroundColor: bgColor
	});

	return canvas.toDataURL('image/png');
}
