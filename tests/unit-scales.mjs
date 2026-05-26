import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../js/scales.js', import.meta.url), 'utf8');
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(code, context, { filename: 'scales.js' });

const Scoring = context.window.ACT_SCORING;
const SCALES = context.window.ACT_SCALES;

function fill(ids, value) {
  return Object.fromEntries(ids.map(id => [id, value]));
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('scale definitions are complete', () => {
  assert.deepEqual(Object.keys(SCALES), ['AAQ-II', 'CFQ-7', 'CFQ-13', 'TSSQ', 'FFMQ-39', 'WHO-5', 'VQ']);
  assert.equal(SCALES['AAQ-II'].items.length, 7);
  assert.equal(SCALES['CFQ-7'].items.length, 7);
  assert.equal(SCALES['CFQ-13'].items.length, 13);
  assert.equal(SCALES.TSSQ.items.length, 20);
  assert.equal(SCALES['FFMQ-39'].items.length, 39);
  assert.equal(SCALES['WHO-5'].items.length, 5);
  assert.equal(SCALES.VQ.items.length, 10);
});

test('AAQ-II boundaries', () => {
  const ids = SCALES['AAQ-II'].items.map(x => x.id);
  assert.equal(Scoring.scoreAAQ2(fill(ids, 1)).total, 7);
  assert.equal(Scoring.scoreAAQ2(fill(ids, 7)).total, 49);
  assert.equal(Scoring.scoreAAQ2({ ...fill(ids, 4), AAQ2_01: 0 }), null);
});

test('CFQ variants', () => {
  const ids13 = SCALES['CFQ-13'].items.map(x => x.id);
  assert.equal(Scoring.scoreCFQ(fill(SCALES['CFQ-7'].items.map(x => x.id), 1), 'cfq7').total, 7);
  const cfq13 = Scoring.scoreCFQ(fill(ids13, 7), 'cfq13');
  assert.equal(cfq13.fusion, 63);
  assert.equal(cfq13.defusion, 28);
});

test('TSSQ subscales only', () => {
  const result = Scoring.scoreTSSQ(fill(SCALES.TSSQ.items.map(x => x.id), 1));
  assert.equal(result.active, 7);
  assert.equal(result.conceptualized_self, 6);
  assert.equal(result.perspective_taking, 3);
  assert.equal(result.present_moment, 4);
  assert.equal(Object.hasOwn(result, 'total'), false);
});

test('FFMQ reverse scoring midpoint', () => {
  const result = Scoring.scoreFFMQ(fill(SCALES['FFMQ-39'].items.map(x => x.id), 3));
  assert.equal(result.observing, 24);
  assert.equal(result.nonjudging, 24);
  assert.equal(result.acting_with_awareness, 24);
  assert.equal(result.nonreactivity, 21);
});

test('WHO-5 caution flag', () => {
  const ids = SCALES['WHO-5'].items.map(x => x.id);
  assert.equal(Scoring.scoreWHO5(fill(ids, 5)).caution_flag, false);
  assert.equal(Scoring.scoreWHO5(fill(ids, 0)).caution_flag, true);
  assert.equal(Scoring.scoreWHO5({ WHO5_01: 1, WHO5_02: 4, WHO5_03: 4, WHO5_04: 4, WHO5_05: 4 }).caution_flag, true);
});

test('VQ progress and obstruction', () => {
  const response = {};
  SCALES.VQ.items.forEach(item => { response[item.id] = 0; });
  ['VQ_03', 'VQ_04', 'VQ_05', 'VQ_07', 'VQ_09'].forEach(id => { response[id] = 6; });
  const result = Scoring.scoreVQ(response);
  assert.equal(result.progress, 30);
  assert.equal(result.obstruction, 0);
});

let passed = 0;
for (const item of tests) {
  item.fn();
  passed += 1;
  console.log(`ok ${passed} - ${item.name}`);
}

console.log(`1..${tests.length}`);
