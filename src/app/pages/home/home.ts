import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-home',
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-10 text-center" [@fadeIn]>
      <!-- Title -->
      <h1 class="text-3xl font-bold mb-2">AWS SAA-C03 Practice Exam</h1>
      <p class="text-sm text-gray-500">Developed by: ahleksu.dev</p>

      <!-- Social Icons -->
      <div class="flex justify-center space-x-6 mt-3 text-gray-600 text-xl">
        <a
          href="https://youtube.com/@ahleksu"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <i
            class="pi pi-youtube hover:text-red-600 cursor-pointer transition duration-150 ease-in-out"
          ></i>
        </a>
        <a
          href="https://www.linkedin.com/in/ahleksu"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i
            class="pi pi-linkedin hover:text-blue-700 cursor-pointer transition duration-150 ease-in-out"
          ></i>
        </a>
        <a
          href="https://www.facebook.com/ahleksu"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <i
            class="pi pi-facebook hover:text-blue-600 cursor-pointer transition duration-150 ease-in-out"
          ></i>
        </a>
        <a
          href="https://github.com/ahleksu"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <i
            class="pi pi-github hover:text-gray-800 cursor-pointer transition duration-150 ease-in-out"
          ></i>
        </a>
      </div>

      <!-- Grid Layout -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 mt-10">
        <!-- All Domains -->
        <div
          class="col-span-1 sm:col-span-2 lg:col-span-12 border rounded-lg p-6 text-left shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300"
        >
          <h2 class="text-xl font-semibold mb-2">All Domains Quiz</h2>
          <p class="mb-4">
            Take a comprehensive 65-question mock exam covering all four
            SAA-C03 domains.
          </p>
          <p-button label="Start Quiz" (onClick)="startQuiz('all')" />
        </div>

        <!-- Domain 1 -->
        <div
          class="col-span-1 sm:col-span-1 lg:col-span-6 border rounded-lg p-6 text-left shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300"
        >
          <h2 class="text-xl font-semibold mb-2">
            Domain 1: Design Secure Architectures
            <span class="text-sm font-normal text-gray-500">(30%)</span>
          </h2>
          <p class="mb-4">
            IAM, KMS, network controls, data protection, and detective controls.
          </p>
          <p-button label="Start Quiz" (onClick)="startQuiz('secure')" />
        </div>

        <!-- Domain 2 -->
        <div
          class="col-span-1 sm:col-span-1 lg:col-span-6 border rounded-lg p-6 text-left shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300"
        >
          <h2 class="text-xl font-semibold mb-2">
            Domain 2: Design Resilient Architectures
            <span class="text-sm font-normal text-gray-500">(26%)</span>
          </h2>
          <p class="mb-4">
            Multi-AZ, multi-Region, decoupling, fault tolerance, and HA storage.
          </p>
          <p-button label="Start Quiz" (onClick)="startQuiz('resilient')" />
        </div>

        <!-- Domain 3 -->
        <div
          class="col-span-1 sm:col-span-1 lg:col-span-6 border rounded-lg p-6 text-left shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300"
        >
          <h2 class="text-xl font-semibold mb-2">
            Domain 3: Design High-Performing Architectures
            <span class="text-sm font-normal text-gray-500">(24%)</span>
          </h2>
          <p class="mb-4">
            Compute, networking, storage, and database performance trade-offs.
          </p>
          <p-button label="Start Quiz" (onClick)="startQuiz('performance')" />
        </div>

        <!-- Domain 4 -->
        <div
          class="col-span-1 sm:col-span-1 lg:col-span-6 border rounded-lg p-6 text-left shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300"
        >
          <h2 class="text-xl font-semibold mb-2">
            Domain 4: Design Cost-Optimized Architectures
            <span class="text-sm font-normal text-gray-500">(20%)</span>
          </h2>
          <p class="mb-4">
            Right-sizing, pricing models, lifecycle policies, and data-transfer
            cost.
          </p>
          <p-button label="Start Quiz" (onClick)="startQuiz('cost')" />
        </div>
      </div>

      <!-- Disclaimer Section -->
      <div class="mt-16 text-sm text-gray-500 max-w-4xl mx-auto border-t pt-6">
        <p>
          <strong>Disclaimer:</strong> This practice exam web application is a
          project designed for educational purposes. It is not affiliated with
          or endorsed by any official certification body or course provider.
          The questions and answers provided are based on publicly available
          data.
        </p>
        <p class="mt-2">
          Live multiplayer mode is deferred to a post-exam release. If you
          notice any inaccuracies or have suggestions for improvement, please
          <a
            href="https://github.com/ahleksu/aws-saa-prac-app/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="underline"
          >
            file an issue in the GitHub repository</a
          >.
        </p>
      </div>

      <!-- Support Developer Section -->
      <div class="mt-12 text-gray-700 max-w-3xl mx-auto text-center">
        <p class="text-base md:text-lg font-medium">
          ☕ Enjoying this app? Help keep it brewing!
        </p>
        <p class="mt-1 text-sm text-gray-500 px-4 md:px-0">
          Love this app? Fuel it with a coffee! Click on my icon below ⬇️☕
        </p>

        <div class="mt-6 flex flex-col items-center justify-center">
          <a
            href="https://drive.google.com/file/d/1StJEkH_TAVs5FDnJImQVDnZ5yliRkZsd/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            class="transform hover:scale-105 transition duration-200"
          >
            <img
              src="ahleksu-notion-face.png"
              alt="Buy me a coffee"
              class="w-30 h-30 mx-auto"
            />
          </a>
        </div>
      </div>
    </div>
  `,
})
export class Home {
  private readonly router = inject(Router);

  startQuiz(type: string): void {
    this.router.navigate(['/quiz'], { queryParams: { type } });
  }
}
