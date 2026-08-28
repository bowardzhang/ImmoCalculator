import assert from 'node:assert/strict';
import { chromium } from '/tmp/node_modules/playwright/index.mjs';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8080/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('favicon.ico')) errors.push(message.text());
});

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  const langButton = page.locator('#langToggle');
  assert.equal((await langButton.textContent()).trim(), '中文');
  assert.equal(await langButton.evaluate(el => getComputedStyle(el).color), 'rgb(255, 255, 255)');

  await langButton.click();
  assert.equal((await langButton.textContent()).trim(), 'DE');
  assert.equal((await page.locator('.lang-calc').textContent()).trim(), '📈 Berechnen');
  assert.match(await page.locator('fieldset').nth(0).locator('legend').innerText(), /Immobilie/);
  assert.match(await page.locator('#purchasePrice').locator('xpath=ancestor::label').innerText(), /Kaufpreis/);
  assert.match(await page.locator('.kpi-label').nth(0).innerText(), /GESAMT(?:ERWERBS)?KOSTEN/);
  assert.match(await page.locator('.metric-explanations').innerText(), /Kennzahlen|Kumuliert/);
  assert.doesNotMatch(await page.locator('body').innerText(), /[\u4e00-\u9fff]/);

  await langButton.click();
  assert.equal((await langButton.textContent()).trim(), 'EN');
  assert.equal((await page.locator('.lang-calc').textContent()).trim(), '📈 Calculate');
  assert.match(await page.locator('fieldset').nth(0).locator('legend').innerText(), /Property/);
  assert.match(await page.locator('#purchasePrice').locator('xpath=ancestor::label').innerText(), /Purchase price \(Kaufpreis\)/);
  assert.match(await page.locator('.kpi-label').nth(0).innerText(), /TOTAL ACQUISITION COST/i);
  assert.match(await page.locator('.metric-explanations').innerText(), /Metric explanations/);
  assert.doesNotMatch(await page.locator('body').innerText(), /[\u4e00-\u9fff]/);
  assert.equal(await page.locator('#themeToggle').getAttribute('aria-label'), 'Toggle light/dark theme');

  const holdingPeriodRangeButton = page.locator('button[data-param="holdingPeriod"]');
  assert.equal(await holdingPeriodRangeButton.getAttribute('title'), 'Optimize parameter range');
  await holdingPeriodRangeButton.click();
  await page.locator('#rangeModal').waitFor({ state: 'visible' });
  assert.doesNotMatch(await page.locator('#rangeModal').innerText(), /[\u4e00-\u9fff]/);
  await page.locator('#modalOptimizeBtn').click();
  await page.locator('#modalOptResult').waitFor({ state: 'visible' });
  assert.doesNotMatch(await page.locator('#rangeModal').innerText(), /[\u4e00-\u9fff]/);
  await page.locator('#modalCloseBtn').click();

  await page.locator('#themeToggle').click();
  assert.equal(await langButton.evaluate(el => getComputedStyle(el).color), 'rgb(255, 255, 255)');

  await page.locator('#shareBtn').click();
  await page.locator('#shareModal').waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await page.locator('#shareModalTitle').innerText(), /Share image/);
  assert.match(await page.locator('#shareDownloadBtn').innerText(), /Download image/);
  await page.waitForFunction(() => document.querySelector('#sharePreviewImg')?.src.startsWith('data:image/png'), null, { timeout: 10000 });
  assert.doesNotMatch(await page.locator('#shareCard').textContent(), /[\u4e00-\u9fff]/);

  assert.deepEqual(errors, []);
  console.log('PASS: i18n and share UI behavior verified');
} finally {
  await browser.close();
}
