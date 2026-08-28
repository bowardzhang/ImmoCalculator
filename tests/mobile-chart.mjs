import assert from 'node:assert/strict';
import { chromium } from '/tmp/node_modules/playwright/index.mjs';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8080/';
const browser = await chromium.launch({ headless: true });
const errors = [];
const viewports = [
  { width: 390, height: 844 },
  { width: 320, height: 568 },
];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && !message.text().includes('favicon.ico')) errors.push(message.text());
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const metrics = await page.evaluate(() => {
      const canvas = document.querySelector('#chart').getBoundingClientRect();
      const container = document.querySelector('.chart-container').getBoundingClientRect();
      return {
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        canvasWidth: canvas.width,
        canvasRight: canvas.right,
        containerWidth: container.width,
        containerRight: container.right,
      };
    });

    assert.ok(
      metrics.scrollWidth <= metrics.viewportWidth + 1,
      `${viewport.width}px viewport: page must not overflow horizontally (scrollWidth=${metrics.scrollWidth})`
    );
    assert.ok(
      metrics.canvasRight <= metrics.viewportWidth + 1,
      `${viewport.width}px viewport: chart canvas must fit the viewport (right=${metrics.canvasRight})`
    );
    assert.ok(
      metrics.canvasWidth > 200,
      `${viewport.width}px viewport: chart canvas must remain usable (width=${metrics.canvasWidth})`
    );

    await page.close();
  }

  assert.deepEqual(errors, []);
  console.log('PASS: mobile portrait chart fits viewport without horizontal overflow');
} finally {
  await browser.close();
}
