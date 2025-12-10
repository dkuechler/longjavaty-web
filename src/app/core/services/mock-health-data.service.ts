import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementResponse, MeasurementType } from '../models/measurement.models';

@Injectable({
  providedIn: 'root',
})
export class MockHealthDataService {
  generateMockData(measurementType: MeasurementType): Observable<MeasurementResponse[]> {
    const now = new Date();
    const mockData: MeasurementResponse[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Calculate progress factor: starts at 0 (30 days ago), ends at 1 (today)
      const progressFactor = (29 - i) / 29;
      const measurement = this.generateMeasurement(measurementType, date, mockData.length, progressFactor);
      mockData.push(measurement);
    }

    return of(mockData);
  }

  private generateMeasurement(
    measurementType: MeasurementType,
    date: Date,
    id: number,
    progressFactor: number
  ): MeasurementResponse {
    const baseConfig = this.getMeasurementConfig(measurementType);
    const variation = (Math.random() - 0.5) * baseConfig.variance * 0.5;
    
    // Calculate improvement based on metric type
    let improvement = 0;
    switch (measurementType) {
      case MeasurementType.RESTING_HEART_RATE:
        // Start higher, end lower (improvement)
        improvement = -15 * progressFactor; // Decrease by 15 bpm over 30 days
        break;
      case MeasurementType.VO2_MAX:
        // Start lower, end higher (improvement)
        improvement = 8 * progressFactor; // Increase by 8 ml/kg/min over 30 days
        break;
      case MeasurementType.STEPS:
        // Start lower, end higher (improvement)
        improvement = 4000 * progressFactor; // Increase by 4000 steps over 30 days
        break;
    }
    
    const value = Math.round(baseConfig.base + improvement + variation);

    return {
      id,
      userId: 'dev-user-123',
      measurementType,
      value,
      unit: baseConfig.unit,
      recordedAt: date.toISOString(),
      sourceId: 'mock-device',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    };
  }

  private getMeasurementConfig(measurementType: MeasurementType): {
    base: number;
    variance: number;
    unit: string;
  } {
    switch (measurementType) {
      case MeasurementType.RESTING_HEART_RATE:
        // Start at 75 (below average), end at ~60 (good)
        return { base: 75, variance: 8, unit: 'bpm' };
      case MeasurementType.VO2_MAX:
        // Start at 38 (below average), end at ~46 (good)
        return { base: 38, variance: 4, unit: 'ml/kg/min' };
      case MeasurementType.STEPS:
        // Start at 4000 (below average), end at ~8000 (good)
        return { base: 4000, variance: 1000, unit: 'steps' };
      default:
        return { base: 0, variance: 0, unit: 'unknown' };
    }
  }
}
