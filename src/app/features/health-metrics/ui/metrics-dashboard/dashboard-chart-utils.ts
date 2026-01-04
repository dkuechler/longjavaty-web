import { ChartDataset } from 'chart.js';
import { MetricSeries, MeasurementType } from '../../../../core/models/measurement.models';
import { DashboardChartDataset } from './dashboard-chart.types';

export interface MetricChartDataset extends ChartDataset<'line', { x: number; y: number }[]> {
  metricType: MeasurementType;
}

export function createChartDatasets(metrics: MetricSeries[]): MetricChartDataset[] {
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
      yAxisID: 'y',
      originalBorderColor: metric.color,
    }));
}

export function highlightDataset(datasets: MetricChartDataset[], targetMetricType: MeasurementType): MetricChartDataset[] {
  return datasets.map((dataset) => ({
    ...dataset,
    borderWidth: dataset.metricType === targetMetricType ? 4 : 1.5,
    pointRadius: dataset.metricType === targetMetricType ? 4 : 2,
    borderColor:
      dataset.metricType === targetMetricType
        ? dataset.borderColor
        : typeof dataset.borderColor === 'string'
        ? dataset.borderColor + '40'
        : dataset.borderColor,
  }));
}

export function resetDatasetHighlight(datasets: MetricChartDataset[]): MetricChartDataset[] {
  return datasets.map((dataset) => ({
    ...dataset,
    borderWidth: 2.5,
    pointRadius: 3,
    borderColor: typeof dataset.borderColor === 'string' 
      ? dataset.borderColor.replace(/40$/, '') 
      : dataset.borderColor,
  }));
}
