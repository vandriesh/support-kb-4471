// The problems inside one ticket, counted the desk's way. The causes come from causes.ts, as the
// desk's CauseTable shows them. Reports the desk read as a one-day move (desk-notes.json) are their
// own problem, but they stay counted where they are filed, as readAs() does: under their cause.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemRow = {
  problem: Problem;
  reports: number;
  // Set for one-day: the cause these reports are filed and counted under.
  filedUnder?: string;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function problemRows(
  reports: Report[],
  tickets: readonly number[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemRow[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto !== null && tickets.includes(r.mergedInto));
  const rows: ProblemRow[] = [];
  for (const g of groupByCause(merged, tenantOf)) {
    rows.push({ problem: g.cause, reports: g.reports.length, tenants: g.tenants, firstSeen: g.firstSeen, lastSeen: g.lastSeen });
    if (!readAs(g, oneDayMove)) continue;
    const moved = g.reports.filter((r) => oneDayMove.includes(r.id));
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'one-day',
      reports: moved.length,
      filedUnder: g.cause,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
    });
  }
  return rows;
}
