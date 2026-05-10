export interface DonutChartInput {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface StackedBarDataset {
  label: string;
  backgroundColor: string;
  data: number[];
}

export interface StackedBarChartInput {
  labels: string[];
  datasets: StackedBarDataset[];
}
