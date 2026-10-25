// Parser: turns messy pasted text into task objects. Missing fields stay null.
(function (root) {
  const LEVELS = {
    alta: 3, alto: 3, high: 3, urgente: 3, critica: 3, critical: 3,
    media: 2, medio: 2, medium: 2, med: 2, normal: 2,
    baja: 1, bajo: 1, low: 1,
  };
  const STATUS_WORDS = {
    todo: 'todo', pendiente: 'todo', pending: 'todo',
    doing: 'doing', 'en curso': 'doing', 'in progress': 'doing', wip: 'doing',
    done: 'done', hecho: 'done', terminado: 'done', completed: 'done',
    bloqueado: 'blocked', blocked: 'blocked',
  };
  const FIELD_KEYS = {
    agent: ['agente', 'agent', 'owner', 'responsable'],
    date: ['last', 'ultima', 'última', 'fecha', 'updated', 'last activity', 'ultima actividad', 'última actividad'],
    status: ['estado', 'status'],
    urgency: ['urgencia', 'urgency', 'u'],
    value: ['valor', 'value', 'v'],
    impact: ['impacto', 'impact', 'i'],
  };

  function level(raw) {
    if (raw == null) return null;
    const s = String(raw).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/^[1-5]$/.test(s)) return Number(s) <= 2 ? 1 : Number(s) === 3 ? 2 : 3;
    return LEVELS[s] || null;
  }

  function parseDate(s) {
    let m = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (m) return valid(+m[1], +m[2], +m[3]);
    m = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/); // DD/MM/YYYY (AR convention)
    if (m) return valid(+m[3], +m[2], +m[1]);
    return null;
  }
  function valid(y, mo, d) {
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function keyFor(k) {
    const n = k.trim().toLowerCase();
    for (const [field, keys] of Object.entries(FIELD_KEYS)) if (keys.includes(n)) return field;
    return null;
  }

  function parseLine(line, id) {
    const raw = line;
    let s = line.replace(/^\s*(?:[-*•]|\d+[.)]|\[[ x]\])\s+/i, '').trim();
    const t = { id, raw, text: '', agent: null, lastActivity: null, status: null, urgency: null, value: null, impact: null };

    // Split into segments on | or ; — first non-field segment is the text.
    const segs = s.split(/\s*[|;]\s*/);
    const textParts = [];
    for (const seg of segs) {
      const kv = seg.match(/^([A-Za-zÁÉÍÓÚáéíóúñ ]{1,20})\s*[:=]\s*(.+)$/);
      const field = kv && keyFor(kv[1]);
      if (field) { assign(t, field, kv[2]); continue; }
      textParts.push(seg);
    }
    s = textParts.join(' ');

    // [Agent] or (Agent) prefix, @agent mention, "Agent:" prefix
    let m = s.match(/^\[([^\]]{1,30})\]\s*/) || s.match(/^\(([^)]{1,30})\)\s*/);
    if (m && !t.agent) { t.agent = m[1].trim(); s = s.slice(m[0].length); }
    m = s.match(/(^|\s)@([\w.-]{2,30})/);
    if (m && !t.agent) { t.agent = m[2]; s = s.replace(m[0], ' '); }
    m = s.match(/^([A-Z][\w.-]{1,20}(?: [A-Z][\w.-]{1,20})?):\s+/);
    if (m && !t.agent && !keyFor(m[1])) { t.agent = m[1]; s = s.slice(m[0].length); }

    // Inline key:value tokens inside text (e.g. "urgencia:alta")
    s = s.replace(/\b(urgencia|urgency|valor|value|impacto|impact|estado|status)\s*[:=]\s*([\wáéíóú-]+)/gi, (all, k, v) => { assign(t, keyFor(k), v); return ' '; });

    if (!t.lastActivity) {
      const d = parseDate(s);
      if (d) { t.lastActivity = d; s = s.replace(/\(?\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b\)?/, ' '); }
    }
    if (!t.status) {
      const sm = s.match(/\b(TODO|DOING|DONE|WIP|BLOCKED)\b/) || s.match(/[—–-]\s*(hecho|bloqueado|pendiente|done|blocked|wip)\s*$/i);
      if (sm) { t.status = STATUS_WORDS[sm[1].toLowerCase()]; s = s.replace(sm[0], ' '); }
    }
    t.text = s.replace(/\s+/g, ' ').replace(/^[\s,:—–-]+|[\s,:—–-]+$/g, '').trim();
    return t;
  }

  function assign(t, field, v) {
    v = String(v).trim();
    if (field === 'agent') t.agent = v;
    else if (field === 'date') t.lastActivity = parseDate(v);
    else if (field === 'status') t.status = STATUS_WORDS[v.toLowerCase()] || v.toLowerCase();
    else t[field] = level(v);
  }

  function parseTasks(text) {
    return String(text || '').split(/\r?\n/)
      .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
      .map((l, i) => parseLine(l, i + 1))
      .filter((t) => t.text.length > 0);
  }

  const api = { parseTasks, parseLine, parseDate, level };
  root.DC = Object.assign(root.DC || {}, api);
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
