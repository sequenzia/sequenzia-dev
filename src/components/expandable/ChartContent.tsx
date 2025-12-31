'use client';

import { memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { chartEntrance } from '@/lib/motion';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { ChartContentData } from '@/types';

interface ChartContentProps {
  content: ChartContentData;
  messageId?: string;
}

// Default colors for chart series
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const CHART_HEIGHT = 300;

export const ChartContent = memo(function ChartContent({
  content,
}: ChartContentProps) {
  // Generate chart config
  const chartConfig = useMemo<ChartConfig>(() => {
    return {
      value: {
        label: 'Value',
        color: CHART_COLORS[0],
      },
    };
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={chartEntrance}
      onClick={(e) => e.stopPropagation()}
      className="space-y-3 rounded-lg border bg-card p-4"
    >
      {/* Header */}
      <div>
        <h4 className="font-medium text-base flex items-center gap-2">
          {content.title}
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </h4>
        {content.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {content.description}
          </p>
        )}
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="w-full">
        <div style={{ height: CHART_HEIGHT }}>
          {content.chartType === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={content.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[0] }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {content.chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={content.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill={CHART_COLORS[0]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {content.chartType === 'area' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={content.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS[0]}
                  fill={CHART_COLORS[0]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {content.chartType === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={content.data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={CHART_HEIGHT / 3}
                  label
                >
                  {content.data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartContainer>

      {/* Legend for pie charts */}
      {content.chartType === 'pie' && (
        <div className="flex flex-wrap gap-2 justify-center">
          {content.data.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});
