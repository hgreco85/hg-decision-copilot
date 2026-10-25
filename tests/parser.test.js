const test = require('node:test'); const assert = require('node:assert');
const { parseTasks, parseLine } = require('../src/parser.js');

test('text-only line is a valid task with all optional fields null', () => {
  const t = parseLine('Investigar por qué el dashboard tarda', 1);
  assert.equal(t.text, 'Investigar por qué el dashboard tarda');
  for (const k of ['agent', 'lastActivity', 'status', 'urgency', 'value', 'impact']) assert.equal(t[k], null, k);
});
test('pipe-separated fields are extracted', () => {
  const t = parseLine('- [Codex] Write README | last: 2026-10-20 | urgencia: alta | valor: baja', 1);
  assert.deepEqual([t.agent, t.text, t.lastActivity, t.urgency, t.value], ['Codex', 'Write README', '2026-10-20', 3, 1]);
});
test('Name: prefix, inline key:value and DD/MM/YYYY date', () => {
  const t = parseLine('Claude: redactar README (24/10/2026) urgencia:media', 1);
  assert.deepEqual([t.agent, t.text, t.lastActivity, t.urgency], ['Claude', 'redactar README', '2026-10-24', 2]);
});
test('@mention, status keyword and numeric levels', () => {
  const t = parseLine('@devin weekly PR summary DONE | value: 5 | impact: 1', 1);
  assert.deepEqual([t.agent, t.status, t.value, t.impact, t.text], ['devin', 'done', 3, 1, 'weekly PR summary']);
});
test('multi-line paste: blank lines and # comments skipped', () => {
  const ts = parseTasks('# header\n\nA task\r\n  \nAnother task\n');
  assert.deepEqual(ts.map((t) => t.text), ['A task', 'Another task']);
});
test('invalid date is not invented', () => {
  assert.equal(parseLine('task 45/13/2026', 1).lastActivity, null);
});
