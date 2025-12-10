import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Observable } from 'rxjs';
import { HealthMetricsStateService } from '../../data/health-metrics-state.service';
import { MetricSeries, MeasurementType } from '../../../../core/models/measurement.models';
import { createDashboardChartOptions } from './dashboard-chart-config';
import { createChartDatasets, highlightDataset, resetDatasetHighlight, ChartDataset } from './dashboard-chart-utils';

Chart.register(...registerables);

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './metrics-dashboard.component.html',
  styleUrl: './metrics-dashboard.component.css',
})
export class MetricsDashboardComponent implements OnInit {
  private readonly metricsState = inject(HealthMetricsStateService);

  allMetrics$: Observable<MetricSeries[]>;
  hoveredMetric = signal<MeasurementType | null>(null);
  selectedFilter = signal<'all' | MeasurementType>('all');
  allMetricsData = signal<MetricSeries[]>([]);

  filteredMetrics = computed(() => {
    return this.allMetricsData().filter((metric) => {
      if (this.selectedFilter() === 'all') return true;
      return metric.measurementType === this.selectedFilter();
    });
  });

  lineChartData = signal<ChartConfiguration['data']>({ datasets: [] });
  lineChartOptions = signal<ChartConfiguration['options']>(createDashboardChartOptions());
  lineChartType: ChartType = 'line';

  constructor() {
    this.allMetrics$ = this.metricsState.allMetrics$;

    effect(() => {
      const filtered = this.filteredMetrics();
      this.updateChartData(filtered);
    });
  }

  ngOnInit(): void {
    this.metricsState.loadAllMetrics();
    this.allMetrics$.subscribe((metrics) => {
      this.allMetricsData.set(metrics);
    });
  }

  private updateChartData(metrics: MetricSeries[]): void {
    const datasets = createChartDatasets(metrics);
    this.lineChartData.set({ datasets });
  }

  onMetricHover(metricType: MeasurementType): void {
    this.hoveredMetric.set(metricType);
    const currentData = this.lineChartData();
    const datasets = highlightDataset(currentData.datasets as ChartDataset[], metricType);
    this.lineChartData.set({ datasets });
  }

  onMetricLeave(): void {
    this.hoveredMetric.set(null);
    const currentData = this.lineChartData();
    const datasets = resetDatasetHighlight(currentData.datasets as ChartDataset[]);
    this.lineChartData.set({ datasets });
  }

  isMetricHovered(metricType: MeasurementType): boolean {
    return this.hoveredMetric() === metricType;
  }

  setFilter(filter: 'all' | MeasurementType): void {
    this.selectedFilter.set(filter);
  }

  isFilterActive(filter: 'all' | MeasurementType): boolean {
    return this.selectedFilter() === filter;
  }
}
