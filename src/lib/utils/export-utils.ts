import html2canvas from 'html2canvas';

/**
 * Get the background color of an element, falling back to white
 */
export function getElementBackgroundColor(element: HTMLElement, fallback = '#ffffff'): string {
	return getComputedStyle(element).backgroundColor || fallback;
}

/**
 * Capture an HTML element as a canvas using html2canvas
 */
export async function captureElementAsCanvas(
	element: HTMLElement,
	scale = 2,
	backgroundColor?: string
): Promise<HTMLCanvasElement> {
	const bgColor = backgroundColor ?? getElementBackgroundColor(element);
	return html2canvas(element, {
		scale,
		useCORS: true,
		logging: false,
		backgroundColor: bgColor
	});
}
