const test = require('node:test'); const assert = require('node:assert');
const { parseTasks } = require('../src/parser.js');
const { prioritize, scoreTask } = require('../src/prioritize.js');
const { checkAbandoned } = require('../src/abandoned.js');
const { toCSV } = require('../src/export.js');
const today = '2026-10-25';

test('all four criteria present: equal 25% weights', () => {
  const [t] = parseTasks('x task | valor: alta | urgencia: baja | impacto: media | 2026-10-10');
  const r = scoreTask(t, today); // value 1, urgency 0, impact .5, age 15/30=.5 -> 50
  assert.equal(r.coverage, 4); assert.equal(r.score, 50);
});
test('missing criteria are excluded, not scored as zero', () => {
  const [t] = parseTasks('x task | valor: alta');
  const r = scoreTask(t, today);
  assert.equal(r.score, 100); assert.equal(r.coverage, 1);
  assert.deepEqual(r.missing, ['urgency', 'age', 'impact']);
});
test('no data at all -> score null, ranked last', () => {
  const r = prioritize(parseTasks('plain task\nother | urgencia: baja'), { today });
  assert.equal(r[r.length - 1].score, null); assert.equal(r[r.length - 1].coverage, 0);
});
test('done tasks are not prioritized or flagged', () => {
  const ts = parseTasks('old thing DONE | 2026-01-01');
  assert.equal(prioritize(ts, { today }).length, 0);
  assert.equal(checkAbandoned(ts, { today }).abandoned.length, 0);
});
test('abandoned: default 7 days, boundary exclusive', () => {
  const ts = parseTasks('a | 2026-10-18\nb | 2026-10-17\nc');
  const r = checkAbandoned(ts, { today });
  assert.equal(r.days, 7);
  assert.deepEqual(r.abandoned, [{ taskId: 2, days: 8 }]);
  assert.deepEqual(r.noInfo, [{ taskId: 3 }]);
});
test('abandoned threshold is configurable', () => {
  const ts = parseTasks('a | 2026-10-18\nb | 2026-10-24');
  assert.equal(checkAbandoned(ts, { today, days: 30 }).abandoned.length, 0);
  assert.equal(checkAbandoned(ts, { today, days: 0.5 }).days, 0.5);
  assert.equal(checkAbandoned(ts, { today, days: 'x' }).days, 7);
});
test('CSV export escapes commas/quotes and marks missing data', () => {
  const tasks = parseTasks('He said "hi", then left');
  const csv = toCSV({ tasks, duplicates: [], priorities: prioritize(tasks, { today }), abandoned: checkAbandoned(tasks, { today }) });
  assert.match(csv, /"He said ""hi"", then left"/);
  assert.match(csv, /no data,0\/4,,no info$/);
});
