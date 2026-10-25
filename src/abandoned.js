// Abandonment Checker: inactive > N days (default 7). No date => "no info", never "abandoned".
(function (root) {
  const daysBetween = (root.DC && root.DC.daysBetween) || (typeof require !== 'undefined' && require('./prioritize.js').daysBetween);
  function checkAbandoned(tasks, opts = {}) {
    const today = opts.today || new Date().toISOString().slice(0, 10);
    const days = Number.isFinite(+opts.days) && +opts.days > 0 ? +opts.days : 7;
    const abandoned = [], noInfo = [];
    for (const t of tasks) {
      if (t.status === 'done') continue;
      if (!t.lastActivity) { noInfo.push({ taskId: t.id }); continue; }
      const d = daysBetween(t.lastActivity, today);
      if (d > days) abandoned.push({ taskId: t.id, days: d });
    }
    abandoned.sort((a, b) => b.days - a.days);
    return { days, abandoned, noInfo };
  }
  const api = { checkAbandoned };
  root.DC = Object.assign(root.DC || {}, api);
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
