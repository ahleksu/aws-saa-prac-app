import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1 class="px-4 py-10 text-2xl font-bold">Result</h1>`,
})
export class Result {}
