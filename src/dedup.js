// Duplicate Detector (kernel): deterministic normalized shared-word comparison.
(function (root) {
  const STOP = new Set((
    // Spanish
    'el la los las un una unos unas de del al a en y o u que con por para sin sobre se su sus es son lo le les mi tu este esta estos estas ese esa eso ya no si mas muy como pero tambien hay nuevo nueva nuevos ' +
    // English
    'the a an of to in on for and or with by from at is are be it this that these those as into our my your new ' +
    // generic task verbs / filler (irrelevant for identity of the work)
    'fix arreglar corregir add agregar anadir update actualizar revisar review hacer do make crear create check chequear ver mejorar improve implementar implement terminar finish task tarea pendiente todo please porfa urgente asap'
  ).split(/\s+/));

  // Tiny deterministic ES->EN canonical map so the same work in two languages shares words.
  const CANON = {
    redactar: 'write', escribir: 'write', documentar: 'document', paso: 'step', migrar: 'migrate', reporte: 'report',
    informe: 'report', resumen: 'summary', semanal: 'weekly', prueba: 'test', error: 'bug', factura: 'invoice',
    panel: 'dashboard', contrato: 'contract', proveedor: 'vendor', ajuste: 'setting', configuracion: 'setting',
  };

  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9#\s-]/g, ' ').replace(/-/g, ' ');
  }
  function stem(w) {
    if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
    return w;
  }
  function tokenize(s) {
    const out = new Set();
    for (const w of normalize(s).split(/\s+/)) {
      if (!w || w.length < 2 || STOP.has(w)) continue;
      const st = stem(w);
      out.add(CANON[st] || CANON[w] || st);
    }
    return out;
  }
  function similarity(a, b) {
    const A = a instanceof Set ? a : tokenize(a);
    const B = b instanceof Set ? b : tokenize(b);
    const shared = [...A].filter((x) => B.has(x));
    const union = new Set([...A, ...B]).size;
    return { score: union ? shared.length / union : 0, shared };
  }

  function findDuplicates(tasks, opts = {}) {
    const threshold = opts.threshold ?? 0.6;
    const minShared = opts.minShared ?? 2;
    const toks = tasks.map((t) => tokenize(t.text));
    const parent = tasks.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const pairs = [];
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const { score, shared } = similarity(toks[i], toks[j]);
        if (score >= threshold && shared.length >= minShared) {
          pairs.push({ a: tasks[i].id, b: tasks[j].id, score: Math.round(score * 100) / 100, shared });
          parent[find(i)] = find(j);
        }
      }
    }
    const byRoot = new Map();
    tasks.forEach((t, i) => {
      const r = find(i);
      if (!byRoot.has(r)) byRoot.set(r, []);
      byRoot.get(r).push(t);
    });
    const groups = [];
    for (const members of byRoot.values()) {
      if (members.length < 2) continue;
      const ids = new Set(members.map((m) => m.id));
      const agents = [...new Set(members.map((m) => m.agent).filter(Boolean))];
      groups.push({
        taskIds: members.map((m) => m.id),
        pairs: pairs.filter((p) => ids.has(p.a)),
        agents,
        crossAgent: agents.length >= 2,
      });
    }
    groups.sort((x, y) => (y.crossAgent - x.crossAgent) || (Math.max(...y.pairs.map((p) => p.score)) - Math.max(...x.pairs.map((p) => p.score))));
    return groups;
  }

  const api = { normalize, tokenize, similarity, findDuplicates, STOP, CANON };
  root.DC = Object.assign(root.DC || {}, api);
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
