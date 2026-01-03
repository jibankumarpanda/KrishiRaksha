'use client';

import { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ChartData {
  season: string;
  predicted: number;
  actual: number;
}

interface YieldComparisonChartProps {
  data: ChartData[];
}

const YieldComparisonChart = ({ data }: YieldComparisonChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Chart dimensions
    const padding = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Find max value
    const maxValue = Math.max(
      ...data.flatMap((d) => [d.predicted, d.actual])
    );
    const yScale = chartHeight / (maxValue * 1.2);

    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Y-axis labels
      const value = Math.round((maxValue * 1.2 * (5 - i)) / 5);
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding.left - 10, y + 4);
    }

    // Draw bars
    const barWidth = chartWidth / (data.length * 3);
    const groupWidth = barWidth * 2.5;

    data.forEach((item, index) => {
      const x = padding.left + index * groupWidth + barWidth * 0.5;

      // Predicted bar
      const predictedHeight = item.predicted * yScale;
      ctx.fillStyle = '#10B981';
      ctx.fillRect(
        x,
        padding.top + chartHeight - predictedHeight,
        barWidth * 0.8,
        predictedHeight
      );

      // Actual bar
      const actualHeight = item.actual * yScale;
      ctx.fillStyle = '#0EA5E9';
      ctx.fillRect(
        x + barWidth,
        padding.top + chartHeight - actualHeight,
        barWidth * 0.8,
        actualHeight
      );

      // X-axis labels
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(
        item.season,
        x + barWidth,
        padding.top + chartHeight + 20
      );
    });

    // Draw legend
    const legendY = padding.top - 20;
    ctx.fillStyle = '#10B981';
    ctx.fillRect(rect.width - 180, legendY, 16, 16);
    ctx.fillStyle = '#1F2937';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Predicted', rect.width - 160, legendY + 12);

    ctx.fillStyle = '#0EA5E9';
    ctx.fillRect(rect.width - 80, legendY, 16, 16);
    ctx.fillText('Actual', rect.width - 60, legendY + 12);
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="ChartBarIcon" size={24} className="text-primary" />
        <h2 className="text-xl font-heading font-bold text-foreground">Yield Comparison</h2>
      </div>
      <div className="w-full h-80">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default YieldComparisonChart;
