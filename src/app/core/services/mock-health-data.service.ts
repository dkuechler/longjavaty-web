import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MeasurementResponse, MeasurementType } from '../models/measurement.models';
import { MOCK_CONFIG } from '@env/mock-config';

@Injectable({
  providedIn: 'root',
})
export class MockHealthDataService {
  generateMockData(measurementType: MeasurementType): Observable<MeasurementResponse[]> {
    const now = new Date();
    const mockData: MeasurementResponse[] = [];
    
    // Generate data for 3-6 months (90-180 days) with realistic gaps
    const totalDays = 365 + Math.floor(Math.random() * 365); // 365-730 days

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // More realistic measurement patterns:
      // - Higher frequency in recent weeks (2-3 times per week)
      // - Medium frequency in past month (1-2 times per week) 
      // - Lower frequency in older data (1-2 times per month)
      const daysSinceStart = totalDays - 1 - i;
      const progressFactor = daysSinceStart / (totalDays - 1);
      
      let measurementProbability: number;
      if (i <= 14) {
        // Last 2 weeks: 40-60% chance (2-4 times per week)
        measurementProbability = 0.4 + Math.random() * 0.2;
      } else if (i <= 30) {
        // Last month: 20-35% chance (1-2 times per week)
        measurementProbability = 0.2 + Math.random() * 0.15;
      } else if (i <= 60) {
        // Last 2 months: 10-20% chance (few times per month)
        measurementProbability = 0.1 + Math.random() * 0.1;
      } else {
        // Older data: 5-15% chance (sparse measurements)
        measurementProbability = 0.05 + Math.random() * 0.1;
      }
      
      if (Math.random() > measurementProbability) {
        continue; // Skip this day
      }

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
    
    // Daily variation (natural fluctuations)
    const dailyVariation = (Math.random() - 0.5) * baseConfig.variance;
    
    // Realistic non-linear improvement with plateaus
    // Most improvement happens in first 2-3 months, then plateaus
    // Using a logarithmic curve for more realistic fitness adaptation
    const improvementCurve = Math.log(1 + progressFactor * 9) / Math.log(10); // 0 to ~1
    
    // Add some plateaus and slight regressions for realism
    const weekNumber = Math.floor(progressFactor * 20); // ~20 weeks in 4-6 months
    const plateauNoise = Math.sin(weekNumber * 0.7) * 0.15; // Cyclical plateaus
    const effectiveProgress = Math.max(0, Math.min(1, improvementCurve + plateauNoise));
    
    let improvement = 0;
    switch (measurementType) {
      case MeasurementType.RESTING_HEART_RATE:
        // Realistic: 5-8 bpm improvement over 4-6 months with consistent training
        // Start at 75 bpm (untrained), end around 68-70 bpm (moderately trained)
        improvement = -7 * effectiveProgress;
        break;
      case MeasurementType.VO2_MAX:
        // Realistic: 4-6 ml/kg/min improvement over 4-6 months for sedentary to moderate
        // Start at 38 ml/kg/min (below average), end around 43-44 ml/kg/min (average)
        improvement = 5 * effectiveProgress;
        break;
    }
    
    const value = Math.round(baseConfig.base + improvement + dailyVariation);

    return {
      id,
      userId: MOCK_CONFIG.userId,
      measurementType,
      value,
      unit: baseConfig.unit,
      recordedAt: date.toISOString(),
      sourceId: MOCK_CONFIG.deviceId,
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
        // Start at 75 bpm (untrained), realistic improvement to ~68-70 bpm over 4-6 months
        // Variance: 3-5 bpm is typical daily fluctuation
        return { base: 75, variance: 4, unit: 'bpm' };
      case MeasurementType.VO2_MAX:
        // Start at 38 ml/kg/min (below average), realistic improvement to ~43 ml/kg/min
        // Variance: 1-2 ml/kg/min is typical measurement variation
        return { base: 38, variance: 2, unit: 'ml/kg/min' };
      default:
        return { base: 0, variance: 0, unit: 'unknown' };
    }
  }
}
