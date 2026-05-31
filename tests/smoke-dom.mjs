import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('..', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');

const index = read('index.html');
const css = read('css/styles.css');
const app = read('js/app.js');
const sw = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('PWA shell references required assets', () => {
  assert.match(index, /css\/styles\.css/);
  assert.match(index, /js\/scales\.js/);
  assert.match(index, /js\/app\.js/);
  assert.match(index, /manifest\.webmanifest/);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.lang, 'ja');
  ['index.html', 'css/styles.css', 'js/scales.js', 'js/app.js', 'icons/icon.svg'].forEach(asset => {
    assert.match(sw, new RegExp(asset.replace(/[./]/g, m => `\\${m}`)));
  });
});

test('bottom navigation has five primary items', () => {
  const matches = [...index.matchAll(/class="nav-btn"/g)];
  assert.equal(matches.length, 5);
  ['home', 'tasks', 'care', 'scales', 'settings'].forEach(view => {
    assert.match(index, new RegExp(`data-view="${view}"`));
  });
});

test('major integrated views exist', () => {
  ['renderHome', 'renderTasks', 'renderCare', 'renderScales', 'renderSettings', 'renderCheckin'].forEach(name => {
    assert.match(app, new RegExp(`function ${name}\\(`));
  });
  ['renderWBSList', 'renderWBSGantt', 'renderTaskMatrix', 'renderTaskMasterSettings', 'normalizeImportedData', 'convertActToolState', 'convertTaskToolState'].forEach(name => {
    assert.match(app, new RegExp(`function ${name}\\(`));
  });
  ['AAQ-II', 'WHO-5', 'FFMQ-39', 'VQ'].forEach(name => {
    assert.match(read('js/scales.js'), new RegExp(name));
  });
  ['owners', 'tags', 'stress_locations', 'stress_areas', 'stressKey', 'daily_logs', 'smxData'].forEach(token => {
    assert.match(app, new RegExp(token));
  });
  ['normalizeGasUrl', 'syncToSheets', 'loadFromSheetsByJsonp', 'scheduleSheetsSync'].forEach(name => {
    assert.match(app, new RegExp(`function ${name}\\(`));
  });
});

test('clinical safety wording avoids diagnosis/treatment claims', () => {
  const allText = `${index}\n${app}\n${read('README.md')}`;
  ['うつ病です', '治ります', '診断します', '治療します'].forEach(forbidden => {
    assert.equal(allText.includes(forbidden), false);
  });
  assert.match(allText, /診断・治療/);
});

test('mobile and design constraints are represented', () => {
  assert.match(css, /min-height:\s*44px/);
  assert.equal(/font-size:\s*[^;]*vw/.test(css), false);
  assert.equal(/letter-spacing:\s*-/.test(css), false);
  assert.equal(/<table/i.test(index + app), false);
  assert.equal(/gradient|bokeh|orb/i.test(css), false);
});

test('task and stress surfaces preserve previous tool concepts', () => {
  ['担当（複数選択可）', '項目（複数選択可）', '開始日', '終了日', '緊急', '重要', '進捗', '工数', '期間', 'フラグ', '4象限', '場所×部位', 'ストレスマトリクス'].forEach(token => {
    assert.match(app, new RegExp(token));
  });
  ['moveTask', 'moveCategory', 'moveOwner', 'moveTag', 'resetTaskMasters'].forEach(token => {
    assert.match(app, new RegExp(`function ${token}\\(`));
  });
  assert.match(app, /uniqueCategoryId/);
  ['Strategic', 'Technical', 'People', 'Operational', 'External'].forEach(token => {
    assert.match(app, new RegExp(token));
  });
});

let passed = 0;
for (const item of tests) {
  item.fn();
  passed += 1;
  console.log(`ok ${passed} - ${item.name}`);
}

console.log(`1..${tests.length}`);
