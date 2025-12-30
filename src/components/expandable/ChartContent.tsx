'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChartContentData } from '@/types';

interface ChartContentProps {
  content: ChartContentData;
  displayMode: 'preview' | 'partial' | 'full';
  messageId: string;
}

// Default colors for chart series
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const ChartContent = memo(function ChartContent({
  content,
  displayMode,
  messageId,
}: ChartContentProps) {
  // Generate chart config from content
  const chartConfig = useMemo<ChartConfig>(() => {
    if (content.config) {
      return Object.entries(content.config).reduce((acc, [key, value], index) => {
        acc[key] = {
          label: value.label,
          color: value.color || CHART_COLORS[index % CHART_COLORS.length],
        };
        return acc;
      }, {} as ChartConfig);
    }

    // Default config based on yKey
    return {
      [content.yKey]: {
        label: content.yKey,
        color: CHART_COLORS[0],
      },
    };
  }, [content.config, content.yKey]);

  // Preview mode - just show icon and title
  if (displayMode === 'preview') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <BarChart2 className="w-4 h-4" />
        <span className="text-sm">{content.title}</span>
        <Badge variant="secondary" className="text-xs capitalize">
          {content.chartType}
        </Badge>
      </div>
    );
  }

  const height = displayMode === 'partial' ? 150 : 300;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="space-y-3"
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
      <ChartContainer config={chartConfig} className={cn('w-full', `h-[${height}px]`)}>
        <div style={{ height }}>
          {content.chartType === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={content.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--chart-grid)]" />
                <XAxis
                  dataKey={content.xKey}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-[var(--chart-axis)]"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-[var(--chart-axis)]"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey={content.yKey}
                  stroke={chartConfig[content.yKey]?.color || CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={{ fill: chartConfig[content.yKey]?.color || CHART_COLORS[0] }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {content.chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={content.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--chart-grid)]" />
                <XAxis
                  dataKey={content.xKey}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={content.yKey}
                  fill={chartConfig[content.yKey]?.color || CHART_COLORS[0]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {content.chartType === 'area' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={content.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--chart-grid)]" />
                <XAxis
                  dataKey={content.xKey}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey={content.yKey}
                  stroke={chartConfig[content.yKey]?.color || CHART_COLORS[0]}
                  fill={chartConfig[content.yKey]?.color || CHART_COLORS[0]}
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
                  dataKey={content.yKey}
                  nameKey={content.xKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={height / 3}
                  label={displayMode === 'full'}
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

      {/* Legend (in full mode) */}
      {displayMode === 'full' && content.chartType === 'pie' && (
        <div className="flex flex-wrap gap-2 justify-center">
          {content.data.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span>{String(item[content.xKey])}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});
