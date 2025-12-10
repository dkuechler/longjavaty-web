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

    // Generate 30 days of historical data (0-29 = 30 data points)
    // This represents a typical monthly view for health metrics tracking
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
    // All values represent realistic fitness improvements over a 30-day training period
    let improvement = 0;
    switch (measurementType) {
      case MeasurementType.RESTING_HEART_RATE:
        // 15 bpm reduction represents realistic cardiovascular improvement from consistent training
        // Research shows beginner/intermediate athletes can reduce RHR by 10-20 bpm over 4-8 weeks
        // Starting at 75 bpm (below average) and improving to ~60 bpm (good fitness level)
        improvement = -15 * progressFactor;
        break;
      case MeasurementType.VO2_MAX:
        // 8 ml/kg/min increase is achievable with structured cardio training
        // Studies indicate 5-15% improvement (or 2-8 ml/kg/min) is typical for sedentary individuals
        // who are starting a training program over 8-12 weeks. Starting at 38 (below average) to 46 (good)
        improvement = 8 * progressFactor;
        break;
      case MeasurementType.STEPS:
        // 4000 step increase represents gradual adoption of more active lifestyle
        // This doubles daily steps from 4000 (sedentary) to 8000 (moderately active)
        // Aligned with CDC recommendations of 8000-10000 steps per day for health benefits
        improvement = 4000 * progressFactor;
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
        // Base: 75 bpm is typical for an untrained adult (60-100 range is normal)
        // Variance: ±8 bpm reflects natural daily fluctuations (stress, hydration, sleep quality)
        // Target: ~60 bpm after improvement (athletic/well-trained range: 40-60)
        return { base: 75, variance: 8, unit: 'bpm' };
      case MeasurementType.VO2_MAX:
        // Base: 38 ml/kg/min is below average for adults (average: 35-40 for sedentary)
        // Variance: ±4 ml/kg/min accounts for measurement variability and daily performance
        // Target: ~46 ml/kg/min after improvement (good fitness: 42-51 for men, 33-42 for women)
        return { base: 38, variance: 4, unit: 'ml/kg/min' };
      case MeasurementType.STEPS:
        // Base: 4000 steps is sedentary (CDC: <5000 is sedentary lifestyle)
        // Variance: ±1000 steps represents day-to-day activity variation
        // Target: ~8000 steps after improvement (CDC recommended: 8000-10000 for health)
        return { base: 4000, variance: 1000, unit: 'steps' };
      default:
        return { base: 0, variance: 0, unit: 'unknown' };
    }
  }
}
