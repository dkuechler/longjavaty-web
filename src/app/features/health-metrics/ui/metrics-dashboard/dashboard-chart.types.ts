import { ChartDataset } from 'chart.js';
import { MeasurementType } from '../../../../core/models/measurement.models';

/**
 * Custom data point structure for time-series metric data.
 * Represents a single measurement with timestamp and value.
 */
export interface MetricDataPoint {
  x: number;  // Timestamp in milliseconds
  y: number;  // Measurement value
}

/**
 * Extended Chart.js dataset interface with custom properties for health metrics.
 * Includes additional metadata for metric type identification and dual y-axis support.
 */
export interface DashboardChartDataset extends ChartDataset<'line', MetricDataPoint[]> {
  metricType: MeasurementType;
  yAxisID?: string;
}
