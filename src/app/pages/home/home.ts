import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DomainCard {
  slug: 'all' | 'secure' | 'resilient' | 'performance' | 'cost';
  title: string;
  weight: string;
  blurb: string;
}

const CARDS: readonly DomainCard[] = [
  {
    slug: 'all',
    title: 'All Domains (Mock Exam)',
    weight: '65 questions',
    blurb: 'Mixed practice across all four domains, sliced to exam length.',
  },
  {
    slug: 'secure',
    title: 'Design Secure Architectures',
    weight: '30%',
    blurb: 'IAM, KMS, network controls, data protection, detective controls.',
  },
  {
    slug: 'resilient',
    title: 'Design Resilient Architectures',
    weight: '26%',
    blurb: 'Multi-AZ, multi-Region, decoupling, fault tolerance, HA storage.',
  },
  {
    slug: 'performance',
    title: 'Design High-Performing Architectures',
    weight: '24%',
    blurb: 'Compute, networking, storage and database performance trade-offs.',
  },
  {
    slug: 'cost',
    title: 'Design Cost-Optimized Architectures',
    weight: '20%',
    blurb: 'Right-sizing, pricing models, lifecycle, data transfer cost.',
  },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-5xl px-4 py-10">
      <header class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">
          AWS SAA-C03 Practice
        </h1>
        <p class="mt-2 text-slate-600">
          Pick a domain to drill, or run a full 65-question mock exam.
        </p>
      </header>

      <ul class="grid gap-4 sm:grid-cols-2" role="list">
        @for (card of cards; track card.slug) {
          <li>
            <a
              [routerLink]="['/quiz']"
              [queryParams]="{ type: card.slug }"
              class="block h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-500 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              [attr.aria-label]="'Start ' + card.title + ' practice'"
            >
              <div class="flex items-start justify-between gap-3">
                <h2 class="text-lg font-semibold text-slate-900">
                  {{ card.title }}
                </h2>
                <span
                  class="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800"
                >
                  {{ card.weight }}
                </span>
              </div>
              <p class="mt-2 text-sm text-slate-600">{{ card.blurb }}</p>
            </a>
          </li>
        }
      </ul>
    </main>
  `,
})
export class Home {
  protected readonly cards = CARDS;
}
