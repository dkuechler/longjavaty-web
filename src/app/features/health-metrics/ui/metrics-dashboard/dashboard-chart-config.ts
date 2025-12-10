import { ChartConfiguration } from 'chart.js';

export function createDashboardChartOptions(): ChartConfiguration['options'] {
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: { day: 'MMM d' },
        },
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } },
        title: {
          display: true,
          text: 'Heart Rate (bpm) / VO2 Max',
          font: { size: 11 },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: false,
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 11 } },
        title: {
          display: true,
          text: 'Steps',
          font: { size: 11 },
        },
      },
    },
  };
}
