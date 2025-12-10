import { UserComparison } from '../../../../core/models/benchmark.models';
import { isLowerBetter } from './metric-config';

export function getSegmentValue(comparison: UserComparison, position: 'left' | 'right'): string {
  const isLower = isLowerBetter(comparison.metricType);
  const isWorst = position === 'left';
  const percentile = (isLower === isWorst) ? comparison.percentiles.p90 : comparison.percentiles.p10;
  return percentile.toFixed(0);
}

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
