import { ChartConfiguration } from 'chart.js';

export const CHART_COLORS = {
  user: '#667eea',
  average: '#f59e0b',
  excellent: '#10b981',
  good: '#3b82f6',
  average_zone: '#f59e0b',
  below_average: '#ef4444',
  poor: '#dc2626',
  default: '#94a3b8',
} as const;

export const ZONE_DATASET_INDICES = {
  USER: 0,
  AVERAGE: 1,
  FIRST_ZONE: 2,
} as const;

/**
 * Create base Chart.js configuration options with custom tooltip callbacks.
 * Configures responsive behavior, interaction modes, and visual styling.
 * @param tooltipLabelCallback - Function to format tooltip label text
 * @param tooltipColorCallback - Function to determine tooltip color based on context
 * @returns Chart.js configuration options object
 */
export function createBaseChartOptions(
  tooltipLabelCallback: (context: any) => string,
  tooltipColorCallback: (context: any) => { borderColor: string; backgroundColor: string }
): ChartConfiguration['options'] {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: CHART_COLORS.user,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: tooltipLabelCallback,
          labelColor: tooltipColorCallback,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', displayFormats: { day: 'MMM d' } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
        grace: '20%',
      },
    },
  };
}
