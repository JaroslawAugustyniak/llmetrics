'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const data = [{ name: 'Score', value: score }];
  const heights: Record<string, number> = { sm: 200, md: 280, lg: 360 };
  const height = heights[size] || 280;

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill={getColor(score)}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-5xl font-bold" style={{ color: getColor(score) }}>
          {score}
        </p>
        <p className="text-gray-600 mt-2">LLM Visibility Score</p>
      </div>
    </div>
  );
}
