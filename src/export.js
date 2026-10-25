// Exporter: JSON and CSV of one analysis result.
(function (root) {
  function toJSON(r) { return JSON.stringify(r, null, 2); }
  function cell(v) {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(r) {
    const groupOf = new Map();
    r.duplicates.forEach((g, i) => g.taskIds.forEach((id) => groupOf.set(id, i + 1)));
    const rank = new Map(r.priorities.map((p) => [p.taskId, p]));
    const ab = new Map(r.abandoned.abandoned.map((a) => [a.taskId, a.days]));
    const noInfo = new Set(r.abandoned.noInfo.map((a) => a.taskId));
    const head = ['id', 'text', 'agent', 'last_activity', 'status', 'urgency', 'value', 'impact', 'duplicate_group', 'priority_score', 'criteria_used', 'abandoned_days', 'abandoned_info'];
    const rows = r.tasks.map((t) => {
      const p = rank.get(t.id);
      return [t.id, t.text, t.agent, t.lastActivity, t.status, t.urgency, t.value, t.impact,
        groupOf.get(t.id) || '', p ? (p.score ?? 'no data') : '', p ? `${p.coverage}/4` : '',
        ab.get(t.id) ?? '', noInfo.has(t.id) ? 'no info' : ''].map(cell).join(',');
    });
    return [head.join(','), ...rows].join('\n');
  }
  const api = { toJSON, toCSV };
  root.DC = Object.assign(root.DC || {}, api);
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
