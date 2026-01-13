import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
	orientation?: 'landscape' | 'portrait';
	filename?: string;
	title?: string;
	scale?: number;
}

/**
 * Export an HTML element to PDF
 */
export async function exportToPDF(
	element: HTMLElement,
	options: PDFExportOptions = {}
): Promise<void> {
	const {
		orientation = 'landscape',
		filename = 'gantt-chart.pdf',
		title,
		scale = 2
	} = options;

	// Capture the element as a canvas
	const canvas = await html2canvas(element, {
		scale,
		useCORS: true,
		logging: false,
		backgroundColor: getComputedStyle(element).backgroundColor || '#ffffff'
	});

	const imgData = canvas.toDataURL('image/png');
	const imgWidth = canvas.width;
	const imgHeight = canvas.height;

	// Create PDF with appropriate dimensions
	const pdf = new jsPDF({
		orientation,
		unit: 'px',
		format: [imgWidth / scale, imgHeight / scale]
	});

	// Add title if provided
	if (title) {
		pdf.setFontSize(16);
		pdf.text(title, 20, 30);
	}

	// Add the image
	const yOffset = title ? 50 : 0;
	pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth / scale, imgHeight / scale);

	// Download
	pdf.save(filename);
}

/**
 * Export Gantt chart to multi-page PDF if content is wide
 */
export async function exportGanttToPDF(
	element: HTMLElement,
	options: PDFExportOptions = {}
): Promise<void> {
	const {
		orientation = 'landscape',
		filename = 'gantt-chart.pdf',
		scale = 2
	} = options;

	// Capture the element as a canvas
	const canvas = await html2canvas(element, {
		scale,
		useCORS: true,
		logging: false,
		backgroundColor: getComputedStyle(element).backgroundColor || '#ffffff'
	});

	const imgData = canvas.toDataURL('image/png');

	// A4 dimensions in points
	const pageWidth = orientation === 'landscape' ? 841.89 : 595.28;
	const pageHeight = orientation === 'landscape' ? 595.28 : 841.89;

	// Calculate scaling to fit width
	const imgWidth = canvas.width / scale;
	const imgHeight = canvas.height / scale;

	const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
	const scaledWidth = imgWidth * ratio;
	const scaledHeight = imgHeight * ratio;

	const pdf = new jsPDF({
		orientation,
		unit: 'pt',
		format: 'a4'
	});

	// Center the image on the page
	const x = (pageWidth - scaledWidth) / 2;
	const y = (pageHeight - scaledHeight) / 2;

	pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
	pdf.save(filename);
}
