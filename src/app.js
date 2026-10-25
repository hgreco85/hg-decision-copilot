// Renderer + wiring. All work happens in this browser; nothing is sent anywhere.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'hgdc.input';
  let last = null;

  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function who(t) { return t.agent ? `<span class="agent">${esc(t.agent)}</span> · ` : '<span class="muted">no agent</span> · '; }

  function analyze() {
    const text = $('tasks').value;
    if ($('remember').checked) localStorage.setItem(KEY, text);
    const tasks = DC.parseTasks(text);
    if (!tasks.length) {
      $('dups').innerHTML = '<p class="muted">Nothing to analyze — paste at least one task line.</p>';
      $('prio').innerHTML = ''; $('aband').innerHTML = ''; $('summary').textContent = '';
      last = null; setExport(false); return;
    }
    const day = today();
    const duplicates = DC.findDuplicates(tasks);
    const priorities = DC.prioritize(tasks, { today: day });
    const abandoned = DC.checkAbandoned(tasks, { today: day, days: $('days').value });
    last = { analyzedOn: day, tasks, duplicates, priorities, abandoned };
    const byId = new Map(tasks.map((t) => [t.id, t]));
    render(byId, duplicates, priorities, abandoned);
    $('summary').textContent = `${tasks.length} tasks · ${duplicates.length} duplicate groups · ${abandoned.abandoned.length} abandoned`;
    setExport(true);
  }

  function render(byId, duplicates, priorities, ab) {
    $('dups').innerHTML = duplicates.length ? duplicates.map((g) => {
      const best = g.pairs.reduce((m, p) => (p.score > m.score ? p : m));
      return `<div class="card ${g.crossAgent ? 'cross' : ''}">
        <span class="score">${Math.round(best.score * 100)}% similar</span>
        ${g.crossAgent ? `<span class="badge">cross-agent: ${g.agents.map(esc).join(' vs ')}</span>` : '<span class="badge">same agent / unassigned</span>'}
        ${g.taskIds.map((id) => `<div class="task">#${id} ${who(byId.get(id))}${esc(byId.get(id).text)}</div>`).join('')}
        <div class="why">Why: ${best.shared.length} shared normalized words → ${best.shared.map((w) => `<span class="chip">${esc(w)}</span>`).join('')}${g.crossAgent ? ' — two agents may be doing the same work.' : ''}</div>
      </div>`;
    }).join('') : '<p class="muted">No duplicates found (threshold: ≥60% similarity and ≥2 shared words).</p>';

    $('prio').innerHTML = priorities.map((p) => {
      const t = byId.get(p.taskId);
      const parts = Object.entries(p.parts).map(([k, v]) => `${DC.LABEL[k]} ${Math.round(v * 100)}`).join(' · ');
      const miss = p.missing.map((k) => DC.LABEL[k]).join(', ');
      return `<li><span class="score">${p.score == null ? 'no data' : p.score}</span>
        <div class="task">${who(t)}${esc(t.text)}</div>
        <div class="why">${p.score == null ? 'No criteria data — not scored.' : `${parts} (${p.coverage}/4 criteria)`}${miss && p.score != null ? ` · no data: ${esc(miss)}` : ''}</div></li>`;
    }).join('');

    $('aband').innerHTML = (ab.abandoned.length ? ab.abandoned.map((a) => {
      const t = byId.get(a.taskId);
      return `<div class="card"><span class="score">${a.days} days</span><div class="task">${who(t)}${esc(t.text)}</div><div class="why">Last activity ${esc(t.lastActivity)} — more than ${ab.days} days without activity.</div></div>`;
    }).join('') : `<p class="muted">Nothing inactive for more than ${ab.days} days.</p>`) +
      (ab.noInfo.length ? `<div class="why">No information (no date, not marked abandoned): ${ab.noInfo.map((n) => '#' + n.taskId + ' ' + esc(byId.get(n.taskId).text)).join(' · ')}</div>` : '');
  }

  function setExport(on) { $('exportJson').disabled = !on; $('exportCsv').disabled = !on; }
  function download(name, type, body) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  $('analyze').addEventListener('click', analyze);
  $('sample').addEventListener('click', () => { $('tasks').value = DC.SAMPLE; analyze(); });
  $('days').addEventListener('change', () => last && analyze());
  $('remember').addEventListener('change', (e) => { if (e.target.checked) localStorage.setItem(KEY, $('tasks').value); else localStorage.removeItem(KEY); });
  $('exportJson').addEventListener('click', () => last && download('decision-copilot.json', 'application/json', DC.toJSON(last)));
  $('exportCsv').addEventListener('click', () => last && download('decision-copilot.csv', 'text/csv', DC.toCSV(last)));
  if (/[?  try { const saved]demo=1/.test(location.search)) { $('tasks').value = DC.SAMPLE; analyze(); }
  else try { const saved = localStorage.getItem(KEY); if (saved) { $('tasks').value = saved; $('remember').checked = true; } } catch (e) { /* storage disabled */ }
})();
