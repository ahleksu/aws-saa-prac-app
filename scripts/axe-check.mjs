#!/usr/bin/env node
import axeCore from 'axe-core';
import { chromium } from '@playwright/test';

const baseUrl = process.env.AXE_BASE_URL ?? 'http://localhost:4200';
const seriousImpacts = new Set(['serious', 'critical']);

async function launchBrowser() {
  try {
    return {
      browser: await chromium.launch({ channel: 'msedge' }),
      name: 'msedge',
    };
  } catch (edgeError) {
    console.warn(`Unable to launch Microsoft Edge: ${edgeError.message}`);
    console.warn('Falling back to Playwright Chromium.');

    return {
      browser: await chromium.launch(),
      name: 'chromium',
    };
  }
}

async function runAxe(page, route) {
  await page.addScriptTag({ content: axeCore.source });
  const result = await page.evaluate(async () => {
    return globalThis.axe.run(document, {
      resultTypes: ['violations'],
    });
  });

  const violations = result.violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      route,
      id: violation.id,
      impact: violation.impact ?? 'unknown',
      target: node.target.join(', '),
      failure: node.failureSummary
        ? node.failureSummary.replace(/\s+/g, ' ').trim()
        : violation.help,
    })),
  );

  return violations;
}

async function waitForApp(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'AWS SAA-C03 Practice Exam' }).waitFor();
}

async function main() {
  const { browser, name } = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const results = [];

  try {
    console.log(`AXE browser=${name} baseUrl=${baseUrl}`);

    await waitForApp(page);
    results.push(...(await runAxe(page, '/')));

    await page.goto(`${baseUrl}/quiz?type=secure`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /.+/ }).waitFor();
    await page.getByRole('button', { name: 'Finish Test' }).waitFor();
    results.push(...(await runAxe(page, '/quiz?type=secure')));

    await page.getByRole('button', { name: 'Finish Test' }).click();
    await page.getByRole('button', { name: 'Finish Anyway' }).click();
    await page.waitForURL(`${baseUrl}/result`);
    await page.getByRole('heading', {
      name: 'AWS SAA-C03 Practice Exam - Results',
    }).waitFor();
    results.push(...(await runAxe(page, '/result')));

    await page.getByRole('button', { name: 'Review Questions' }).click();
    await page.waitForURL(`${baseUrl}/review`);
    await page.getByRole('button', { name: 'Back to Result Overview' }).waitFor();
    results.push(...(await runAxe(page, '/review')));
  } finally {
    await browser.close();
  }

  const groupedRoutes = ['/', '/quiz?type=secure', '/result', '/review'];
  const serious = results.filter((violation) =>
    seriousImpacts.has(violation.impact),
  );

  for (const route of groupedRoutes) {
    const routeViolations = results.filter((violation) => violation.route === route);
    const routeSerious = routeViolations.filter((violation) =>
      seriousImpacts.has(violation.impact),
    );

    console.log(
      `${route}: ${routeSerious.length} serious/critical violation(s), ${routeViolations.length} total violation node(s)`,
    );

    for (const violation of routeSerious) {
      console.log(
        `  - ${violation.id} [${violation.impact}] target=${violation.target} failure=${violation.failure}`,
      );
    }
  }

  if (serious.length > 0) {
    console.error(`AXE failed: ${serious.length} serious/critical violation node(s).`);
    process.exit(1);
  }

  console.log('AXE passed: 0 serious/critical violation(s).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
