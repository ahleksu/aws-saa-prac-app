#!/usr/bin/env node
// Deterministically rebalance answer positions in the four domain quiz banks.
//
// The script preserves each answer object verbatim and only rewrites the
// `answers` array order for each question.

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

function readQuestions(file) {
  const path = join(QUIZ_DIR, file);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`ERROR failed to read ${path}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(parsed)) {
    console.error(`ERROR ${path}: top level must be an array`);
    process.exit(1);
  }

  return parsed;
}

function answerStatus(answer) {
  return answer && answer.status;
}

function splitAnswers(answers) {
  return {
    correct: answers.filter((answer) => answerStatus(answer) === 'correct'),
    skipped: answers.filter((answer) => answerStatus(answer) !== 'correct'),
  };
}

function placeAnswers(correct, skipped, correctIndexes, answerCount) {
  const targetCorrectIndexes = new Set(correctIndexes);
  const result = [];
  let correctIndex = 0;
  let skippedIndex = 0;

  for (let i = 0; i < answerCount; i += 1) {
    if (targetCorrectIndexes.has(i)) {
      result.push(correct[correctIndex]);
      correctIndex += 1;
    } else {
      result.push(skipped[skippedIndex]);
      skippedIndex += 1;
    }
  }

  return result;
}

function rebalanceSingle(question, singleIndex) {
  const { correct, skipped } = splitAnswers(question.answers);
  if (correct.length !== 1 || question.answers.length !== 4) return question;

  return {
    ...question,
    answers: placeAnswers(correct, skipped, [singleIndex % 4], 4),
  };
}

function combinations(values, size) {
  if (size === 0) return [[]];
  if (values.length < size) return [];

  const [head, ...tail] = values;
  return [
    ...combinations(tail, size - 1).map((combo) => [head, ...combo]),
    ...combinations(tail, size),
  ];
}

function comboScore(combo, positionCounts) {
  return combo.reduce(
    (total, position) => total + (positionCounts[position] ?? 0),
    0,
  );
}

function chooseSpreadCombo(
  answerCount,
  correctCount,
  positionCounts,
  comboCounts,
) {
  const nonLeadingPositions = Array.from(
    { length: answerCount - 1 },
    (_, index) => index + 1,
  );
  const candidates = combinations(nonLeadingPositions, correctCount);

  return candidates.reduce((best, candidate) => {
    if (!best) return candidate;

    const bestScore = comboScore(best, positionCounts);
    const candidateScore = comboScore(candidate, positionCounts);
    if (candidateScore !== bestScore) {
      return candidateScore < bestScore ? candidate : best;
    }

    const bestMax = Math.max(
      ...best.map((position) => positionCounts[position] ?? 0),
    );
    const candidateMax = Math.max(
      ...candidate.map((position) => positionCounts[position] ?? 0),
    );
    if (candidateMax !== bestMax) {
      return candidateMax < bestMax ? candidate : best;
    }

    const bestComboCount = comboCounts.get(best.join(',')) ?? 0;
    const candidateComboCount = comboCounts.get(candidate.join(',')) ?? 0;
    if (candidateComboCount !== bestComboCount) {
      return candidateComboCount < bestComboCount ? candidate : best;
    }

    return candidate.join(',') < best.join(',') ? candidate : best;
  }, null);
}

function rebalanceMultiple(question, positionCounts, comboCounts) {
  const { correct, skipped } = splitAnswers(question.answers);
  if (correct.length < 2 || question.answers.length < 5) return question;

  const targetIndexes = chooseSpreadCombo(
    question.answers.length,
    correct.length,
    positionCounts,
    comboCounts,
  );
  for (const index of targetIndexes) {
    positionCounts[index] = (positionCounts[index] ?? 0) + 1;
  }
  const targetKey = targetIndexes.join(',');
  comboCounts.set(targetKey, (comboCounts.get(targetKey) ?? 0) + 1);

  return {
    ...question,
    answers: placeAnswers(
      correct,
      skipped,
      targetIndexes,
      question.answers.length,
    ),
  };
}

function summarize(questions) {
  const singleCounts = [0, 0, 0, 0];
  const multipleSets = new Map();
  let single = 0;
  let multiple = 0;

  for (const question of questions) {
    const correctIndexes = question.answers
      .map((answer, index) => (answerStatus(answer) === 'correct' ? index : -1))
      .filter((index) => index !== -1);

    if (question.type === 'single') {
      single += 1;
      if (correctIndexes.length === 1 && correctIndexes[0] < 4) {
        singleCounts[correctIndexes[0]] += 1;
      }
    } else if (question.type === 'multiple') {
      multiple += 1;
      const key = correctIndexes.join(',');
      multipleSets.set(key, (multipleSets.get(key) ?? 0) + 1);
    }
  }

  return {
    count: questions.length,
    single,
    multiple,
    singleCounts,
    multipleSets,
  };
}

function formatMultipleSets(sets) {
  return [...sets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([set, count]) => `${set}:${count}`)
    .join(' ');
}

function rebalanceFile(file) {
  const questions = readQuestions(file);
  let singleIndex = 0;
  const multiplePositionCounts = [];
  const multipleComboCounts = new Map();

  const rebalanced = questions.map((question) => {
    if (!Array.isArray(question.answers)) return question;

    if (question.type === 'single') {
      const nextQuestion = rebalanceSingle(question, singleIndex);
      singleIndex += 1;
      return nextQuestion;
    }

    if (question.type === 'multiple') {
      return rebalanceMultiple(
        question,
        multiplePositionCounts,
        multipleComboCounts,
      );
    }

    return question;
  });

  const outputPath = join(QUIZ_DIR, file);
  writeFileSync(outputPath, JSON.stringify(rebalanced, null, 2) + '\n', 'utf8');

  const summary = summarize(rebalanced);
  console.log(
    `${file.padEnd(18)} count=${summary.count} single=${summary.single} ` +
      `singleCorrect=[${summary.singleCounts.join(',')}] multiple=${summary.multiple} ` +
      `multipleSets=${formatMultipleSets(summary.multipleSets)}`,
  );
}

function main() {
  for (const file of DOMAIN_FILES) {
    rebalanceFile(file);
  }
}

main();
