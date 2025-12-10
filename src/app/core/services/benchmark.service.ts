import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementType } from '../models/measurement.models';
import { MetricBenchmark, AgeGroupBenchmark, UserComparison } from '../models/benchmark.models';
import { BENCHMARK_DATA } from '../data/benchmark-data';
import { isLowerBetter } from '../../features/health-metrics/ui/analysis/metric-config';

@Injectable({
  providedIn: 'root',
})
export class BenchmarkService {
  getBenchmarkData(metricType: MeasurementType): Observable<MetricBenchmark | undefined> {
    const benchmark = BENCHMARK_DATA.find((b) => b.metricType === metricType);
    return of(benchmark);
  }

  getAllBenchmarks(): Observable<MetricBenchmark[]> {
    return of(BENCHMARK_DATA);
  }

  getAgeGroupBenchmark(
    metricType: MeasurementType,
    age: number
  ): Observable<AgeGroupBenchmark | undefined> {
    const benchmark = BENCHMARK_DATA.find((b) => b.metricType === metricType);
    if (!benchmark) return of(undefined);

    const ageGroup = benchmark.ageGroups.find((ag) => age >= ag.ageMin && age <= ag.ageMax);
    return of(ageGroup);
  }

  compareUserToAgeGroup(
    metricType: MeasurementType,
    userValue: number,
    age: number
  ): Observable<UserComparison | null> {
    const benchmark = BENCHMARK_DATA.find((b) => b.metricType === metricType);
    if (!benchmark) return of(null);

    const ageGroup = benchmark.ageGroups.find((ag) => age >= ag.ageMin && age <= ag.ageMax);
    if (!ageGroup) return of(null);

    const percentile = this.calculatePercentile(userValue, ageGroup, metricType);
    const difference = userValue - ageGroup.average;
    const differencePercentage = (difference / ageGroup.average) * 100;
    const rating = this.getRating(percentile, metricType);

    return of({
      metricType,
      userValue,
      ageGroup: ageGroup.ageGroup,
      percentile,
      percentiles: ageGroup.percentiles,
      average: ageGroup.average,
      difference,
      differencePercentage,
      rating,
    });
  }

  private calculatePercentile(value: number, ageGroup: AgeGroupBenchmark, metricType: MeasurementType): number {
    const { p10, p25, p50, p75, p90 } = ageGroup.percentiles;

    // Calculate raw percentile (assumes higher values = higher percentiles)
    let rawPercentile: number;
    if (value <= p10) {
      rawPercentile = 10;
    } else if (value <= p25) {
      rawPercentile = 10 + ((value - p10) / (p25 - p10)) * 15;
    } else if (value <= p50) {
      rawPercentile = 25 + ((value - p25) / (p50 - p25)) * 25;
    } else if (value <= p75) {
      rawPercentile = 50 + ((value - p50) / (p75 - p50)) * 25;
    } else if (value <= p90) {
      rawPercentile = 75 + ((value - p75) / (p90 - p75)) * 15;
    } else {
      rawPercentile = 90 + Math.min(((value - p90) / p90) * 10, 10);
    }

    // For "lower is better" metrics, invert the percentile
    // E.g., a heart rate of 52 (p10) should be 90th percentile (top 10%)
    return isLowerBetter(metricType) ? 100 - rawPercentile : rawPercentile;
  }

  private getRating(
    percentile: number,
    metricType: MeasurementType
  ): 'excellent' | 'good' | 'average' | 'below-average' | 'poor' {
    // Percentile is already inverted for "lower is better" metrics in calculatePercentile
    // So we can use the same rating logic for all metrics
    // Cap percentile at valid range [0, 100]
    const cappedPercentile = Math.max(0, Math.min(100, percentile));
    
    if (cappedPercentile >= 75) return 'excellent';
    if (cappedPercentile >= 60) return 'good';
    if (cappedPercentile >= 40) return 'average';
    if (cappedPercentile >= 25) return 'below-average';
    return 'poor';
  }
}
