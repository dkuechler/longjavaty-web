export enum MeasurementType {
  RESTING_HEART_RATE = 'RESTING_HEART_RATE',
  VO2_MAX = 'VO2_MAX',
}

export interface MeasurementRequest {
  measurementType: MeasurementType;
  value: number;
  recordedAt: string;
  sourceId: string;
}

export interface MeasurementResponse {
  id: number;
  userId: string;
  measurementType: MeasurementType;
  value: number;
  unit: string;
  recordedAt: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementDataPoint {
  timestamp: Date;
  value: number;
  unit: string;
}

// Chart-ready format: all measurements of one type with metadata for visualization
export interface MetricSeries {
  measurementType: MeasurementType;
  label: string;
  color: string;
  data: MeasurementDataPoint[];
}

export const MEASUREMENT_TYPE_LABELS: Record<MeasurementType, string> = {
  [MeasurementType.RESTING_HEART_RATE]: 'Resting Heart Rate',
  [MeasurementType.VO2_MAX]: 'VO2 Max',
};

export const MEASUREMENT_TYPE_COLORS: Record<MeasurementType, string> = {
  [MeasurementType.RESTING_HEART_RATE]: '#f97316',
  [MeasurementType.VO2_MAX]: '#3b82f6',
};
