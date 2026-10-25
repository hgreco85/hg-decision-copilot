const test = require('node:test'); const assert = require('node:assert');
const { parseTasks } = require('../src/parser.js');
const { findDuplicates, similarity, tokenize } = require('../src/dedup.js');
const fs = require('fs'); const path = require('path');

test('normalization: case, accents, stopwords, generic verbs, plurals', () => {
  assert.deepEqual([...tokenize('Arreglar los Reportes de Facturación')].sort(), ['facturacion', 'report']);
});
test('reworded same task across agents is grouped with evidence', () => {
  const g = findDuplicates(parseTasks('[Codex] Write README with setup steps for the invoice parser\nClaude: redactar README con pasos de setup del invoice parser'));
  assert.equal(g.length, 1);
  assert.ok(g[0].crossAgent);
  assert.deepEqual(g[0].agents, ['Codex', 'Claude']);
  assert.ok(g[0].pairs[0].score >= 0.6);
  assert.ok(g[0].pairs[0].shared.includes('readme'));
});
test('deterministic: same input gives same output', () => {
  const s = fs.readFileSync(path.join(__dirname, '../samples/messy-tasks.txt'), 'utf8');
  assert.deepEqual(findDuplicates(parseTasks(s)), findDuplicates(parseTasks(s)));
});

// Negative cases: must NOT be flagged as duplicates
const NEG = [
  ['fix login bug on mobile Safari', 'fix logout bug on Android app'],
  ['Add dark mode to settings page', 'Add export button to settings page'],
  ['update dependencies of the scraper', 'update dependencies of the dashboard'],
  ['Revisar contrato con proveedor de hosting', 'Revisar contrato laboral de Juan'],
  ['Write tests', 'Write docs'],
  ['deploy', 'deploy'.replace('deploy', 'rollback')],
];
for (const [a, b] of NEG) {
  test(`negative: "${a}" vs "${b}" is not a duplicate`, () => {
    assert.equal(findDuplicates(parseTasks(`${a}\n${b}`)).length, 0, JSON.stringify(similarity(a, b)));
  });
}
test('negative: only one shared word is never enough even at high ratio', () => {
  assert.equal(findDuplicates(parseTasks('README\nREADME')).length, 0);
});
test('sample: exactly the 3 planted duplicate groups, near-misses excluded', () => {
  const ts = parseTasks(fs.readFileSync(path.join(__dirname, '../samples/messy-tasks.txt'), 'utf8'));
  const g = findDuplicates(ts).map((x) => x.taskIds.join('+')).sort();
  assert.deepEqual(g, ['1+2', '11+12', '3+4']);
});
