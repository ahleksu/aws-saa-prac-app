import type {
  AnswerEntry,
  DomainSummaryMap,
  Question,
  QuestionDomain,
  ReviewQuestion,
} from './quiz.model';

export function correctAnswerTexts(question: Question): string[] {
  return question.answers
    .filter((answer) => answer.status === 'correct')
    .map((answer) => answer.text);
}

export function isSelectionCorrect(question: Question, selected: string[]): boolean {
  const correctAnswers = correctAnswerTexts(question);

  if (question.type === 'single') {
    return selected.length === 1 && selected[0] === correctAnswers[0];
  }

  if (selected.length !== correctAnswers.length) {
    return false;
  }

  const sortedSelected = [...selected].sort();
  const sortedCorrectAnswers = [...correctAnswers].sort();

  return sortedSelected.every((answer, index) => answer === sortedCorrectAnswers[index]);
}

export function toReviewQuestions(
  questions: Question[],
  answers: Record<number, AnswerEntry>,
): ReviewQuestion[] {
  return questions.map((question) => {
    const answer = answers[question.id];
    const userAnswer = answer?.selected ?? [];

    return {
      ...question,
      userAnswer,
      isCorrect: isSelectionCorrect(question, userAnswer),
      isSkipped: !answer || !answer.submitted || userAnswer.length === 0,
    };
  });
}

export function buildDomainSummary(questions: ReviewQuestion[]): DomainSummaryMap {
  return questions.reduce<DomainSummaryMap>((summary, question) => {
    const current = summary[question.domain] ?? {
      correct: 0,
      total: 0,
      skipped: 0,
    };

    summary[question.domain] = {
      correct: current.correct + (question.isCorrect ? 1 : 0),
      total: current.total + 1,
      skipped: current.skipped + (question.isSkipped ? 1 : 0),
    };

    return summary;
  }, {});
}

export function countCorrect(questions: ReviewQuestion[]): number {
  return questions.filter((question) => question.isCorrect).length;
}

export function countSkipped(questions: ReviewQuestion[]): number {
  return questions.filter((question) => question.isSkipped).length;
}

export function domainSummaryToBreakdown(summary: DomainSummaryMap): Array<{
  domain: QuestionDomain;
  correct: number;
  incorrect: number;
  skipped: number;
}> {
  return Object.entries(summary).map(([domain, entry]) => ({
    domain: domain as QuestionDomain,
    correct: entry.correct,
    incorrect: entry.total - entry.correct - entry.skipped,
    skipped: entry.skipped,
  }));
}
