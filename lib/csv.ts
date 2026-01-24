// lib/csv.ts

export type CsvRow = Array<string | number | boolean | null | undefined>;

/**
 * CSV minimal compatible Excel (JP)
 * - UTF-8 BOM
 * - CRLF
 * - quoting si nécessaire (", \n, \r, ,)
 */
export function toCsv(
  header: string[],
  rows: CsvRow[],
  opts?: { bom?: boolean }
): string {
  const bom = opts?.bom ?? true;

  const lines: string[] = [];
  lines.push(header.map(escapeCell).join(","));
  for (const r of rows) lines.push(r.map(escapeCell).join(","));

  const body = lines.join("\r\n");
  return bom ? "\uFEFF" + body : body;
}

function escapeCell(v: CsvRow[number]): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  const mustQuote = /[",\r\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

/** Format stable pour CSV : YYYY-MM-DD HH:mm:ss (JST) */
export function formatJstForCsv(d: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
