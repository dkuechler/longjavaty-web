export enum MeasurementType {
  HEART_RATE = 'HEART_RATE',
  RESTING_HEART_RATE = 'RESTING_HEART_RATE',
  VO2_MAX = 'VO2_MAX',
  STEPS = 'STEPS',
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
  [MeasurementType.HEART_RATE]: 'Heart Rate',
  [MeasurementType.RESTING_HEART_RATE]: 'Resting Heart Rate',
  [MeasurementType.VO2_MAX]: 'VO2 Max',
  [MeasurementType.STEPS]: 'Steps',
};

export const MEASUREMENT_TYPE_COLORS: Record<MeasurementType, string> = {
  [MeasurementType.HEART_RATE]: '#ef4444',
  [MeasurementType.RESTING_HEART_RATE]: '#f97316',
  [MeasurementType.VO2_MAX]: '#3b82f6',
  [MeasurementType.STEPS]: '#10b981',
};
