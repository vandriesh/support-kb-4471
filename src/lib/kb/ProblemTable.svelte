<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemRows, type Problem } from '#lib/kb/problems';

  // `issues` maps a problem to the number of the GitHub issue in `repo` that now tracks it.
  let {
    ticket,
    repo,
    issues = {},
  }: { ticket: number; repo: string; issues?: Partial<Record<Problem, number>> } = $props();

  const unique = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const rows = $derived(problemRows(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{unique}</strong> reports merged into #{ticket} · <strong>{rows.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as row (row.problem)}
      <tr>
        <td><code>{row.problem}</code></td>
        <td>{row.reports}</td>
        <td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
        <td>
          {#if issues[row.problem]}<a href="{repo}/issues/{issues[row.problem]}">issue #{issues[row.problem]}</a>{:else}none{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each rows.filter((r) => r.filedUnder) as row (row.problem)}
  <p class="note">The {row.reports} <code>{row.problem}</code> reports are filed under <code>{row.filedUnder}</code>, so they count there too.</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
