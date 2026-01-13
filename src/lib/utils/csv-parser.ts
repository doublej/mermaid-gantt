// CSV parser with support for quoted fields, escaped quotes, and newlines

export interface CSVParseResult {
	headers: string[];
	rows: string[][];
	errors: string[];
}

/**
 * Parse CSV content into headers and rows
 * Handles: quoted fields, commas in values, escaped quotes (""), newlines in quoted fields
 */
export function parseCSV(content: string): CSVParseResult {
	const errors: string[] = [];
	const rows: string[][] = [];

	if (!content.trim()) {
		return { headers: [], rows: [], errors: ['Empty CSV content'] };
	}

	const lines = splitCSVLines(content);

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const line = lines[lineNum];
		if (!line.trim()) continue;

		const result = parseCSVLine(line);
		if (result.error) {
			errors.push(`Line ${lineNum + 1}: ${result.error}`);
		}
		if (result.fields.length > 0) {
			rows.push(result.fields);
		}
	}

	if (rows.length === 0) {
		return { headers: [], rows: [], errors: ['No valid rows found'] };
	}

	const headers = rows[0];
	const dataRows = rows.slice(1);

	// Validate row lengths
	for (let i = 0; i < dataRows.length; i++) {
		if (dataRows[i].length !== headers.length) {
			errors.push(
				`Row ${i + 2}: Expected ${headers.length} columns, got ${dataRows[i].length}`
			);
		}
	}

	return { headers, rows: dataRows, errors };
}

/**
 * Split CSV content into logical lines (handling quoted newlines)
 */
function splitCSVLines(content: string): string[] {
	const lines: string[] = [];
	let currentLine = '';
	let inQuotes = false;

	for (let i = 0; i < content.length; i++) {
		const char = content[i];

		if (char === '"') {
			// Check for escaped quote
			if (inQuotes && content[i + 1] === '"') {
				currentLine += '""';
				i++;
			} else {
				inQuotes = !inQuotes;
				currentLine += char;
			}
		} else if (char === '\n' && !inQuotes) {
			lines.push(currentLine);
			currentLine = '';
		} else if (char === '\r' && !inQuotes) {
			// Handle CRLF
			if (content[i + 1] === '\n') {
				i++;
			}
			lines.push(currentLine);
			currentLine = '';
		} else {
			currentLine += char;
		}
	}

	// Don't forget last line
	if (currentLine) {
		lines.push(currentLine);
	}

	return lines;
}

/**
 * Parse a single CSV line into fields
 */
function parseCSVLine(line: string): { fields: string[]; error?: string } {
	const fields: string[] = [];
	let current = '';
	let inQuotes = false;
	let i = 0;

	while (i < line.length) {
		const char = line[i];

		if (!inQuotes) {
			if (char === '"') {
				inQuotes = true;
				i++;
			} else if (char === ',') {
				fields.push(current.trim());
				current = '';
				i++;
			} else {
				current += char;
				i++;
			}
		} else {
			// Inside quotes
			if (char === '"') {
				// Check for escaped quote
				if (line[i + 1] === '"') {
					current += '"';
					i += 2;
				} else {
					inQuotes = false;
					i++;
				}
			} else {
				current += char;
				i++;
			}
		}
	}

	// Add last field
	fields.push(current.trim());

	if (inQuotes) {
		return { fields, error: 'Unclosed quote' };
	}

	return { fields };
}

/**
 * Escape a value for CSV output
 */
export function escapeCSVValue(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
