import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthMetricsStateService } from '../../data/health-metrics-state.service';
import { MetricSeries } from '../../../../core/models/measurement.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-dashboard.component.html',
  styleUrl: './metrics-dashboard.component.css',
})
export class MetricsDashboardComponent implements OnInit {
  allMetrics$: Observable<MetricSeries[]>;

  constructor(private metricsState: HealthMetricsStateService) {
    this.allMetrics$ = this.metricsState.allMetrics$;
  }

  ngOnInit(): void {
    // TODO: Get actual user ID from auth service
    const mockUserId = '00000000-0000-0000-0000-000000000000';
    this.metricsState.loadAllMetrics(mockUserId);
  }
}
