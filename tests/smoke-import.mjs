import fs from 'node:fs';
import assert from 'node:assert/strict';

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const bundled = '/Users/yuh_y/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
    if (fs.existsSync(bundled)) return await import(bundled);
    throw new Error('Playwright is not available. Install playwright or run with the Codex bundled runtime.');
  }
}

const baseURL = process.env.ACT_COMPASS_URL || 'http://127.0.0.1:4174/';
const { chromium } = await loadPlaywright();
const chromePath = process.env.PLAYWRIGHT_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const launchOptions = fs.existsSync(chromePath)
  ? { headless: true, executablePath: chromePath, args: ['--no-sandbox'] }
  : { headless: true };

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage();
await page.goto(baseURL, { waitUntil: 'networkidle' });

const result = await page.evaluate(() => {
  const taskToolJson = {
    settings: { daily: 7.5, weekly: 35 },
    masters: {
      categories: [{ key: 'Strategic', label: '戦略', color: '#1D9E75' }],
      owners: ['自分', 'Aさん'],
      tags: ['資料作成']
    },
    tasks: [{
      id: 5,
      title: '旧形式タスク',
      category: 'Strategic',
      urgency: true,
      importance: false,
      effort: 2.5,
      status: 'inprogress',
      owners: ['Aさん'],
      tags: ['資料作成'],
      progress: 20,
      start: '2026-05-01',
      end: '2026-05-03'
    }],
    smxData: {
      '職場_メンタル': { score: 2, note: '会議後の疲労', ts: '5/27 9:00' },
      '家_睡眠': { score: 4, note: '眠れた', ts: '5/27 8:00' },
      '移動中_脳・集中': { score: 1, note: '混雑', ts: '5/27 8:30' }
    },
    slog: [{ id: 1, loc: '職場', area: 'メンタル', score: 2, note: '会議' }]
  };
  const actToolJson = {
    daily_logs: [{ id: 'd1', date: '2026-05-27', mood_score: 3, physical_score: 2, selected_values: ['健康・身体'], committed_action: '散歩' }],
    scale_sessions: [{ id: 's1', scale_name: 'WHO-5', responses: { WHO5_1: 2 }, scores: { raw: 10 } }],
    work_sessions: [{ id: 'w1', work_type: 'defusion', inputs: { thought: '失敗する' }, next_action: '一文だけ書く' }]
  };
  const convertedTask = window.ACTTaskCompassAPI.normalizeImportedData(taskToolJson);
  const convertedAct = window.ACTTaskCompassAPI.normalizeImportedData(actToolJson);
  const convertedJapaneseCategory = window.ACTTaskCompassAPI.normalizeImportedData({
    tasks: [{ title: '日本語カテゴリのタスク', category: '企画', effort: 1 }],
    masters: { categories: [{ label: '企画', color: '#1D9E75' }] }
  });
  return {
    task: {
      dailyCapacity: convertedTask.settings.daily_capacity,
      weeklyCapacity: convertedTask.settings.weekly_capacity,
      task: convertedTask.tasks[0],
      workMental: convertedTask.stress_latest.workplace__mental,
      homeSleep: convertedTask.stress_latest.home__sleep,
      outingFocus: convertedTask.stress_latest.outing__focus,
      stressLogKey: Object.keys(convertedTask.stress_logs[0].scores)[0],
      areas: convertedTask.stress_areas.map(area => area.label)
    },
    japaneseCategory: {
      categoryId: convertedJapaneseCategory.categories[0].id,
      taskCategory: convertedJapaneseCategory.tasks[0].category
    },
    act: {
      checkins: convertedAct.checkins.length,
      scales: convertedAct.scale_sessions.length,
      works: convertedAct.work_sessions.length,
      valueArea: convertedAct.checkins[0].value_area
    }
  };
});

await browser.close();

assert.equal(result.task.dailyCapacity, 7.5);
assert.equal(result.task.weeklyCapacity, 35);
assert.equal(result.task.task.title, '旧形式タスク');
assert.equal(result.task.task.category, 'Strategic');
assert.equal(result.task.task.urgent, true);
assert.equal(result.task.task.important, false);
assert.equal(result.task.task.status, 'doing');
assert.equal(result.task.workMental.score, 2);
assert.equal(result.task.homeSleep.score, 4);
assert.equal(result.task.outingFocus.score, 1);
assert.equal(result.task.stressLogKey, 'workplace__mental');
assert.deepEqual(result.task.areas.slice(0, 5), ['体調', 'メンタル', '脳・集中', 'エネルギー', '睡眠']);
assert.match(result.japaneseCategory.categoryId, /^[A-Za-z][A-Za-z0-9_-]*$/);
assert.equal(result.japaneseCategory.taskCategory, result.japaneseCategory.categoryId);
assert.equal(result.act.checkins, 1);
assert.equal(result.act.scales, 1);
assert.equal(result.act.works, 1);
assert.equal(result.act.valueArea, '健康・身体');

console.log(JSON.stringify({ ok: true, baseURL }, null, 2));
