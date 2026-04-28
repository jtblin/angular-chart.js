'use strict';

const { test, expect } = require('@playwright/test');

const pages = [
  'bubble',
  'scatter',
  'dataset-override',
  'horizontal-bar-chart',
  '29-tabs',
  '57-hex-colours',
  '54-not-enough-colours',
  '51-pie-update-colours',
  'configure-line-chart',
  'custom-directive',
  'charts'
];

pages.forEach((name) => {
  test(`compares screenshots for: ${name}`, async ({ page }) => {
    await page.goto(`/test/fixtures/${name}.html`);
    // Wait for animations to finish
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
});
