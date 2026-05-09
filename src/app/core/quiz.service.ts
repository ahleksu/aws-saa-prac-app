import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { AnswerEntry, Question } from './quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);

  private readonly questionsState = signal<Question[]>([]);
  private readonly userAnswersState = signal<Record<number, AnswerEntry>>({});

  loadQuestions(type: string): Observable<Question[]> {
    return this.http.get<Question[]>(`/quiz/${type}.json`);
  }

  setQuestions(questions: Question[]): void {
    this.questionsState.set(questions);
  }

  getQuestions(): Question[] {
    return this.questionsState();
  }

  setUserAnswers(answers: Record<number, AnswerEntry>): void {
    this.userAnswersState.set(answers);
  }

  getUserAnswers(): Record<number, AnswerEntry> {
    return this.userAnswersState();
  }

  reset(): void {
    this.questionsState.set([]);
    this.userAnswersState.set({});
  }
}
