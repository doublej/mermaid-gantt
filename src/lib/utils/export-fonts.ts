import type { jsPDF } from 'jspdf';
// woff2 (subset, for SVG @font-face so a rasterized standalone SVG carries the font)
import dmSans400Woff2 from '@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2?url';
import dmSans500Woff2 from '@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2?url';
import dmSans700Woff2 from '@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2?url';

/** Font-family value matching the app and the jsPDF-registered font name. */
export const DM_SANS_STACK = '"DM Sans", system-ui, sans-serif';
/** Exact family name registered with jsPDF (svg2pdf matches text by this name). */
export const DM_SANS_FAMILY = 'DM Sans';

// TTFs live in static/ and are served at the site root; jsPDF.addFont needs TTF.
// jsPDF combines (fontStyle, fontWeight) into a single style key:
//   ('normal', 400) -> "normal", ('normal', 700) -> "bold", ('normal', 500) -> "500normal".
// svg2pdf looks up "normal"/"bold", so register bold as ('normal', 700) — NOT
// ('bold', 700), which yields the bogus key "boldbold".
const TTF_URLS: { id: string; style: string; weight: number; url: string }[] = [
	{ id: 'DMSans-Regular', style: 'normal', weight: 400, url: '/fonts/DMSans-Regular.ttf' },
	{ id: 'DMSans-Medium', style: 'normal', weight: 500, url: '/fonts/DMSans-Medium.ttf' },
	{ id: 'DMSans-Bold', style: 'normal', weight: 700, url: '/fonts/DMSans-Bold.ttf' }
];

const WOFF2_URLS = [
	{ weight: 400, url: dmSans400Woff2 },
	{ weight: 500, url: dmSans500Woff2 },
	{ weight: 700, url: dmSans700Woff2 }
];

async function fetchAsBase64(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to load font ${url}: ${res.status}`);
	const buf = new Uint8Array(await res.arrayBuffer());
	let binary = '';
	for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
	return btoa(binary);
}

let cachedFaceCss: Promise<string> | null = null;

/**
 * Build `@font-face` CSS with DM Sans woff2 embedded as data URIs, so an
 * isolated/serialized SVG (the PNG path) renders text in DM Sans without
 * needing the page's loaded webfonts. Cached for the session.
 */
export function getEmbeddedFontFaceCss(): Promise<string> {
	if (!cachedFaceCss) {
		cachedFaceCss = (async () => {
			const faces = await Promise.all(
				WOFF2_URLS.map(async ({ weight, url }) => {
					const b64 = await fetchAsBase64(url);
					return `@font-face{font-family:"DM Sans";font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
				})
			);
			return faces.join('');
		})();
	}
	return cachedFaceCss;
}

type LoadedTtf = { id: string; style: string; weight: number; base64: string };
let cachedTtfs: Promise<LoadedTtf[]> | null = null;

function loadTtfs(): Promise<LoadedTtf[]> {
	if (!cachedTtfs) {
		cachedTtfs = Promise.all(
			TTF_URLS.map(async ({ id, style, weight, url }) => ({
				id,
				style,
				weight,
				base64: await fetchAsBase64(url)
			}))
		);
	}
	return cachedTtfs;
}

/**
 * Register DM Sans (weights 400/500/700) with a jsPDF instance so svg2pdf and
 * native jsPDF text both render in the brand font instead of Helvetica.
 * Sets the active font to DM Sans normal.
 */
export async function registerDmSans(pdf: jsPDF): Promise<void> {
	const ttfs = await loadTtfs();
	for (const { id, style, weight, base64 } of ttfs) {
		const file = `${id}.ttf`;
		pdf.addFileToVFS(file, base64);
		pdf.addFont(file, DM_SANS_FAMILY, style, weight);
	}
	pdf.setFont(DM_SANS_FAMILY, 'normal');
}
