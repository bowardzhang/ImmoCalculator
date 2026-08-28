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

  await page.evaluate(() => {
    const pp = document.querySelector('#purchasePrice');
    const dp = document.querySelector('#downPayment');
    pp.value = '100000';
    dp.value = '200000';
    pp.dispatchEvent(new Event('input', { bubbles: true }));
  });

  assert.equal(
    await numericValue('downPayment'),
    200000,
    'Changing purchase price must not immediately clamp the down payment'
  );

  await page.evaluate(() => {
    document.querySelector('#downPayment').value = '200000';
  });
  await page.locator('#themeToggle').click();

  assert.equal(
    await numericValue('downPayment'),
    200000,
    'Toggling the theme must not clamp the down payment'
  );

  await page.locator('#headerCalcBtn').click();

  assert.equal(
    await numericValue('downPayment'),
    100000,
    'Clicking Calculate must clamp the down payment to the purchase price'
  );

  assert.deepEqual(errors, []);
  console.log('PASS: down payment is clamped only when Calculate is clicked');
} finally {
  await browser.close();
}
