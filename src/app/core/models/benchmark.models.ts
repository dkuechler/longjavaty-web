import { MeasurementType } from './measurement.models';

export interface AgeGroupBenchmark {
  ageGroup: string;
  ageMin: number;
  ageMax: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  average: number;
  unit: string;
}

export interface MetricBenchmark {
  metricType: MeasurementType;
  metricName: string;
  gender: 'male' | 'female' | 'all';
  ageGroups: AgeGroupBenchmark[];
}

export interface UserComparison {
  metricType: MeasurementType;
  userValue: number;
  ageGroup: string;
  percentile: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  average: number;
  difference: number;
  differencePercentage: number;
  rating: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
}
