import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  Chart,
  type ChartConfiguration,
  DoughnutController,
  Legend,
  Tooltip,
} from 'chart.js';

import type { DonutChartInput } from './chart-types';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-donut-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas aria-label="Score breakdown chart" role="img"></canvas>`,
})
export class DonutChart {
  readonly chartData = input.required<DonutChartInput>();

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  private chart: Chart<'doughnut', number[], string> | undefined;

  constructor() {
    effect(() => {
      const canvas = this.canvas()?.nativeElement;
      const chartData = this.chartData();

      if (!canvas) {
        return;
      }

      this.createChart(canvas, chartData);
    });

    this.destroyRef.onDestroy(() => {
      this.destroyChart();
    });
  }

  private createChart(canvas: HTMLCanvasElement, chartData: DonutChartInput): void {
    const context = canvas.getContext('2d');

    this.destroyChart();

    if (!context) {
      return;
    }

    const config: ChartConfiguration<'doughnut', number[], string> = {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor: chartData.colors,
          },
        ],
      },
      options: {
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    };

    this.chart = new Chart(context, config);
  }

  private destroyChart(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }
}
