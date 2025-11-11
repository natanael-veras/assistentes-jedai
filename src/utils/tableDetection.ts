
// Simple table detection utilities

export interface TableData {
  headers: string[];
  rows: string[][];
}

export function parseMarkdownTable(tableText: string): TableData | null {
  const lines = tableText.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 3) return null;
  
  // Parse table headers
  const headers = lines[0]
    .split('|')
    .slice(1, -1)
    .map(header => header.trim())
    .filter(header => header.length > 0);
  
  // Parse table rows (skip separator line)
  const dataLines = lines.slice(2);
  const rows = dataLines.map(line => 
    line.split('|')
      .slice(1, -1)
      .map(cell => cell.trim())
      .filter((_, index) => index < headers.length)
  ).filter(row => row.length > 0);

  if (headers.length > 0 && rows.length > 0) {
    return { headers, rows };
  }
  
  return null;
}
