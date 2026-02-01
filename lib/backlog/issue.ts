// lib/backlog/issue.ts
type Primitive = string | number | boolean | null;
type Payload = Record<string, Primitive>;

export function buildIssueSummary(formName: string, formSlug: string) {
  const name = (formName || "Form").trim();
  const slug = (formSlug || "").trim();
  return slug ? `[FormGate] ${name} (/` + slug + `)` : `[FormGate] ${name}`;
}

export function formatTokyoTimestamp(now = new Date()) {
  // JST formatting without heavy libs
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  // "YYYY/MM/DD HH:MM:SS" (ja-JP)
  return `${fmt.format(now)} JST`;
}

export function buildIssueDescription(args: {
  formName: string;
  formSlug: string;
  submissionId: string;
  payload: Payload;
}) {
  const ts = formatTokyoTimestamp();
  const lines: string[] = [];
  lines.push(`New submission received.`);
  lines.push(`Time: ${ts}`);
  lines.push(`Form: ${args.formName} (/${args.formSlug})`);
  lines.push(`Submission ID: ${args.submissionId}`);
  lines.push("");
  lines.push("Payload:");
  for (const [k, v] of Object.entries(args.payload ?? {})) {
    lines.push(`- ${k}: ${String(v)}`);
  }
  return lines.join("\n");
}
