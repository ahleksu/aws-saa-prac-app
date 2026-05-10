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
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  type ChartConfiguration,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

import type { StackedBarChartInput } from './chart-types';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-stacked-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas
    #canvas
    aria-label="Domain score breakdown chart"
    role="img"
  ></canvas>`,
})
export class StackedBarChart {
  readonly chartData = input.required<StackedBarChartInput>();

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  private chart: Chart<'bar', number[], string> | undefined;

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

  private createChart(canvas: HTMLCanvasElement, chartData: StackedBarChartInput): void {
    const context = canvas.getContext('2d');

    this.destroyChart();

    if (!context) {
      return;
    }

    const config: ChartConfiguration<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: '#4B5563',
            },
            grid: {
              color: '#E5E7EB',
            },
          },
          y: {
            stacked: true,
            ticks: {
              color: '#4B5563',
            },
            grid: {
              color: '#E5E7EB',
            },
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
