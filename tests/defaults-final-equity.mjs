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

  const numericValue = async id => {
    const raw = await page.locator(`#${id}`).inputValue();
    return Number(raw.replace(/\s/g, ''));
  };

  assert.equal(await numericValue('appreciationRate'), 1);
  assert.equal(await numericValue('downPayment'), 200000);
  assert.equal(await numericValue('hausgeld'), 250);
  assert.equal(await numericValue('grundsteuer'), 250);
  assert.equal(await numericValue('insurance'), 200);

  assert.equal(
    await page.locator('#hausgeld').locator('xpath=following-sibling::span[1]').innerText(),
    '€/年'
  );
  assert.match(await page.locator('.metric-explanations').innerText(), /终期房屋净值/);

  await page.locator('#langToggle').click();
  assert.match(await page.locator('.metric-explanations').innerText(), /End-Eigenkapital/);

  await page.locator('#langToggle').click();
  assert.match(await page.locator('.metric-explanations').innerText(), /Final property equity/);

  assert.deepEqual(errors, []);
  console.log('PASS: updated defaults and final property equity explanation verified');
} finally {
  await browser.close();
}
