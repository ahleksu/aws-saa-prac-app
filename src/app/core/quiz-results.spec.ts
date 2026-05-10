import type {
  AnswerEntry,
  DomainSummaryMap,
  Question,
  QuestionDomain,
  ReviewQuestion,
} from './quiz.model';
import {
  buildDomainSummary,
  correctAnswerTexts,
  countCorrect,
  countSkipped,
  domainSummaryToBreakdown,
  isSelectionCorrect,
  toReviewQuestions,
} from './quiz-results';

function makeQuestion(
  id: number,
  domain: QuestionDomain,
  type: Question['type'],
  correctAnswers: string[],
): Question {
  const incorrectAnswers = ['Incorrect A', 'Incorrect B', 'Incorrect C'].filter(
    (answer) => !correctAnswers.includes(answer),
  );

  return {
    id,
    question: `Question ${id}`,
    domain,
    type,
    answers: [
      ...correctAnswers.map((text) => ({
        text,
        status: 'correct' as const,
        explanation: 'Correct',
      })),
      ...incorrectAnswers.map((text) => ({
        text,
        status: 'skipped' as const,
        explanation: 'Incorrect',
      })),
    ],
  };
}

describe('quiz result helpers', () => {
  it('returns the correct answer text values for a question', () => {
    const question = makeQuestion(1, 'Design Secure Architectures', 'multiple', [
      'Enable MFA',
      'Use security groups',
    ]);

    expect(correctAnswerTexts(question)).toEqual(['Enable MFA', 'Use security groups']);
  });

  it('checks single-answer correctness by exact answer text', () => {
    const question = makeQuestion(1, 'Design Secure Architectures', 'single', ['Use IAM roles']);

    expect(isSelectionCorrect(question, ['Use IAM roles'])).toBe(true);
    expect(isSelectionCorrect(question, ['Incorrect A'])).toBe(false);
    expect(isSelectionCorrect(question, ['Use IAM roles', 'Incorrect A'])).toBe(false);
  });

  it('checks multiple-answer correctness without depending on selection order', () => {
    const question = makeQuestion(2, 'Design Resilient Architectures', 'multiple', [
      'Multi-AZ',
      'Auto Scaling',
    ]);

    expect(isSelectionCorrect(question, ['Auto Scaling', 'Multi-AZ'])).toBe(true);
    expect(isSelectionCorrect(question, ['Multi-AZ'])).toBe(false);
    expect(isSelectionCorrect(question, ['Multi-AZ', 'Auto Scaling', 'Incorrect A'])).toBe(false);
  });

  it('projects skipped review questions when an answer entry is missing', () => {
    const question = makeQuestion(3, 'Design High-Performing Architectures', 'single', [
      'Use ElastiCache',
    ]);

    expect(toReviewQuestions([question], {})).toEqual<ReviewQuestion[]>([
      {
        ...question,
        userAnswer: [],
        isCorrect: false,
        isSkipped: true,
      },
    ]);
  });

  it('projects incorrect submitted answers for review', () => {
    const question = makeQuestion(4, 'Design Cost-Optimized Architectures', 'single', [
      'Use Savings Plans',
    ]);
    const answers: Record<number, AnswerEntry> = {
      4: {
        selected: ['Incorrect A'],
        isCorrect: true,
        submitted: true,
      },
    };

    expect(toReviewQuestions([question], answers)).toEqual<ReviewQuestion[]>([
      {
        ...question,
        userAnswer: ['Incorrect A'],
        isCorrect: false,
        isSkipped: false,
      },
    ]);
  });

  it('builds a CLF-compatible domain summary keyed by SAA domain names', () => {
    const reviewQuestions: ReviewQuestion[] = [
      {
        ...makeQuestion(1, 'Design Secure Architectures', 'single', ['A']),
        userAnswer: ['A'],
        isCorrect: true,
        isSkipped: false,
      },
      {
        ...makeQuestion(2, 'Design Secure Architectures', 'single', ['B']),
        userAnswer: ['Incorrect A'],
        isCorrect: false,
        isSkipped: false,
      },
      {
        ...makeQuestion(3, 'Design Resilient Architectures', 'single', ['C']),
        userAnswer: [],
        isCorrect: false,
        isSkipped: true,
      },
    ];

    expect(buildDomainSummary(reviewQuestions)).toEqual<DomainSummaryMap>({
      'Design Secure Architectures': {
        correct: 1,
        total: 2,
        skipped: 0,
      },
      'Design Resilient Architectures': {
        correct: 0,
        total: 1,
        skipped: 1,
      },
    });
  });

  it('counts correct and skipped review questions', () => {
    const reviewQuestions: ReviewQuestion[] = [
      {
        ...makeQuestion(1, 'Design Secure Architectures', 'single', ['A']),
        userAnswer: ['A'],
        isCorrect: true,
        isSkipped: false,
      },
      {
        ...makeQuestion(2, 'Design Secure Architectures', 'single', ['B']),
        userAnswer: [],
        isCorrect: false,
        isSkipped: true,
      },
      {
        ...makeQuestion(3, 'Design Secure Architectures', 'single', ['C']),
        userAnswer: ['Incorrect A'],
        isCorrect: false,
        isSkipped: false,
      },
    ];

    expect(countCorrect(reviewQuestions)).toBe(1);
    expect(countSkipped(reviewQuestions)).toBe(1);
  });

  it('converts domain summary to breakdown entries with derived incorrect counts', () => {
    expect(
      domainSummaryToBreakdown({
        'Design Secure Architectures': {
          correct: 2,
          total: 5,
          skipped: 1,
        },
        'Design Cost-Optimized Architectures': {
          correct: 0,
          total: 1,
          skipped: 1,
        },
      }),
    ).toEqual([
      {
        domain: 'Design Secure Architectures',
        correct: 2,
        incorrect: 2,
        skipped: 1,
      },
      {
        domain: 'Design Cost-Optimized Architectures',
        correct: 0,
        incorrect: 0,
        skipped: 1,
      },
    ]);
  });
});
