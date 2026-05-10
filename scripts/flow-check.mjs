#!/usr/bin/env node
import { chromium } from '@playwright/test';

const baseUrl = process.env.AXE_BASE_URL ?? process.env.APP_BASE_URL ?? 'http://localhost:4200';

const quizFlows = [
  { type: 'all', heading: /All Domains Quiz/, completed: 65 },
  {
    type: 'secure',
    heading: /Domain 1: Design Secure Architectures/,
    completed: 80,
  },
  {
    type: 'resilient',
    heading: /Domain 2: Design Resilient Architectures/,
    completed: 70,
  },
  {
    type: 'performance',
    heading: /Domain 3: Design High-Performing Architectures/,
    completed: 65,
  },
  {
    type: 'cost',
    heading: /Domain 4: Design Cost-Optimized Architectures/,
    completed: 55,
  },
];

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

async function startQuizFromHome(page, flow) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'AWS SAA-C03 Practice Exam' }).waitFor();

  const card = page.locator('div.border').filter({
    has: page.getByRole('heading', { name: flow.heading }),
  }).first();

  await card.getByRole('button', { name: 'Start Quiz' }).click();
  await page.waitForURL(`${baseUrl}/quiz?type=${flow.type}`);
}

async function completeFlow(page, flow) {
  await startQuizFromHome(page, flow);
  await page.getByRole('button', { name: 'Finish Test' }).click();
  await page.getByRole('button', { name: 'Finish Anyway' }).click();
  await page.waitForURL(`${baseUrl}/result`);
  await page.getByRole('heading', {
    name: 'AWS SAA-C03 Practice Exam - Results',
  }).waitFor();
  await page.getByText(`You completed ${flow.completed} questions`).waitFor();
  await page.getByRole('button', { name: 'Review Questions' }).click();
  await page.waitForURL(`${baseUrl}/review`);
  await page.getByRole('button', { name: 'Back to Result Overview' }).waitFor();

  console.log(`${flow.type}: Home -> Quiz -> Result -> Review OK`);
}

async function main() {
  const { browser, name } = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  try {
    console.log(`Flow browser=${name} baseUrl=${baseUrl}`);

    for (const flow of quizFlows) {
      await completeFlow(page, flow);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
