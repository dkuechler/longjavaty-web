import { UserComparison } from '../../../../core/models/benchmark.models';
import { isLowerBetter } from './metric-config';

/**
 * Calculate the percentile value to display at the left or right edge of a percentile bar.
 * @param comparison - The user comparison data containing percentile information
 * @param position - Which edge of the bar ('left' or 'right')
 * @returns The percentile value formatted as a string
 */
export function getSegmentValue(comparison: UserComparison, position: 'left' | 'right'): string {
  const isLower = isLowerBetter(comparison.metricType);
  const isWorst = position === 'left';
  const percentile = (isLower === isWorst) ? comparison.percentiles.p90 : comparison.percentiles.p10;
  return percentile.toFixed(0);
}

/**
 * Calculate Y-axis bounds centered around the average value for better visualization.
 * Ensures the chart displays a balanced view with the average line in the middle.
 * @param comparison - The user comparison data containing percentiles and average
 * @param isLower - Whether lower values are better for this metric
 * @returns Object containing min and max values for the Y-axis
 */
export function calculateCenteredYAxis(
  comparison: UserComparison,
  isLower: boolean
): { min: number; max: number } {
  const { percentiles, average } = comparison;
  const topValue = percentiles.p90 + 10;
  const bottomValue = isLower ? Math.max(percentiles.p10 - 15, 40) : Math.max(percentiles.p10 - 10, 0);
  const maxDistance = Math.max(topValue - average, average - bottomValue);
  
  return { min: average - maxDistance, max: average + maxDistance };
}
