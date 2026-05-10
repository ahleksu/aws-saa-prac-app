import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { StackedBarChartInput } from './chart-types';
import { StackedBarChart } from './stacked-bar-chart';

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
    BarController: class MockBarController {},
    BarElement: class MockBarElement {},
    CategoryScale: class MockCategoryScale {},
    Chart: MockChart,
    Legend: class MockLegend {},
    LinearScale: class MockLinearScale {},
    Tooltip: class MockTooltip {},
  };
});

describe('StackedBarChart', () => {
  let fixture: ComponentFixture<StackedBarChart>;

  beforeEach(async () => {
    chartMock.construct.mockClear();
    chartMock.destroy.mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as CanvasRenderingContext2D,
    );

    await TestBed.configureTestingModule({
      imports: [StackedBarChart],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a domain score breakdown canvas image', () => {
    fixture = TestBed.createComponent(StackedBarChart);
    fixture.componentRef.setInput('chartData', stackedBarData());

    expect(() => fixture.detectChanges()).not.toThrow();

    const canvas = (fixture.nativeElement as HTMLElement).querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute('aria-label')).toBe('Domain score breakdown chart');
    expect(canvas?.getAttribute('role')).toBe('img');
    expect(chartMock.construct).toHaveBeenCalledOnce();
  });

  it('accepts chart input updates without throwing', () => {
    fixture = TestBed.createComponent(StackedBarChart);
    fixture.componentRef.setInput('chartData', stackedBarData());
    fixture.detectChanges();

    expect(() => {
      fixture.componentRef.setInput('chartData', {
        labels: ['Secure', 'Resilient'],
        datasets: [
          { label: 'Correct', backgroundColor: '#16a34a', data: [4, 5] },
          { label: 'Incorrect', backgroundColor: '#ef4444', data: [1, 2] },
        ],
      } satisfies StackedBarChartInput);
      fixture.detectChanges();
    }).not.toThrow();
  });
});

function stackedBarData(): StackedBarChartInput {
  return {
    labels: ['Secure', 'Resilient'],
    datasets: [
      { label: 'Correct', backgroundColor: '#16a34a', data: [3, 4] },
      { label: 'Incorrect', backgroundColor: '#ef4444', data: [2, 1] },
    ],
  };
}
