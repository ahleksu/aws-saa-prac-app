import type { Question, QuizType } from './quiz.model';

export type RandomFn = () => number;

export function shuffleItems<T>(items: readonly T[], random: RandomFn = Math.random): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function shuffleQuestionAnswers(
  question: Question,
  random: RandomFn = Math.random,
): Question {
  return {
    ...question,
    answers: shuffleItems(question.answers, random),
  };
}

export function prepareQuestions(
  type: QuizType,
  questions: readonly Question[],
  random: RandomFn = Math.random,
): Question[] {
  const selectedQuestions =
    type === 'all' ? shuffleItems(questions, random).slice(0, 65) : [...questions];

  return selectedQuestions.map((question) => shuffleQuestionAnswers(question, random));
}
