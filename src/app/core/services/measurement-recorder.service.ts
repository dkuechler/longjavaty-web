import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  MeasurementRequest,
  MeasurementResponse,
  MeasurementType,
} from '../models/measurement.models';
import { HealthMetricsApiService } from '../services/health-metrics-api.service';

@Injectable({
  providedIn: 'root',
})
export class MeasurementRecorderService {
  private readonly apiService = inject(HealthMetricsApiService);

  recordMeasurement(
    measurementType: MeasurementType,
    value: number,
    recordedAt?: Date
  ): Observable<MeasurementResponse> {
    const request: MeasurementRequest = {
      measurementType,
      value,
      recordedAt: (recordedAt || new Date()).toISOString(),
      sourceId: crypto.randomUUID(),
    };

    return this.apiService.recordMeasurement(request);
  }

  recordMultipleMeasurements(
    measurements: Array<{ type: MeasurementType; value: number; recordedAt?: Date }>
  ): Observable<MeasurementResponse>[] {
    return measurements.map((m) => this.recordMeasurement(m.type, m.value, m.recordedAt));
  }

  recordHeartRate(value: number, recordedAt?: Date): Observable<MeasurementResponse> {
    return this.recordMeasurement(MeasurementType.HEART_RATE, value, recordedAt);
  }

  recordRestingHeartRate(value: number, recordedAt?: Date): Observable<MeasurementResponse> {
    return this.recordMeasurement(MeasurementType.RESTING_HEART_RATE, value, recordedAt);
  }

  recordVO2Max(value: number, recordedAt?: Date): Observable<MeasurementResponse> {
    return this.recordMeasurement(MeasurementType.VO2_MAX, value, recordedAt);
  }

  recordSteps(value: number, recordedAt?: Date): Observable<MeasurementResponse> {
    return this.recordMeasurement(MeasurementType.STEPS, value, recordedAt);
  }
}
