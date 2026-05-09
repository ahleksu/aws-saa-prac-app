#!/usr/bin/env node
// scripts/build-all-json.mjs — regenerate public/quiz/all.json from the 4 domain files.
//
// PLAN §5: id is unique per file; all.json is the union with IDs re-sequenced 1..N.
// Domain files keep their original ids; only all.json is overwritten.
//
// Stable concat order (matches §3 weight: Secure 30 → Resilient 26 → Performance 24 → Cost 20)
// keeps `git diff all.json` minimal and the output deterministic between runs.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const QUIZ_DIR = join(ROOT, 'public', 'quiz');

const DOMAIN_FILES = [
  'secure.json',
  'resilient.json',
  'performance.json',
  'cost.json',
];
const OUTPUT_FILE = 'all.json';

function readQuestions(file) {
  const path = join(QUIZ_DIR, file);
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    console.error(`✗ failed to read ${path}: ${err.message}`);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`✗ invalid JSON in ${path}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(parsed)) {
    console.error(
      `✗ ${path}: top level must be an array (got ${typeof parsed})`,
    );
    process.exit(1);
  }
  return parsed;
}

function main() {
  const perFile = DOMAIN_FILES.map((f) => ({
    file: f,
    questions: readQuestions(f),
  }));

  const merged = perFile.flatMap((p) => p.questions);
  const resequenced = merged.map((q, i) => ({ ...q, id: i + 1 }));

  const outputPath = join(QUIZ_DIR, OUTPUT_FILE);
  writeFileSync(
    outputPath,
    JSON.stringify(resequenced, null, 2) + '\n',
    'utf8',
  );

  for (const p of perFile) {
    console.log(`  ${p.file.padEnd(18)} ${p.questions.length}`);
  }
  console.log(
    `\nWrote ${OUTPUT_FILE}: ${resequenced.length} questions (ids 1..${resequenced.length}).`,
  );
}

main();
