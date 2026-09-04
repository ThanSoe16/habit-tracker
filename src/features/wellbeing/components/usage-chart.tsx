'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = { minutes: { label: 'Screen time', color: 'var(--chart-1)' } } satisfies ChartConfig;

export interface UsageChartPoint {
  label: string;
  minutes: number;
}

export function UsageChart({ data }: { data: UsageChartPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: -24, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="minutes" fill="var(--color-minutes)" radius={[6, 6, 2, 2]} />
      </BarChart>
    </ChartContainer>
  );
}
