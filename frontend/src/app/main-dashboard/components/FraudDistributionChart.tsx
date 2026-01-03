'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Icon from '@/components/ui/AppIcon';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface FraudData {
  category: string;
  value: number;
  color: string;
}

interface FraudDistributionChartProps {
  data: FraudData[];
}

const FraudDistributionChart = ({ data }: FraudDistributionChartProps) => {
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 15,
        hoverBorderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
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
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
    cutout: '65%',
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-emerald-700/10 p-2 rounded-lg">
          <Icon name="ShieldCheckIcon" size={24} className="text-emerald-700" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground">Fraud Detection</h2>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="w-full lg:w-1/2 h-64 relative">
          <Doughnut options={options} data={chartData} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-heading font-bold text-foreground">{total}%</span>
            <span className="text-sm text-text-secondary font-body">Total Claims</span>
          </div>
        </div>
        <div className="w-full lg:w-1/2 space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-body text-foreground font-medium">{item.category}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-heading font-bold text-foreground">{item.value}%</span>
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: item.color,
                      width: `${item.value}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FraudDistributionChart;
