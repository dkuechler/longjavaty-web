import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MeasurementType, MetricSeries } from '../../../core/models/measurement.models';
import { HealthMetricsApiService } from '../../../core/services/health-metrics-api.service';
import { MeasurementTransformer } from '../../../core/utils/measurement-transformer';

@Injectable({
  providedIn: 'root',
})
export class HealthMetricsStateService {
  private allMetricsSubject = new BehaviorSubject<MetricSeries[]>([]);
  public allMetrics$ = this.allMetricsSubject.asObservable();

  constructor(private apiService: HealthMetricsApiService) {}

  // Fetches all measurement types in parallel, then transforms each array into a MetricSeries
  loadAllMetrics(userId: string): void {
    const allTypes = Object.values(MeasurementType);

    this.apiService.getAllMeasurements(userId).subscribe({
      next: (measurementArrays) => {
        const series = MeasurementTransformer.toMultipleMetricSeries(allTypes, measurementArrays);
        this.allMetricsSubject.next(series);
      },
      error: (error) => console.error('Error loading measurements:', error),
    });
  }

  loadMetricByType(userId: string, measurementType: MeasurementType): Observable<MetricSeries> {
    return this.apiService
      .getMeasurementsByType(userId, measurementType)
      .pipe(map((measurements) => MeasurementTransformer.toMetricSeries(measurementType, measurements)));
  }

  getMetricByType(measurementType: MeasurementType): Observable<MetricSeries | undefined> {
    return this.allMetrics$.pipe(
      map((series) => series.find((s) => s.measurementType === measurementType))
    );
  }
}
