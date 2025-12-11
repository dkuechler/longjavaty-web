import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartDataset } from 'chart.js';
import { BenchmarkService } from '../../../../core/services/benchmark.service';
import { HealthMetricsStateService } from '../../data/health-metrics-state.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserComparison } from '../../../../core/models/benchmark.models';
import { MetricSeries, MeasurementType } from '../../../../core/models/measurement.models';
import { createBaseChartOptions } from './chart-config';
import { createUserDataset, createAverageDataset, createZoneDataset } from './chart-datasets';
import { getTooltipLabel, getTooltipColor } from './chart-tooltips';
import { RATING_COLORS, RATING_LABELS, METRIC_NAMES, METRIC_UNITS, isLowerBetter } from './metric-config';
import { calculateCenteredYAxis } from './chart-utils';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.css',
})
export class AnalysisComponent implements OnInit, OnDestroy {
  private readonly benchmarkService = inject(BenchmarkService);
  private readonly metricsState = inject(HealthMetricsStateService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  userAge = signal<number>(28); // Default fallback
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const age = this.authService.getUserAge();
    if (age) {
      this.userAge.set(age);
    }

    this.metricsState.loadAllMetrics();
    
    this.metricsState.allMetrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.allMetrics.set(metrics);
          this.loadComparisons(metrics);
        },
        error: (err) => {
          console.error('Error loading metrics:', err);
          this.loading.set(false);
        }
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
          this.userAge()
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
      error: (err) => {
        console.error('Error loading comparisons:', err);
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

  /**
   * Create zone datasets for metrics where lower values are better (e.g., resting heart rate).
   * Zones are ordered from best (athletic) at bottom to worst (needs improvement) at top.
   */
  private createLowerIsBetterZones(dates: Date[], percentiles: any): any[] {
    return [
      createZoneDataset('Athletic Range', dates, percentiles.p10, 'rgba(16, 185, 129, 0.2)', 'origin', 7),
      createZoneDataset('Excellent Range', dates, percentiles.p25, 'rgba(16, 185, 129, 0.15)', '-1', 6),
      createZoneDataset('Good Range', dates, percentiles.p50, 'rgba(59, 130, 246, 0.15)', '-1', 5),
      createZoneDataset('Average Range', dates, percentiles.p75, 'rgba(245, 158, 11, 0.15)', '-1', 4),
      createZoneDataset('Below Average', dates, percentiles.p90, 'rgba(239, 68, 68, 0.15)', '-1', 3),
      createZoneDataset('Needs Improvement', dates, percentiles.p90 + 10, 'rgba(220, 38, 38, 0.15)', '-1', 2),
    ];
  }

  /**
   * Create zone datasets for metrics where higher values are better (e.g., VO2 max).
   * Zones are ordered from worst (needs improvement) at bottom to best (outstanding) at top.
   */
  private createHigherIsBetterZones(dates: Date[], percentiles: any): any[] {
    return [
      createZoneDataset('Needs Improvement', dates, percentiles.p10, 'rgba(220, 38, 38, 0.15)', 'origin', 7),
      createZoneDataset('Below Average', dates, percentiles.p25, 'rgba(239, 68, 68, 0.15)', '-1', 6),
      createZoneDataset('Average Range', dates, percentiles.p50, 'rgba(245, 158, 11, 0.15)', '-1', 5),
      createZoneDataset('Good Range', dates, percentiles.p75, 'rgba(59, 130, 246, 0.15)', '-1', 4),
      createZoneDataset('Excellent Range', dates, percentiles.p90, 'rgba(16, 185, 129, 0.15)', '-1', 3),
      createZoneDataset('Outstanding', dates, percentiles.p90 + 10, 'rgba(16, 185, 129, 0.2)', '-1', 2),
    ];
  }

  getChartData(metricType: MeasurementType): ChartConfiguration<'line'>['data'] {
    const metric = this.allMetrics().find(m => m.measurementType === metricType);
    if (!metric || metric.data.length === 0) return { datasets: [] };

    const comparison = this.comparisons().find(c => c.metricType === metricType);
    if (!comparison) return { datasets: [] };

    const { percentiles, average } = comparison;
    const dates = metric.data.map(d => d.timestamp);
    const isLower = isLowerBetter(metricType);

    const zoneDatasets = isLower 
      ? this.createLowerIsBetterZones(dates, percentiles)
      : this.createHigherIsBetterZones(dates, percentiles);

    return {
      labels: dates,
      datasets: [
        createUserDataset(metric),
        createAverageDataset(dates, average),
        ...zoneDatasets,
      ],
    };
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
