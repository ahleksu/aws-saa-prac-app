import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { QuizService } from './quiz.service';
import type { Question } from './quiz.model';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadQuestions("secure") fetches /quiz/secure.json', () => {
    const fixture: Question[] = [
      {
        id: 1,
        question: 'Stem',
        domain: 'Design Secure Architectures',
        type: 'single',
        answers: [
          { text: 'A', status: 'correct', explanation: 'right' },
          { text: 'B', status: 'skipped', explanation: 'wrong' },
          { text: 'C', status: 'skipped', explanation: 'wrong' },
          { text: 'D', status: 'skipped', explanation: 'wrong' },
        ],
      },
    ];

    let received: Question[] | undefined;
    service.loadQuestions('secure').subscribe((q) => (received = q));

    const req = httpMock.expectOne('/quiz/secure.json');
    expect(req.request.method).toBe('GET');
    req.flush(fixture);

    expect(received).toEqual(fixture);
  });

  it('setQuestions / getQuestions round-trips through the signal', () => {
    expect(service.getQuestions()).toEqual([]);
    const q: Question[] = [
      {
        id: 7,
        question: 'x',
        domain: 'Design Resilient Architectures',
        type: 'single',
        answers: [
          { text: 'a', status: 'correct', explanation: '' },
          { text: 'b', status: 'skipped', explanation: '' },
          { text: 'c', status: 'skipped', explanation: '' },
          { text: 'd', status: 'skipped', explanation: '' },
        ],
      },
    ];
    service.setQuestions(q);
    expect(service.getQuestions()).toEqual(q);
  });
});
