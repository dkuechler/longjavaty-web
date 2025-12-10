import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MeasurementType, MetricSeries } from '../../../core/models/measurement.models';
import { HealthMetricsApiService } from '../../../core/services/health-metrics-api.service';
import { MockHealthDataService } from '../../../core/services/mock-health-data.service';
import { MeasurementTransformer } from '../../../core/utils/measurement-transformer';
import { environment } from '@env/environment';


@Injectable({
  providedIn: 'root',
})
export class HealthMetricsStateService {
  private readonly apiService = inject(HealthMetricsApiService);
  private readonly mockDataService = inject(MockHealthDataService);
  private allMetricsSubject = new BehaviorSubject<MetricSeries[]>([]);
  public allMetrics$ = this.allMetricsSubject.asObservable();

  loadAllMetrics(from?: string, to?: string): void {
    const allTypes = Object.values(MeasurementType);

    if (environment.bypassAuth) {
      const mockRequests = allTypes.map((type) => this.mockDataService.generateMockData(type));
      forkJoin(mockRequests).subscribe({
        next: (measurementArrays) => {
          const series = MeasurementTransformer.toMultipleMetricSeries(allTypes, measurementArrays);
          this.allMetricsSubject.next(series);
        },
        error: (error) => console.error('Error loading mock measurements:', error),
      });
      return;
    }

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
