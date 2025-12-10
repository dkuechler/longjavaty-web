import { MetricSeries, MeasurementType } from '../../../../core/models/measurement.models';

export interface ChartDataset {
  label: string;
  data: { x: number; y: number }[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointBorderWidth: number;
  tension: number;
  fill: boolean;
  metricType: MeasurementType;
  yAxisID: string;
}

export function createChartDatasets(metrics: MetricSeries[]): ChartDataset[] {
  return metrics
    .filter((metric) => metric.data.length > 0)
    .map((metric) => ({
      label: metric.label,
      data: metric.data.map((d) => ({
        x: d.timestamp.getTime(),
        y: d.value,
      })),
      borderColor: metric.color,
      backgroundColor: metric.color + '20',
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: metric.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      tension: 0.3,
      fill: false,
      metricType: metric.measurementType,
      yAxisID: metric.measurementType === MeasurementType.STEPS ? 'y1' : 'y',
    }));
}

export function highlightDataset(datasets: ChartDataset[], targetMetricType: MeasurementType): ChartDataset[] {
  return datasets.map((dataset) => ({
    ...dataset,
    borderWidth: dataset.metricType === targetMetricType ? 4 : 1.5,
    pointRadius: dataset.metricType === targetMetricType ? 4 : 2,
    borderColor:
      dataset.metricType === targetMetricType
        ? dataset.borderColor
        : dataset.borderColor + '40',
  }));
}

export function resetDatasetHighlight(datasets: ChartDataset[]): ChartDataset[] {
  return datasets.map((dataset) => ({
    ...dataset,
    borderWidth: 2.5,
    pointRadius: 3,
    borderColor: dataset.borderColor.replace(/40$/, ''),
  }));
}
