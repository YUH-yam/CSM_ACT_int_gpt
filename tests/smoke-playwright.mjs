import fs from 'node:fs';

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
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });

await page.goto(baseURL, { waitUntil: 'networkidle' });
await page.getByLabel('上記の前提を理解して、個人利用を開始します。').check();
await page.getByRole('button', { name: '開始する' }).click();
await page.waitForSelector('text=今日の入口');

await page.getByRole('button', { name: 'タスク', exact: true }).click();
await page.getByLabel('タスク名').fill('テスト用タスク');
await page.getByLabel('工数(h)').fill('1.5');
await page.getByRole('button', { name: '追加する' }).click();
await page.waitForSelector('text=テスト用タスク');
await page.getByRole('button', { name: '4象限' }).click();
await page.waitForSelector('text=計画して実行');
await page.getByRole('button', { name: 'WBS' }).click();
await page.waitForSelector('text=1.1 テスト用タスク');
await page.getByRole('button', { name: 'ガント' }).click();
await page.waitForSelector('text=7日前から28日後');

await page.getByRole('button', { name: 'ケア', exact: true }).click();
await page.waitForSelector('text=ストレスマトリクス');
await page.locator('[data-action="stress-select"]').first().click();
await page.locator('[data-action="stress-score"][data-score="2"]').click();
await page.getByLabel('メモ（任意）').fill('テスト記録');
await page.getByRole('button', { name: 'このセルを保存' }).click();
await page.waitForSelector('text=ケア優先 1件');
await page.getByRole('button', { name: 'ワーク' }).click();
await page.waitForSelector('text=60秒グラウンディング');

await page.getByRole('button', { name: '尺度', exact: true }).click();
await page.waitForSelector('text=WHO-5');

const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
const navCount = await page.locator('.nav-btn').count();

await browser.close();

if (overflow) throw new Error('mobile viewport has horizontal overflow');
if (navCount !== 5) throw new Error(`expected 5 nav buttons, got ${navCount}`);

console.log(JSON.stringify({ ok: true, overflow, navCount, baseURL }, null, 2));
