import { MeasurementType } from '../../../../core/models/measurement.models';
import { CHART_COLORS } from './chart-config';

export const RATING_COLORS: Record<string, string> = {
  excellent: CHART_COLORS.excellent,
  good: CHART_COLORS.good,
  average: CHART_COLORS.average_zone,
  'below-average': '#f97316',
  poor: CHART_COLORS.below_average,
};

export const RATING_LABELS: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Good',
  average: 'Average',
  'below-average': 'Below Average',
  poor: 'Needs Improvement',
};

export const METRIC_NAMES: Record<MeasurementType, string> = {
  [MeasurementType.VO2_MAX]: 'VO2 Max',
  [MeasurementType.RESTING_HEART_RATE]: 'Resting Heart Rate',
  [MeasurementType.STEPS]: 'Daily Steps',
};

export const METRIC_UNITS: Record<MeasurementType, string> = {
  [MeasurementType.VO2_MAX]: 'ml/kg/min',
  [MeasurementType.RESTING_HEART_RATE]: 'bpm',
  [MeasurementType.STEPS]: 'steps',
};

/**
 * Determine if lower values are better for a given metric type.
 * Used to invert percentile zone ordering and chart display.
 * @param metricType - The type of metric to check
 * @returns True if lower values are better (e.g., resting heart rate), false otherwise
 */
export function isLowerBetter(metricType: MeasurementType): boolean {
  return metricType === MeasurementType.RESTING_HEART_RATE;
}
