import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthMetricsStateService } from '../../data/health-metrics-state.service';
import { MetricSeries } from '../../../../core/models/measurement.models';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-dashboard.component.html',
  styleUrl: './metrics-dashboard.component.css',
})
export class MetricsDashboardComponent implements OnInit {
  private readonly metricsState = inject(HealthMetricsStateService);
  private readonly authService = inject(AuthService);

  allMetrics$: Observable<MetricSeries[]>;

  constructor() {
    this.allMetrics$ = this.metricsState.allMetrics$;
  }

  ngOnInit(): void {
    this.metricsState.loadAllMetrics();
  }
}
