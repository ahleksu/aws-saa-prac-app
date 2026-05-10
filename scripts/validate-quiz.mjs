#!/usr/bin/env node
// scripts/validate-quiz.mjs — validates question banks per PLAN.md §5.
//
// Usage:
//   node scripts/validate-quiz.mjs                     # scans public/quiz/*.json
//   node scripts/validate-quiz.mjs path/to/file.json   # validates specific files
//
// Exits 0 on success, 1 on any violation. Prints per-file summary
// `{file, count, single, multiple, errors}` and a tail line.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_QUIZ_DIR = join(ROOT, 'public', 'quiz');

const DOMAINS = new Set([
  'Design Secure Architectures',
  'Design Resilient Architectures',
  'Design High-Performing Architectures',
  'Design Cost-Optimized Architectures',
]);

// PLAN §5: docs.aws.amazon.com, aws.amazon.com (blogs/whitepapers), wa.aws.amazon.com (Well-Architected).
const RESOURCE_HOSTS = new Set([
  'docs.aws.amazon.com',
  'aws.amazon.com',
  'wa.aws.amazon.com',
]);

const STATUSES = new Set(['correct', 'skipped']);
const TYPES = new Set(['single', 'multiple']);
const FIRST_ANSWER_BIAS_MIN_SINGLE = 4;
const FIRST_ANSWER_BIAS_MAX_RATIO = 0.75;

function validateAnswer(a, qId, qIndex, aIndex, errors) {
  const where = `q[${qIndex}] (id=${qId}) answer[${aIndex}]`;
  if (a == null || typeof a !== 'object' || Array.isArray(a)) {
    errors.push(`${where}: must be an object`);
    return;
  }
  if (typeof a.text !== 'string' || a.text.trim() === '') {
    errors.push(`${where}: 'text' must be a non-empty string`);
  }
  if (!STATUSES.has(a.status)) {
    errors.push(
      `${where}: 'status' must be 'correct' or 'skipped' (got ${JSON.stringify(a.status)})`,
    );
  }
  if (typeof a.explanation !== 'string' || a.explanation.trim() === '') {
    errors.push(
      `${where}: 'explanation' must be a non-empty string (distractors and correct answers both need a real explanation)`,
    );
  }
}

function validateResource(url, qId, qIndex, errors) {
  const where = `q[${qIndex}] (id=${qId}) resource`;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    errors.push(`${where}: not a valid URL (${JSON.stringify(url)})`);
    return;
  }
  if (parsed.protocol !== 'https:') {
    errors.push(`${where}: must be https:// (got ${parsed.protocol})`);
  }
  if (!RESOURCE_HOSTS.has(parsed.hostname)) {
    errors.push(
      `${where}: host '${parsed.hostname}' not in whitelist (${[...RESOURCE_HOSTS].join(', ')})`,
    );
  }
}

function validateQuestion(q, qIndex, idsSeen, errors) {
  const where = `q[${qIndex}]`;
  if (q == null || typeof q !== 'object' || Array.isArray(q)) {
    errors.push(`${where}: must be an object`);
    return null;
  }

  if (!Number.isInteger(q.id)) {
    errors.push(
      `${where}: 'id' must be an integer (got ${JSON.stringify(q.id)})`,
    );
  } else if (idsSeen.has(q.id)) {
    errors.push(`${where} (id=${q.id}): duplicate id within file`);
  } else {
    idsSeen.add(q.id);
  }

  const qId = q.id ?? '?';

  if (typeof q.question !== 'string' || q.question.trim() === '') {
    errors.push(`${where} (id=${qId}): 'question' must be a non-empty string`);
  }

  if (!DOMAINS.has(q.domain)) {
    errors.push(
      `${where} (id=${qId}): 'domain' must be one of the 4 SAA literals (got ${JSON.stringify(q.domain)})`,
    );
  }

  if (q.resource !== undefined) {
    if (typeof q.resource !== 'string') {
      errors.push(
        `${where} (id=${qId}): 'resource' must be a string when present (got ${typeof q.resource})`,
      );
    } else {
      validateResource(q.resource, qId, qIndex, errors);
    }
  }

  if (!TYPES.has(q.type)) {
    errors.push(
      `${where} (id=${qId}): 'type' must be 'single' or 'multiple' (got ${JSON.stringify(q.type)})`,
    );
  }

  if (!Array.isArray(q.answers)) {
    errors.push(`${where} (id=${qId}): 'answers' must be an array`);
    return TYPES.has(q.type) ? q.type : null;
  }

  q.answers.forEach((a, i) => validateAnswer(a, qId, qIndex, i, errors));
  validateUniqueAnswerText(q.answers, qId, qIndex, errors);

  const correctCount = q.answers.filter(
    (a) => a && a.status === 'correct',
  ).length;

  if (q.type === 'single') {
    if (q.answers.length !== 4) {
      errors.push(
        `${where} (id=${qId}): 'single' must have exactly 4 answers (got ${q.answers.length})`,
      );
    }
    if (correctCount !== 1) {
      errors.push(
        `${where} (id=${qId}): 'single' must have exactly one 'correct' answer (got ${correctCount})`,
      );
    }
  } else if (q.type === 'multiple') {
    if (q.answers.length < 5) {
      errors.push(
        `${where} (id=${qId}): 'multiple' must have ≥5 answers (got ${q.answers.length})`,
      );
    }
    if (correctCount < 2) {
      errors.push(
        `${where} (id=${qId}): 'multiple' must have ≥2 'correct' answers (got ${correctCount})`,
      );
    }

    const stem = typeof q.question === 'string' ? q.question : '';
    const hasTwo = stem.includes('(Choose TWO)');
    const hasThree = stem.includes('(Choose THREE)');
    if (hasTwo && hasThree) {
      errors.push(
        `${where} (id=${qId}): stem contains both '(Choose TWO)' and '(Choose THREE)' — pick one`,
      );
    } else if (!hasTwo && !hasThree) {
      errors.push(
        `${where} (id=${qId}): 'multiple' stem must include '(Choose TWO)' or '(Choose THREE)'`,
      );
    } else if (hasTwo && correctCount !== 2) {
      errors.push(
        `${where} (id=${qId}): stem says '(Choose TWO)' but ${correctCount} answers are 'correct'`,
      );
    } else if (hasThree && correctCount !== 3) {
      errors.push(
        `${where} (id=${qId}): stem says '(Choose THREE)' but ${correctCount} answers are 'correct'`,
      );
    }
  }

  return TYPES.has(q.type) ? q.type : null;
}

function validateUniqueAnswerText(answers, qId, qIndex, errors) {
  const firstIndexByText = new Map();
  const where = `q[${qIndex}] (id=${qId})`;

  answers.forEach((answer, answerIndex) => {
    if (answer == null || typeof answer !== 'object' || Array.isArray(answer)) {
      return;
    }
    if (typeof answer.text !== 'string') return;

    const text = answer.text.trim();
    if (text === '') return;

    const firstIndex = firstIndexByText.get(text);
    if (firstIndex !== undefined) {
      errors.push(
        `${where}: duplicate answer text ${JSON.stringify(text)} at answer[${firstIndex}] and answer[${answerIndex}]`,
      );
      return;
    }

    firstIndexByText.set(text, answerIndex);
  });
}

function correctIndexes(question) {
  if (!question || !Array.isArray(question.answers)) return [];

  return question.answers
    .map((answer, index) => (answer && answer.status === 'correct' ? index : -1))
    .filter((index) => index !== -1);
}

function isLeadingContiguous(indexes) {
  return indexes.length > 0 && indexes.every((index, i) => index === i);
}

function validateBankAnswerPositions(file, stats, errors) {
  if (stats.singleCorrectIndexes.length >= FIRST_ANSWER_BIAS_MIN_SINGLE) {
    const firstAnswerCorrect = stats.singleCorrectIndexes.filter(
      (index) => index === 0,
    ).length;
    const firstAnswerRatio =
      firstAnswerCorrect / stats.singleCorrectIndexes.length;

    if (firstAnswerRatio > FIRST_ANSWER_BIAS_MAX_RATIO) {
      errors.push(
        `${file}: extreme first-answer bias: ${firstAnswerCorrect}/${stats.singleCorrectIndexes.length} single correct answers are at answer[0]`,
      );
    }
  }

  if (
    stats.multipleCorrectSets.length > 0 &&
    stats.multipleCorrectSets.every(isLeadingContiguous)
  ) {
    errors.push(
      `${file}: all ${stats.multipleCorrectSets.length} multiple-choice correct answer sets are leading-contiguous`,
    );
  }
}

function validateFile(absPath) {
  const file = basename(absPath);
  const empty = { file, count: 0, single: 0, multiple: 0, errors: [] };
  let raw;
  try {
    raw = readFileSync(absPath, 'utf8');
  } catch (err) {
    return { ...empty, errors: [`failed to read: ${err.message}`] };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { ...empty, errors: [`invalid JSON: ${err.message}`] };
  }

  if (!Array.isArray(parsed)) {
    return {
      ...empty,
      errors: [`top level must be an array (got ${typeof parsed})`],
    };
  }

  const idsSeen = new Set();
  const errors = [];
  const answerPositionStats = {
    singleCorrectIndexes: [],
    multipleCorrectSets: [],
  };
  let single = 0;
  let multiple = 0;

  parsed.forEach((q, i) => {
    const t = validateQuestion(q, i, idsSeen, errors);
    if (t === 'single') single += 1;
    else if (t === 'multiple') multiple += 1;

    const indexes = correctIndexes(q);
    if (t === 'single' && indexes.length === 1) {
      answerPositionStats.singleCorrectIndexes.push(indexes[0]);
    } else if (t === 'multiple' && indexes.length >= 2) {
      answerPositionStats.multipleCorrectSets.push(indexes);
    }
  });

  validateBankAnswerPositions(file, answerPositionStats, errors);

  return { file, count: parsed.length, single, multiple, errors };
}

function resolveTargets(args) {
  if (args.length > 0) {
    return args.map((p) => resolve(process.cwd(), p));
  }

  let entries;
  try {
    entries = readdirSync(DEFAULT_QUIZ_DIR);
  } catch (err) {
    console.error(`✗ cannot read ${DEFAULT_QUIZ_DIR}: ${err.message}`);
    process.exit(1);
  }

  const files = entries
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(DEFAULT_QUIZ_DIR, name))
    .filter((p) => statSync(p).isFile())
    .sort();

  if (files.length === 0) {
    console.error(`✗ no JSON files found in ${DEFAULT_QUIZ_DIR}`);
    process.exit(1);
  }

  return files;
}

function main() {
  const targets = resolveTargets(process.argv.slice(2));
  const summaries = targets.map(validateFile);

  let totalErrors = 0;
  for (const s of summaries) {
    const ok = s.errors.length === 0 ? '✓' : '✗';
    console.log(
      `${ok} ${s.file}  count=${s.count}  single=${s.single}  multiple=${s.multiple}  errors=${s.errors.length}`,
    );
    for (const e of s.errors) console.log(`    - ${e}`);
    totalErrors += s.errors.length;
  }

  console.log(
    `\n${totalErrors === 0 ? 'OK' : 'FAIL'}: ${summaries.length} file(s), ${totalErrors} error(s).`,
  );
  process.exit(totalErrors === 0 ? 0 : 1);
}

main();
