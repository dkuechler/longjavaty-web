import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementType } from '../models/measurement.models';
import { MetricBenchmark, AgeGroupBenchmark, UserComparison } from '../models/benchmark.models';
import { BENCHMARK_DATA } from '../data/benchmark-data';

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

    const percentile = this.calculatePercentile(userValue, ageGroup);
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

  private calculatePercentile(value: number, ageGroup: AgeGroupBenchmark): number {
    const { p10, p25, p50, p75, p90 } = ageGroup.percentiles;

    if (value <= p10) return 10;
    if (value <= p25) return 10 + ((value - p10) / (p25 - p10)) * 15;
    if (value <= p50) return 25 + ((value - p25) / (p50 - p25)) * 25;
    if (value <= p75) return 50 + ((value - p50) / (p75 - p50)) * 25;
    if (value <= p90) return 75 + ((value - p75) / (p90 - p75)) * 15;
    return 90 + Math.min(((value - p90) / p90) * 10, 10);
  }

  private getRating(
    percentile: number,
    metricType: MeasurementType
  ): 'excellent' | 'good' | 'average' | 'below-average' | 'poor' {
    const isLowerBetter = metricType === MeasurementType.RESTING_HEART_RATE;

    if (isLowerBetter) {
      if (percentile <= 25) return 'excellent';
      if (percentile <= 40) return 'good';
      if (percentile <= 60) return 'average';
      if (percentile <= 75) return 'below-average';
      return 'poor';
    } else {
      if (percentile >= 75) return 'excellent';
      if (percentile >= 60) return 'good';
      if (percentile >= 40) return 'average';
      if (percentile >= 25) return 'below-average';
      return 'poor';
    }
  }
}
