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

export type QuizType = 'all' | 'secure' | 'resilient' | 'performance' | 'cost';

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

export interface DomainSummaryEntry {
  correct: number;
  total: number;
  skipped: number;
}

export type DomainSummaryMap = Partial<Record<QuestionDomain, DomainSummaryEntry>>;

export interface ReviewQuestion extends Question {
  userAnswer: string[];
  isCorrect: boolean;
  isSkipped: boolean;
}

export interface QuizResultNavigationState {
  total: number;
  correct: number;
  skipped: number;
  timestamp: number;
  domainSummary: DomainSummaryMap;
  type: QuizType;
  questions: ReviewQuestion[];
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
