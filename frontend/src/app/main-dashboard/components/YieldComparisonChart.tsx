'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Icon from '@/components/ui/AppIcon';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  season: string;
  predicted: number;
  actual: number;
}

interface YieldComparisonChartProps {
  data: ChartData[];
}

const YieldComparisonChart = ({ data }: YieldComparisonChartProps) => {
  const chartData = {
    labels: data.map((item) => item.season),
    datasets: [
      {
        label: 'Predicted',
        data: data.map((item) => item.predicted),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.6)');
          return gradient;
        },
        borderColor: '#10B981',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Actual',
        data: data.map((item) => item.actual),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(14, 165, 233, 0.9)');
          gradient.addColorStop(1, 'rgba(14, 165, 233, 0.6)');
          return gradient;
        },
        borderColor: '#0EA5E9',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter',
            size: 13,
            weight: 600,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: 'Poppins',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} quintals`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false,
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12,
          },
          callback: function (value: any) {
            return value + ' q';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-emerald-700/10 p-2 rounded-lg">
          <Icon name="ChartBarIcon" size={24} className="text-emerald-700" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground">
          Yield Comparison
        </h2>
      </div>
      <div className="w-full h-80">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

export default YieldComparisonChart;