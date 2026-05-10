import type { Question, QuestionDomain, QuizType } from './quiz.model';
import { prepareQuestions, shuffleItems, shuffleQuestionAnswers } from './quiz-randomization';

function makeQuestion(
  id: number,
  domain: QuestionDomain = 'Design Secure Architectures',
): Question {
  return {
    id,
    question: `Question ${id}`,
    domain,
    type: 'single',
    answers: ['A', 'B', 'C', 'D'].map((option) => ({
      text: answerText(id, option),
      status: option === 'A' ? 'correct' : 'skipped',
      explanation: `${option} explanation`,
    })),
  };
}

function answerText(id: number, option: string): string {
  return `Question ${id} Answer ${option}`;
}

function answerTexts(question: Question): string[] {
  return question.answers.map((answer) => answer.text);
}

function alwaysZero(): number {
  return 0;
}

describe('quiz randomization helpers', () => {
  it('shuffles items with Fisher-Yates using the supplied random function', () => {
    expect(shuffleItems(['A', 'B', 'C', 'D'], alwaysZero)).toEqual(['B', 'C', 'D', 'A']);
  });

  it('shuffles question answers without mutating the original question or answers array', () => {
    const question = makeQuestion(1);
    const originalAnswers = question.answers;
    const originalAnswerTexts = answerTexts(question);

    const shuffled = shuffleQuestionAnswers(question, alwaysZero);

    expect(shuffled).not.toBe(question);
    expect(shuffled.answers).not.toBe(originalAnswers);
    expect(answerTexts(shuffled)).toEqual([
      answerText(1, 'B'),
      answerText(1, 'C'),
      answerText(1, 'D'),
      answerText(1, 'A'),
    ]);
    expect(question.answers).toBe(originalAnswers);
    expect(answerTexts(question)).toEqual(originalAnswerTexts);
  });

  it('preserves domain quiz question order while shuffling answers', () => {
    const questions = [
      makeQuestion(1, 'Design Secure Architectures'),
      makeQuestion(2, 'Design Secure Architectures'),
    ];

    const prepared: Question[] = prepareQuestions('secure', questions, alwaysZero);

    expect(prepared.map((question) => question.id)).toEqual([1, 2]);
    expect(prepared.map(answerTexts)).toEqual([
      [answerText(1, 'B'), answerText(1, 'C'), answerText(1, 'D'), answerText(1, 'A')],
      [answerText(2, 'B'), answerText(2, 'C'), answerText(2, 'D'), answerText(2, 'A')],
    ]);
    expect(questions.map(answerTexts)).toEqual([
      [answerText(1, 'A'), answerText(1, 'B'), answerText(1, 'C'), answerText(1, 'D')],
      [answerText(2, 'A'), answerText(2, 'B'), answerText(2, 'C'), answerText(2, 'D')],
    ]);
  });

  it('shuffles all-domain questions, slices to 65, and shuffles answers', () => {
    const questions = Array.from({ length: 70 }, (_, index) =>
      makeQuestion(index + 1, 'Design Resilient Architectures'),
    );

    const prepared: Question[] = prepareQuestions('all' satisfies QuizType, questions, alwaysZero);

    expect(prepared).toHaveLength(65);
    expect(prepared.map((question) => question.id)).toEqual(
      Array.from({ length: 65 }, (_, index) => index + 2),
    );
    expect(answerTexts(prepared[0])).toEqual([
      answerText(2, 'B'),
      answerText(2, 'C'),
      answerText(2, 'D'),
      answerText(2, 'A'),
    ]);
    expect(answerTexts(questions[1])).toEqual([
      answerText(2, 'A'),
      answerText(2, 'B'),
      answerText(2, 'C'),
      answerText(2, 'D'),
    ]);
  });
});
