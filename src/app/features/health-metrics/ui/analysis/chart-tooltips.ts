import { CHART_COLORS, ZONE_DATASET_INDICES } from './chart-config';

export function getTooltipLabel(context: any): string {
  const label = context.dataset.label || '';
  const value = context.parsed.y;
  
  if (!isZoneDataset(label)) return `${label}: ${value}`;

  const { datasetIndex, dataIndex, chart } = context;
  const datasets = chart.data.datasets;

  if (datasetIndex === ZONE_DATASET_INDICES.FIRST_ZONE) {
    return `${label}: <${value}`;
  }

  if (datasetIndex === datasets.length - 1) {
    const prevValue = (datasets[datasetIndex - 1].data[dataIndex] as any).y;
    return `${label}: >${prevValue}`;
  }

  const prevValue = (datasets[datasetIndex - 1].data[dataIndex] as any).y;
  return `${label}: ${prevValue}-${value}`;
}

export function getTooltipColor(context: any): { borderColor: string; backgroundColor: string } {
  const { datasetIndex, chart } = context;
  const datasets = chart.data.datasets;
  const isLowerBetter = datasets.length > 6;

  if (datasetIndex === ZONE_DATASET_INDICES.USER) {
    return createColorPair(CHART_COLORS.user);
  }
  if (datasetIndex === ZONE_DATASET_INDICES.AVERAGE) {
    return createColorPair(CHART_COLORS.average);
  }

  const zoneColors = isLowerBetter
    ? [CHART_COLORS.excellent, CHART_COLORS.excellent, CHART_COLORS.good, CHART_COLORS.average_zone, CHART_COLORS.below_average, CHART_COLORS.poor]
    : [CHART_COLORS.poor, CHART_COLORS.below_average, CHART_COLORS.average_zone, CHART_COLORS.good, CHART_COLORS.excellent, CHART_COLORS.excellent];

  const zoneIndex = datasetIndex - ZONE_DATASET_INDICES.FIRST_ZONE;
  return createColorPair(zoneColors[zoneIndex] || CHART_COLORS.default);
}

function isZoneDataset(label: string): boolean {
  return label.includes('Range') || label.includes('Average') || 
         label.includes('Improvement') || label.includes('Below Average') || 
         label.includes('Athletic') || label.includes('Outstanding');
}

function createColorPair(color: string): { borderColor: string; backgroundColor: string } {
  return { borderColor: color, backgroundColor: color };
}
