import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./pages/quiz/quiz').then((m) => m.Quiz),
  },
  {
    path: 'result',
    loadComponent: () => import('./pages/result/result').then((m) => m.Result),
  },
  {
    path: 'review/all',
    data: { reviewMode: 'allQuestions' },
    loadComponent: () =>
      import('./pages/review-answers/review-answers').then(
        (m) => m.ReviewAnswers,
      ),
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./pages/review-answers/review-answers').then(
        (m) => m.ReviewAnswers,
      ),
  },
  { path: '**', redirectTo: '' },
];
