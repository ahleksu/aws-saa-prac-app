import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { DonutChartInput } from './chart-types';
import { DonutChart } from './donut-chart';

const chartMock = vi.hoisted(() => ({
  construct: vi.fn(),
  destroy: vi.fn(),
  register: vi.fn(),
}));

vi.mock('chart.js', () => {
  class MockChart {
    static register(...registerables: unknown[]): void {
      chartMock.register(...registerables);
    }

    constructor(...args: unknown[]) {
      chartMock.construct(...args);
    }

    destroy(): void {
      chartMock.destroy();
    }
  }

  return {
    ArcElement: class MockArcElement {},
    Chart: MockChart,
    DoughnutController: class MockDoughnutController {},
    Legend: class MockLegend {},
    Tooltip: class MockTooltip {},
  };
});

describe('DonutChart', () => {
  let fixture: ComponentFixture<DonutChart>;

  beforeEach(async () => {
    chartMock.construct.mockClear();
    chartMock.destroy.mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as CanvasRenderingContext2D,
    );

    await TestBed.configureTestingModule({
      imports: [DonutChart],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a score breakdown canvas image', () => {
    fixture = TestBed.createComponent(DonutChart);
    fixture.componentRef.setInput('chartData', donutData());

    expect(() => fixture.detectChanges()).not.toThrow();

    const canvas = (fixture.nativeElement as HTMLElement).querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute('aria-label')).toBe('Score breakdown chart');
    expect(canvas?.getAttribute('role')).toBe('img');
    expect(chartMock.construct).toHaveBeenCalledOnce();
  });

  it('accepts chart input updates without throwing', () => {
    fixture = TestBed.createComponent(DonutChart);
    fixture.componentRef.setInput('chartData', donutData());
    fixture.detectChanges();

    expect(() => {
      fixture.componentRef.setInput('chartData', {
        labels: ['Correct', 'Incorrect', 'Skipped'],
        data: [7, 2, 1],
        colors: ['#16a34a', '#ef4444', '#9CA3AF'],
      } satisfies DonutChartInput);
      fixture.detectChanges();
    }).not.toThrow();
  });
});

function donutData(): DonutChartInput {
  return {
    labels: ['Correct', 'Incorrect', 'Skipped'],
    data: [5, 3, 2],
    colors: ['#16a34a', '#ef4444', '#9CA3AF'],
  };
}
