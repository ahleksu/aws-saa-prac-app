#!/usr/bin/env node
// Verifies that the official AWS SAA-C03 sample questions are present in the
// domain question banks. Attribution for the source PDF lives in NOTICES.md.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const QUIZ_DIR = join(ROOT, 'public', 'quiz');

const EXPECTED = [
  {
    file: 'secure.json',
    snippet:
      'Amazon EC2 instances for the application tier running in private subnets need to download software patches',
  },
  {
    file: 'cost.json',
    snippet:
      'data in instance memory that must be present when the instances resume operation',
  },
  {
    file: 'resilient.json',
    snippet:
      'allow traffic to be quickly directed to a standby EC2 instance if the application fails',
  },
  {
    file: 'secure.json',
    snippet:
      "JavaScript script that makes authenticated GET requests to the company's Amazon S3 bucket",
  },
  {
    file: 'secure.json',
    snippet:
      'encrypted at rest at all times using encryption keys stored on premises',
  },
  {
    file: 'cost.json',
    snippet:
      'temporary increases in demand at the end of each month that will cause the job to run over the time limit',
  },
  {
    file: 'resilient.json',
    snippet:
      'users submit hundreds of thousands of votes within minutes to a front-end fleet',
  },
  {
    file: 'resilient.json',
    snippet:
      'two-tier application architecture that runs in public and private subnets',
  },
  {
    file: 'performance.json',
    snippet:
      'custom web application that receives a burst of traffic each day at noon',
  },
  {
    file: 'performance.json',
    snippet:
      'database reads are causing high I/O and adding latency to the write requests',
  },
];

function readQuestions(file) {
  return JSON.parse(readFileSync(join(QUIZ_DIR, file), 'utf8'));
}

const questionsByFile = new Map();
const errors = [];

for (const expected of EXPECTED) {
  if (!questionsByFile.has(expected.file)) {
    questionsByFile.set(expected.file, readQuestions(expected.file));
  }

  const questions = questionsByFile.get(expected.file);
  const matches = questions.filter((q) => q.question.includes(expected.snippet));

  if (matches.length !== 1) {
    errors.push(
      `${expected.file}: expected exactly one official sample question containing ${JSON.stringify(
        expected.snippet,
      )}, found ${matches.length}`,
    );
    continue;
  }

  const [match] = matches;
  if (!match.resource || !match.resource.startsWith('https://')) {
    errors.push(
      `${expected.file} id=${match.id}: official sample question must include an https resource`,
    );
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\nFAIL: ${errors.length} official sample check(s) failed.`);
  process.exit(1);
}

console.log(`OK: ${EXPECTED.length} official AWS sample questions are present.`);
