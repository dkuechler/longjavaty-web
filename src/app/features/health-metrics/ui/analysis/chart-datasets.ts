import { MetricSeries } from '../../../../core/models/measurement.models';
import { CHART_COLORS, ZONE_DATASET_INDICES } from './chart-config';

export function createUserDataset(metric: MetricSeries): any {
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

export function createAverageDataset(dates: Date[], average: number): any {
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

export function createZoneDataset(
  label: string,
  dates: Date[],
  value: number,
  color: string,
  fill: string | number,
  order: number
): any {
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
