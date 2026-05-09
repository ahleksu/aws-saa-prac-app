export interface Answer {
  text: string;
  status: 'correct' | 'skipped';
  explanation: string;
}

export type QuestionDomain =
  | 'Design Secure Architectures'
  | 'Design Resilient Architectures'
  | 'Design High-Performing Architectures'
  | 'Design Cost-Optimized Architectures';

export interface Question {
  id: number;
  question: string;
  domain: QuestionDomain;
  resource?: string;
  type: 'single' | 'multiple';
  answers: Answer[];
}

export interface AnswerEntry {
  selected: string[];
  isCorrect: boolean;
  submitted: boolean;
}

export interface DomainSummary {
  domain: QuestionDomain;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

export interface QuizResultState {
  total: number;
  correct: number;
  timestamp: number;
  domainSummary: DomainSummary[];
  type: string;
  questions: Question[];
  answers: Record<number, AnswerEntry>;
}
