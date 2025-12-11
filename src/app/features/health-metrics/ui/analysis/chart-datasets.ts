import { ChartDataset } from 'chart.js';
import { MetricSeries } from '../../../../core/models/measurement.models';
import { CHART_COLORS, ZONE_DATASET_INDICES } from './chart-config';

interface ChartDataPoint {
  x: Date;
  y: number;
}

interface UserDatasetConfig extends ChartDataset<'line', ChartDataPoint[]> {
  label: string;
  data: ChartDataPoint[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  tension: number;
  fill: boolean;
  pointRadius: number;
  pointHoverRadius: number;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointBorderWidth: number;
  order: number;
}

interface AverageDatasetConfig extends ChartDataset<'line', ChartDataPoint[]> {
  label: string;
  data: ChartDataPoint[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  borderDash: number[];
  tension: number;
  fill: boolean;
  pointRadius: number;
  order: number;
}

interface ZoneDatasetConfig extends ChartDataset<'line', ChartDataPoint[]> {
  label: string;
  data: ChartDataPoint[];
  borderColor: string;
  backgroundColor: string;
  fill: string | number;
  pointRadius: number;
  order: number;
}

/**
 * Create a Chart.js dataset for user's actual metric values over time.
 * Displays as a solid blue line with visible data points.
 * @param metric - The metric series containing user's historical data
 * @returns Configured dataset for Chart.js line chart
 */
export function createUserDataset(metric: MetricSeries): UserDatasetConfig {
  return {
    label: 'Your Value',
    data: metric.data.map(d => ({ x: d.timestamp, y: d.value })),
    borderColor: CHART_COLORS.user,
    backgroundColor: `${CHART_COLORS.user}1a`,
    borderWidth: 3,
    tension: 0.4,
    fill: false,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: CHART_COLORS.user,
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    order: ZONE_DATASET_INDICES.USER,
  };
}

/**
 * Create a Chart.js dataset for the age group average line.
 * Displays as a horizontal dashed orange line.
 * @param dates - Array of dates for x-axis alignment
 * @param average - The average value to display
 * @returns Configured dataset for Chart.js line chart
 */
export function createAverageDataset(dates: Date[], average: number): AverageDatasetConfig {
  return {
    label: 'Average',
    data: dates.map(d => ({ x: d, y: average })),
    borderColor: CHART_COLORS.average,
    backgroundColor: `${CHART_COLORS.average}1a`,
    borderWidth: 2,
    borderDash: [5, 5],
    tension: 0,
    fill: false,
    pointRadius: 0,
    order: ZONE_DATASET_INDICES.AVERAGE,
  };
}

/**
 * Create a Chart.js dataset for a percentile zone (shaded area between percentile lines).
 * Zones are filled areas that represent different performance ranges.
 * @param label - Display label for the zone (e.g., 'Excellent Range')
 * @param dates - Array of dates for x-axis alignment
 * @param value - The percentile boundary value
 * @param color - RGBA color string for the zone background
 * @param fill - Fill strategy: 'origin', '-1' (previous dataset), or dataset index
 * @param order - Z-index order (higher = behind)
 * @returns Configured dataset for Chart.js line chart
 */
export function createZoneDataset(
  label: string,
  dates: Date[],
  value: number,
  color: string,
  fill: string | number,
  order: number
): ZoneDatasetConfig {
  return {
    label,
    data: dates.map(d => ({ x: d, y: value })),
    borderColor: 'transparent',
    backgroundColor: color,
    fill,
    pointRadius: 0,
    order,
  };
}
