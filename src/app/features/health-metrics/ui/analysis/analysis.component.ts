import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartDataset } from 'chart.js';
import { BenchmarkService } from '../../../../core/services/benchmark.service';
import { HealthMetricsStateService } from '../../data/health-metrics-state.service';
import { UserComparison } from '../../../../core/models/benchmark.models';
import { MetricSeries, MeasurementType } from '../../../../core/models/measurement.models';
import { createBaseChartOptions } from './chart-config';
import { createUserDataset, createAverageDataset, createZoneDataset } from './chart-datasets';
import { getTooltipLabel, getTooltipColor } from './chart-tooltips';
import { RATING_COLORS, RATING_LABELS, METRIC_NAMES, METRIC_UNITS, isLowerBetter } from './metric-config';
import { getSegmentValue, calculateCenteredYAxis } from './chart-utils';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.css',
})
export class AnalysisComponent implements OnInit {
  private readonly benchmarkService = inject(BenchmarkService);
  private readonly metricsState = inject(HealthMetricsStateService);

  userAge = 28;
  comparisons = signal<UserComparison[]>([]);
  loading = signal(true);
  allMetrics = signal<MetricSeries[]>([]);

  readonly chartType: ChartType = 'line';
  private readonly baseChartOptions: ChartConfiguration['options'];

  constructor() {
    this.baseChartOptions = createBaseChartOptions(
      (ctx) => getTooltipLabel(ctx),
      (ctx) => getTooltipColor(ctx)
    );
  }

  ngOnInit(): void {
    this.metricsState.loadAllMetrics();
    this.metricsState.allMetrics$
      .pipe(takeUntilDestroyed())
      .subscribe((metrics) => {
        this.allMetrics.set(metrics);
        this.loadComparisons(metrics);
      });
  }

  private loadComparisons(metrics: MetricSeries[]): void {
    const comparisonObservables = metrics
      .filter((metric) => metric.data.length > 0)
      .map((metric) => {
        const latestValue = metric.data[metric.data.length - 1].value;
        return this.benchmarkService.compareUserToAgeGroup(
          metric.measurementType,
          latestValue,
          this.userAge
        );
      });

    if (comparisonObservables.length === 0) {
      this.comparisons.set([]);
      this.loading.set(false);
      return;
    }

    forkJoin(comparisonObservables).subscribe({
      next: (comparisons) => {
        const validComparisons = comparisons.filter((c) => c !== null) as UserComparison[];
        this.comparisons.set(validComparisons);
        this.loading.set(false);
      },
      error: () => {
        this.comparisons.set([]);
        this.loading.set(false);
      },
    });
  }

  getRatingColor(rating: string): string {
    return RATING_COLORS[rating] || '#64748b';
  }

  getRatingLabel(rating: string): string {
    return RATING_LABELS[rating] || 'Unknown';
  }

  getMetricName(metricType: MeasurementType): string {
    return METRIC_NAMES[metricType] || '';
  }

  getMetricUnit(metricType: MeasurementType): string {
    return METRIC_UNITS[metricType] || '';
  }

  isLowerBetter(metricType: MeasurementType): boolean {
    return isLowerBetter(metricType);
  }

  getActiveComparisons(): UserComparison[] {
    return this.comparisons().filter(c => c.metricType !== MeasurementType.STEPS);
  }

  getSegmentValue(comparison: UserComparison, position: 'left' | 'right'): string {
    return getSegmentValue(comparison, position);
  }

  getChartData(metricType: MeasurementType): ChartConfiguration<'line'>['data'] {
    const metric = this.allMetrics().find(m => m.measurementType === metricType);
    if (!metric || metric.data.length === 0) return { datasets: [] };

    const comparison = this.comparisons().find(c => c.metricType === metricType);
    if (!comparison) return { datasets: [] };

    const { percentiles, average } = comparison;
    const dates = metric.data.map(d => d.timestamp);
    const isLower = isLowerBetter(metricType);

    if (isLower) {
      return {
        labels: dates,
        datasets: [
          createUserDataset(metric),
          createAverageDataset(dates, average),
          createZoneDataset('Athletic Range', dates, percentiles.p10, 'rgba(16, 185, 129, 0.2)', 'origin', 7),
          createZoneDataset('Excellent Range', dates, percentiles.p25, 'rgba(16, 185, 129, 0.15)', '-1', 6),
          createZoneDataset('Good Range', dates, percentiles.p50, 'rgba(59, 130, 246, 0.15)', '-1', 5),
          createZoneDataset('Average Range', dates, percentiles.p75, 'rgba(245, 158, 11, 0.15)', '-1', 4),
          createZoneDataset('Below Average', dates, percentiles.p90, 'rgba(239, 68, 68, 0.15)', '-1', 3),
          createZoneDataset('Needs Improvement', dates, percentiles.p90 + 10, 'rgba(220, 38, 38, 0.15)', '-1', 2),
        ] as any,
      };
    } else {
      return {
        labels: dates,
        datasets: [
          createUserDataset(metric),
          createAverageDataset(dates, average),
          createZoneDataset('Needs Improvement', dates, percentiles.p10, 'rgba(220, 38, 38, 0.15)', 'origin', 7),
          createZoneDataset('Below Average', dates, percentiles.p25, 'rgba(239, 68, 68, 0.15)', '-1', 6),
          createZoneDataset('Average Range', dates, percentiles.p50, 'rgba(245, 158, 11, 0.15)', '-1', 5),
          createZoneDataset('Good Range', dates, percentiles.p75, 'rgba(59, 130, 246, 0.15)', '-1', 4),
          createZoneDataset('Excellent Range', dates, percentiles.p90, 'rgba(16, 185, 129, 0.15)', '-1', 3),
          createZoneDataset('Outstanding', dates, percentiles.p90 + 10, 'rgba(16, 185, 129, 0.2)', '-1', 2),
        ] as any,
      };
    }
  }

  getChartOptions(metricType: MeasurementType): ChartConfiguration['options'] {
    const comparison = this.comparisons().find(c => c.metricType === metricType);
    if (!comparison) return this.baseChartOptions;

    const { min, max } = calculateCenteredYAxis(comparison, isLowerBetter(metricType));
    const baseScales = this.baseChartOptions?.scales || {};

    return {
      ...this.baseChartOptions,
      scales: {
        ...baseScales,
        y: { ...baseScales['y'], min, max },
      },
    };
  }
}
