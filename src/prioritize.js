// Prioritizer: valor, urgencia, antigüedad, impacto — 25% each, missing data excluded (never invented).
(function (root) {
  const WEIGHTS = { value: 0.25, urgency: 0.25, age: 0.25, impact: 0.25 };
  const AGE_CAP_DAYS = 30;
  const LABEL = { value: 'valor', urgency: 'urgencia', age: 'antigüedad', impact: 'impacto' };

  function daysBetween(iso, today) {
    const a = Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
    const b = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
    return Math.round((b - a) / 86400000);
  }

  function scoreTask(t, today) {
    const parts = {};
    if (t.value != null) parts.value = (t.value - 1) / 2;
    if (t.urgency != null) parts.urgency = (t.urgency - 1) / 2;
    if (t.impact != null) parts.impact = (t.impact - 1) / 2;
    if (t.lastActivity) parts.age = Math.min(Math.max(daysBetween(t.lastActivity, today), 0), AGE_CAP_DAYS) / AGE_CAP_DAYS;
    const keys = Object.keys(parts);
    if (!keys.length) return { taskId: t.id, score: null, coverage: 0, parts, missing: Object.keys(WEIGHTS) };
    const wsum = keys.reduce((s, k) => s + WEIGHTS[k], 0);
    const score = keys.reduce((s, k) => s + parts[k] * WEIGHTS[k], 0) / wsum;
    return {
      taskId: t.id,
      score: Math.round(score * 100),
      coverage: keys.length,
      parts,
      missing: Object.keys(WEIGHTS).filter((k) => !(k in parts)),
    };
  }

  function prioritize(tasks, opts = {}) {
    const today = opts.today || new Date().toISOString().slice(0, 10);
    return tasks.filter((t) => t.status !== 'done').map((t) => scoreTask(t, today))
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || b.coverage - a.coverage || a.taskId - b.taskId);
  }

  const api = { prioritize, scoreTask, daysBetween, WEIGHTS, LABEL };
  root.DC = Object.assign(root.DC || {}, api);
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
