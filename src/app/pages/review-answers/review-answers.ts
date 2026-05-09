import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-review-answers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1 class="px-4 py-10 text-2xl font-bold">Review Answers</h1>`,
})
export class ReviewAnswers {}
