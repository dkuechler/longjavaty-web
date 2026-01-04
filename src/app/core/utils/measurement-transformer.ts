import {
  MeasurementResponse,
  MeasurementType,
  MetricSeries,
  MeasurementDataPoint,
  MEASUREMENT_TYPE_LABELS,
  MEASUREMENT_TYPE_COLORS,
} from '../models/measurement.models';

export class MeasurementTransformer {
  static toMetricSeries(
    measurementType: MeasurementType,
    measurements: MeasurementResponse[]
  ): MetricSeries {
    return {
      measurementType,
      label: MEASUREMENT_TYPE_LABELS[measurementType],
      color: MEASUREMENT_TYPE_COLORS[measurementType],
      data: this.toDataPoints(measurements),
    };
  }

  // Zips parallel API responses with their types: [VO2_MAX[], RESTING_HEART_RATE[]] → [VO2_MAX series, RESTING_HEART_RATE series]
  static toMultipleMetricSeries(
    measurementTypes: MeasurementType[],
    measurementArrays: MeasurementResponse[][]
  ): MetricSeries[] {
    return measurementTypes.map((type, index) =>
      this.toMetricSeries(type, measurementArrays[index])
    );
  }

  private static toDataPoints(measurements: MeasurementResponse[]): MeasurementDataPoint[] {
    return measurements
      .map((m) => ({
        timestamp: new Date(m.recordedAt),
        value: m.value,
        unit: m.unit,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
