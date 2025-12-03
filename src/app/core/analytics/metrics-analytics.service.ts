import { Injectable } from '@angular/core';
import { MeasurementDataPoint } from '../models/measurement.models';

@Injectable({
  providedIn: 'root',
})
export class MetricsAnalyticsService {
  calculateAverage(dataPoints: MeasurementDataPoint[]): number {
    if (dataPoints.length === 0) return 0;
    const sum = dataPoints.reduce((acc, point) => acc + point.value, 0);
    return sum / dataPoints.length;
  }

  getLatestValue(dataPoints: MeasurementDataPoint[]): number | null {
    if (dataPoints.length === 0) return null;
    return dataPoints[dataPoints.length - 1].value;
  }

  getRange(dataPoints: MeasurementDataPoint[]): { min: number; max: number } | null {
    if (dataPoints.length === 0) return null;
    const values = dataPoints.map((p) => p.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  // TODO: calculateTrend, detectAnomalies, calculateMovingAverage, correlateMetrics
}
