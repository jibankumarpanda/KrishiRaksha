'use client';

import { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FraudData {
  category: string;
  value: number;
  color: string;
}

interface FraudDistributionChartProps {
  data: FraudData[];
}

const FraudDistributionChart = ({ data }: FraudDistributionChartProps) => {
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
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Draw doughnut
    let currentAngle = -Math.PI / 2;
    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, radius * 0.6, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center text
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('100%', centerX, centerY - 10);
    ctx.font = '14px Inter';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('Total Claims', centerX, centerY + 15);
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="ShieldCheckIcon" size={24} className="text-success" />
        <h2 className="text-xl font-heading font-bold text-foreground">Fraud Detection</h2>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="w-full lg:w-1/2 h-64">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="w-full lg:w-1/2 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-body text-foreground">{item.category}</span>
              </div>
              <span className="text-sm font-body font-bold text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FraudDistributionChart;
