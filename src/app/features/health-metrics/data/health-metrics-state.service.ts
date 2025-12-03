import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MeasurementType, MetricSeries } from '../../../core/models/measurement.models';
import { HealthMetricsApiService } from '../../../core/services/health-metrics-api.service';
import { MeasurementTransformer } from '../../../core/utils/measurement-transformer';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class HealthMetricsStateService {
  private readonly apiService = inject(HealthMetricsApiService);
  private readonly authService = inject(AuthService);

  private allMetricsSubject = new BehaviorSubject<MetricSeries[]>([]);
  public allMetrics$ = this.allMetricsSubject.asObservable();

  loadAllMetrics(from?: string, to?: string): void {
    const allTypes = Object.values(MeasurementType);

    this.apiService.getMeasurementsForTypes(allTypes, from, to).subscribe({
      next: (measurementArrays) => {
        const series = MeasurementTransformer.toMultipleMetricSeries(allTypes, measurementArrays);
        this.allMetricsSubject.next(series);
      },
      error: (error) => console.error('Error loading measurements:', error),
    });
  }

  loadMetricByType(measurementType: MeasurementType, from?: string, to?: string): Observable<MetricSeries> {
    return this.apiService
      .getMeasurements(measurementType, from, to)
      .pipe(map((measurements) => MeasurementTransformer.toMetricSeries(measurementType, measurements)));
  }

  getMetricByType(measurementType: MeasurementType): Observable<MetricSeries | undefined> {
    return this.allMetrics$.pipe(
      map((series) => series.find((s) => s.measurementType === measurementType))
    );
  }
}
